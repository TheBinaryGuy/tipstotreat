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

export const generateInputSchema = z.object({
    brief: z.string().trim().min(3, 'Say what you want').max(2000),
    kind: z.enum(ENTRY_KINDS),
});

export const extractInputSchema = z.object({
    text: z.string().trim().min(20, 'Paste a bit more text').max(20_000),
});

export const imageInputSchema = z.object({
    title: z.string().trim().min(2).max(160),
    kind: z.enum(ENTRY_KINDS),
    ingredients: z.array(z.string()).max(12).default([]),
    notes: z.string().trim().max(300).optional(),
});

export const inlineImageInputSchema = z.object({
    prompt: z.string().trim().min(3, 'Describe the picture').max(400),
});
