import { requireAuthor } from '@/features/auth/server/session.server';
import {
    aiDraftSchema,
    extractInputSchema,
    generateInputSchema,
    imageInputSchema,
    inlineImageInputSchema,
    type AiDraft,
} from '@/features/ai/shared/schema';
import { createCloudflareImage, createCloudflareText } from '@/lib/ai/cloudflare';
import { putMedia } from '@/lib/media.server';
import { chat, generateImage } from '@tanstack/ai';
import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';

const VOICE = `You write for TipsToTreat, a personal site where one author writes down her own home remedies, health tips, recipes, and longer articles from everyday life.
Voice: warm, plain, first person ("I"), the way she would tell a neighbour. No hype, no miracle claims, no medical jargon.
Stay true to the topic the author gives; do not steer everything towards food or the kitchen. When ingredients are involved they are ordinary household items, named in English (a common Hindi name may follow in brackets when it helps).
Remedies and tips must include a caution: when to stop and see a doctor. Never claim to cure anything.
Recipes get prep and cook minutes and servings; remedies and tips leave those null or empty.
Articles are long-form posts of at least 900 words (aim for 1000 to 1500) with ## section headings, written as a personal essay from the kitchen: a season, a habit, a story behind a remedy, what the family eats when. Articles have no ingredients, steps, or caution (return empty arrays and strings) unless the piece genuinely needs a short list.
Keep steps as short imperative sentences, one action each. Keep the summary to one or two sentences.`;

const MODEL_OPTIONS = { max_tokens: 3000, temperature: 0.4 };
const ARTICLE_OPTIONS = { max_tokens: 6000, temperature: 0.6 };

/** Structured output occasionally comes back as malformed JSON; one retry fixes most of those. */
async function draftWithRetry(run: () => Promise<AiDraft>): Promise<AiDraft> {
    try {
        return await run();
    } catch (error) {
        if (error instanceof Error && /parse structured output/i.test(error.message)) {
            return run();
        }
        throw error;
    }
}

function normalize(draft: AiDraft): AiDraft {
    const isRecipe = draft.kind === 'recipe';
    return {
        ...draft,
        title: draft.title.trim(),
        useFor: draft.useFor.trim(),
        summary: draft.summary.trim(),
        ingredients: draft.ingredients
            .map(item => ({ name: item.name.trim(), quantity: item.quantity.trim() }))
            .filter(item => item.name),
        steps: draft.steps.map(step => step.trim()).filter(Boolean),
        tags: [...new Set(draft.tags.map(tag => tag.trim().toLowerCase()).filter(Boolean))].slice(
            0,
            8
        ),
        caution: isRecipe ? '' : draft.caution.trim(),
        prepMinutes: isRecipe ? draft.prepMinutes : null,
        cookMinutes: isRecipe ? draft.cookMinutes : null,
        servings: isRecipe ? draft.servings.trim() : '',
    };
}

/** Generate a complete draft entry from a short brief. */
export const aiGenerateEntryServerFn = createServerFn({ method: 'POST' })
    .validator(generateInputSchema)
    .handler(async ({ data }) => {
        await requireAuthor();
        const draft = await draftWithRetry(() =>
            chat({
                adapter: createCloudflareText(data.model, { binding: env.AI }),
                systemPrompts: [VOICE],
                messages: [
                    {
                        role: 'user',
                        content:
                            data.kind === 'article'
                                ? `Write a full article for the site: at least 900 words in the body field, aim for 1000 to 1500, with ## headings and a proper ending. Brief from the author: ${data.brief}\nReturn every field. The kind must be "article".`
                                : `Write a new ${data.kind} for the site. Brief from the author: ${data.brief}\nReturn every field. The kind must be "${data.kind}".`,
                    },
                ],
                outputSchema: aiDraftSchema,
                modelOptions: data.kind === 'article' ? ARTICLE_OPTIONS : MODEL_OPTIONS,
            })
        );
        return normalize({ ...draft, kind: data.kind });
    });

/** Turn pasted text (a WhatsApp message, a note, a recipe from anywhere) into a draft entry. */
export const aiExtractEntryServerFn = createServerFn({ method: 'POST' })
    .validator(extractInputSchema)
    .handler(async ({ data }) => {
        await requireAuthor();
        const draft = await draftWithRetry(() =>
            chat({
                adapter: createCloudflareText(data.model, { binding: env.AI }),
                systemPrompts: [
                    VOICE,
                    'You are filling in a form from text the author pasted. Keep her facts, quantities, and steps exactly; do not invent ingredients or steps that are not there. Rewrite only for clarity and the site voice. Decide the kind from the content. The title names the remedy, tip, or dish only; never mention who sent the text or where it came from.',
                ],
                messages: [
                    { role: 'user', content: `Text to turn into an entry:\n\n${data.text}` },
                ],
                outputSchema: aiDraftSchema,
                modelOptions: MODEL_OPTIONS,
            })
        );
        return normalize(draft);
    });

/** A default picture description from the entry itself, used when the author writes none. */
function describeScene(data: {
    kind: string;
    title: string;
    ingredients: string[];
    useFor?: string;
    summary?: string;
}) {
    const context = [data.useFor, data.summary].filter(Boolean).join('. ');
    if (data.kind === 'recipe')
        return `${data.title}, the finished dish, plated simply. ${context}`;
    if (data.ingredients.length > 0) {
        return `A still life of what is needed for "${data.title}": ${data.ingredients.slice(0, 5).join(', ')}. ${context}`;
    }
    return `A calm, literal scene that represents "${data.title}". ${context}. Show the objects, place, or setting the subject is about.`;
}

/** House style appended to every image prompt. Deliberately neutral about subject matter. */
const IMAGE_STYLE =
    'Photorealistic editorial photograph, natural light, calm composition, shallow depth of field, muted colours, real textures. No people, no hands, no faces, no text, no letters, no logos, no watermark.';

/** Generate a cover image, store it in R2, and return its URL. */
export const aiGenerateImageServerFn = createServerFn({ method: 'POST' })
    .validator(imageInputSchema)
    .handler(async ({ data }) => {
        await requireAuthor();
        const prompt = `${data.prompt?.trim() || describeScene(data)} ${IMAGE_STYLE}`.trim();
        const result = await generateImage({
            adapter: createCloudflareImage(data.model, { binding: env.AI }),
            prompt,
            numberOfImages: 1,
        });
        const image = result.images[0];
        if (!image?.b64Json) throw new Error('The model returned no image. Try again.');
        const bytes = Uint8Array.from(atob(image.b64Json), c => c.charCodeAt(0));
        const { url } = await putMedia(bytes, 'image/png', 'generated');
        return { url, prompt };
    });

/** Generate an image for the editor from the author's own description, in the house style. */
export const aiGenerateInlineImageServerFn = createServerFn({ method: 'POST' })
    .validator(inlineImageInputSchema)
    .handler(async ({ data }) => {
        await requireAuthor();
        const result = await generateImage({
            adapter: createCloudflareImage(data.model, { binding: env.AI }),
            prompt: `${data.prompt}. ${IMAGE_STYLE}`,
            numberOfImages: 1,
        });
        const image = result.images[0];
        if (!image?.b64Json) throw new Error('The model returned no image. Try again.');
        const bytes = Uint8Array.from(atob(image.b64Json), c => c.charCodeAt(0));
        const { url } = await putMedia(bytes, 'image/png', 'generated');
        return { url };
    });
