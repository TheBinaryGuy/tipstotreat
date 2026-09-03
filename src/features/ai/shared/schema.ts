import { ENTRY_KINDS } from '@/lib/db/schema';
import { z } from 'zod';

/** What the model returns for a generated or extracted entry. Mirrors the editor's fields. */
export const aiDraftSchema = z.object({
    kind: z
        .enum(ENTRY_KINDS)
        .describe('remedy for a complaint, tip for a habit, recipe for a dish'),
    title: z
        .string()
        .describe('Short, plain title as said at home, e.g. "Ajwain water for acidity"'),
    useFor: z
        .string()
        .describe('The complaint, habit, or occasion in a few words, e.g. "Acidity, bloating"'),
    summary: z.string().describe('One or two sentences: what it is and what to expect'),
    ingredients: z.array(
        z.object({
            name: z.string(),
            quantity: z.string().describe('e.g. "1 tsp", "a pinch", "2 cups"; empty if not stated'),
        })
    ),
    steps: z.array(z.string()).describe('Imperative sentences in order, one action each'),
    body: z
        .string()
        .describe(
            'Markdown notes in first person: why it works, tips, variations, notes for children or elders. Use ## headings and lists. No title.'
        ),
    tags: z.array(z.string()).describe('3 to 6 lowercase tags'),
    caution: z
        .string()
        .describe('For remedies and tips: when to stop and see a doctor. Empty for recipes.'),
    prepMinutes: z.number().int().nullable().describe('Recipes only'),
    cookMinutes: z.number().int().nullable().describe('Recipes only'),
    servings: z.string().describe('Recipes only, e.g. "3 to 4"; empty otherwise'),
});

export type AiDraft = z.infer<typeof aiDraftSchema>;

/** Workers AI text models offered in the editor. The first is the default. */
export const TEXT_MODELS = [
    { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', label: 'Llama 3.3 70B · fast, default' },
    { id: '@cf/moonshotai/kimi-k2.6', label: 'Kimi K2.6 · strongest writing' },
    { id: '@cf/openai/gpt-oss-120b', label: 'GPT-OSS 120B · reasoning' },
    { id: '@cf/zai-org/glm-4.7-flash', label: 'GLM 4.7 Flash · quick' },
    { id: '@cf/nvidia/nemotron-3-120b-a12b', label: 'Nemotron 3 120B' },
    { id: '@cf/google/gemma-4-26b-a4b-it', label: 'Gemma 4 26B' },
    { id: '@cf/meta/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B' },
    { id: '@cf/qwen/qwen3-30b-a3b-fp8', label: 'Qwen3 30B' },
    { id: '@cf/mistralai/mistral-small-3.1-24b-instruct', label: 'Mistral Small 3.1 24B' },
    { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', label: 'DeepSeek R1 Distill 32B' },
    { id: '@cf/openai/gpt-oss-20b', label: 'GPT-OSS 20B · light' },
] as const;
export type TextModelId = (typeof TEXT_MODELS)[number]['id'];
export const textModelSchema = z.enum(
    TEXT_MODELS.map(m => m.id) as [TextModelId, ...TextModelId[]]
);

/** Workers AI image models offered in the editor. The first is the default. */
export const IMAGE_MODELS = [
    { id: '@cf/black-forest-labs/flux-1-schnell', label: 'Flux 1 Schnell · fast, default' },
    { id: '@cf/black-forest-labs/flux-2-dev', label: 'Flux 2 Dev · best quality, slow' },
    { id: '@cf/black-forest-labs/flux-2-klein-9b', label: 'Flux 2 Klein 9B' },
    { id: '@cf/black-forest-labs/flux-2-klein-4b', label: 'Flux 2 Klein 4B · quick' },
    { id: '@cf/leonardo/phoenix-1.0', label: 'Leonardo Phoenix 1.0' },
    { id: '@cf/leonardo/lucid-origin', label: 'Leonardo Lucid Origin' },
    { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0', label: 'Stable Diffusion XL' },
    { id: '@cf/bytedance/stable-diffusion-xl-lightning', label: 'SDXL Lightning · fastest' },
] as const;
export type ImageModelId = (typeof IMAGE_MODELS)[number]['id'];
export const imageModelSchema = z.enum(
    IMAGE_MODELS.map(m => m.id) as [ImageModelId, ...ImageModelId[]]
);

export const generateInputSchema = z.object({
    model: textModelSchema.default(TEXT_MODELS[0].id),
    brief: z.string().trim().min(3, 'Say what you want').max(2000),
    kind: z.enum(ENTRY_KINDS),
});

export const extractInputSchema = z.object({
    model: textModelSchema.default(TEXT_MODELS[0].id),
    text: z.string().trim().min(20, 'Paste a bit more text').max(20_000),
});

export const imageInputSchema = z.object({
    model: imageModelSchema.default(IMAGE_MODELS[0].id),
    /** The author's own description; when empty the server derives one from the entry. */
    prompt: z.string().trim().max(600).optional(),
    title: z.string().trim().min(2).max(160),
    kind: z.enum(ENTRY_KINDS),
    ingredients: z.array(z.string()).max(12).default([]),
    useFor: z.string().trim().max(160).optional(),
    summary: z.string().trim().max(400).optional(),
});

export const inlineImageInputSchema = z.object({
    model: imageModelSchema.default(IMAGE_MODELS[0].id),
    prompt: z.string().trim().min(3, 'Describe the picture').max(400),
});
