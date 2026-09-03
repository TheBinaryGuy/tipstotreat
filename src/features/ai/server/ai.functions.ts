import { requireAuthor } from '@/features/auth/server/session.server';
import {
    aiDraftSchema,
    extractInputSchema,
    generateInputSchema,
    imageInputSchema,
    type AiDraft,
} from '@/features/ai/shared/schema';
import { createCloudflareImage, createCloudflareText } from '@/lib/ai/cloudflare';
import { putMedia } from '@/lib/media.server';
import { chat, generateImage } from '@tanstack/ai';
import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';

const TEXT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const IMAGE_MODEL = '@cf/black-forest-labs/flux-1-schnell';

const VOICE = `You write for TipsToTreat, a site where one Indian home cook writes down her own remedies, health tips, and recipes.
Voice: warm, plain, first person ("I"), the way she would tell a neighbour. No hype, no miracle claims, no medical jargon.
Ingredients are ordinary Indian pantry items (turmeric, ginger, ajwain, jaggery, ghee, tulsi, curd, hing, methi). Use English names; a common Hindi name may follow in brackets.
Remedies and tips must include a caution: when to stop and see a doctor. Never claim to cure anything.
Recipes get prep and cook minutes and servings; remedies and tips leave those null or empty.
Keep steps as short imperative sentences, one action each. Keep the summary to one or two sentences.`;

const MODEL_OPTIONS = { max_tokens: 3000, temperature: 0.4 };

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
                adapter: createCloudflareText(TEXT_MODEL, { binding: env.AI }),
                systemPrompts: [VOICE],
                messages: [
                    {
                        role: 'user',
                        content: `Write a new ${data.kind} for the site. Brief from the author: ${data.brief}\nReturn every field. The kind must be "${data.kind}".`,
                    },
                ],
                outputSchema: aiDraftSchema,
                modelOptions: MODEL_OPTIONS,
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
                adapter: createCloudflareText(TEXT_MODEL, { binding: env.AI }),
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

const IMAGE_STYLE =
    'Editorial food photography, photorealistic, shot on a 50mm lens, soft natural window light, shallow depth of field, an Indian home kitchen, brass and steel utensils, a worn wooden table, quiet muted colours. No people, no hands, no faces, no text, no letters, no logos, no watermark.';

/** Generate a cover image, store it in R2, and return its URL. */
export const aiGenerateImageServerFn = createServerFn({ method: 'POST' })
    .validator(imageInputSchema)
    .handler(async ({ data }) => {
        await requireAuthor();
        const subject =
            data.kind === 'recipe'
                ? `${data.title}, a home-cooked Indian dish, plated simply`
                : `the ingredients for ${data.title}: ${data.ingredients.slice(0, 5).join(', ') || 'kitchen spices'}, arranged as a still life`;
        const prompt = `${subject}. ${data.notes ?? ''} ${IMAGE_STYLE}`.trim();
        const result = await generateImage({
            adapter: createCloudflareImage(IMAGE_MODEL, { binding: env.AI }),
            prompt,
            numberOfImages: 1,
        });
        const image = result.images[0];
        if (!image?.b64Json) throw new Error('The model returned no image. Try again.');
        const bytes = Uint8Array.from(atob(image.b64Json), c => c.charCodeAt(0));
        const { url } = await putMedia(bytes, 'image/png', 'generated');
        return { url, prompt };
    });
