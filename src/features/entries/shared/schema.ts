import { ENTRY_KINDS, ENTRY_STATUSES } from '@/lib/db/schema';
import { z } from 'zod';

export const ingredientSchema = z.object({
    name: z.string().trim().min(1, 'Ingredient needs a name'),
    quantity: z.string().trim().optional(),
});

export const entryInputSchema = z.object({
    kind: z.enum(ENTRY_KINDS),
    status: z.enum(ENTRY_STATUSES),
    title: z.string().trim().min(2, 'Give it a title').max(140),
    slug: z
        .string()
        .trim()
        .min(2)
        .max(160)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only'),
    useFor: z.string().trim().max(160).optional(),
    summary: z.string().trim().min(10, 'Write a one or two line summary').max(400),
    body: z.string().max(50_000, 'Notes are too long'),
    ingredients: z.array(ingredientSchema),
    steps: z.array(z.string().trim().min(1)),
    tags: z.array(z.string().trim().min(1)),
    caution: z.string().trim().max(600).optional(),
    prepMinutes: z
        .number()
        .int()
        .min(0)
        .max(24 * 60)
        .nullable(),
    cookMinutes: z
        .number()
        .int()
        .min(0)
        .max(24 * 60)
        .nullable(),
    servings: z.string().trim().max(40).optional(),
    coverImage: z.string().trim().max(500).nullable(),
});

export type EntryInput = z.infer<typeof entryInputSchema>;

export const entryIdSchema = z.object({ id: z.string().min(1) });
export const entrySlugSchema = z.object({ slug: z.string().min(1) });
export const entryListSchema = z.object({
    kind: z.enum(ENTRY_KINDS).optional(),
});
export const searchSchema = z.object({ q: z.string().trim().min(1).max(80) });
