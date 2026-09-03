import { requireAuthor } from '@/features/auth/server/session.server';
import {
    countPublishedByKind,
    createEntry,
    deleteEntry,
    findById,
    findPublishedBySlug,
    listAll,
    listPublished,
    searchPublished,
    slugTaken,
    updateEntry,
} from '@/features/entries/server/entries.server';
import {
    entryIdSchema,
    entryInputSchema,
    entryListSchema,
    entrySlugSchema,
    searchSchema,
} from '@/features/entries/shared/schema';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

/* ---- public ---- */

export const getHomeServerFn = createServerFn().handler(async () => {
    const [latest, counts] = await Promise.all([listPublished(), countPublishedByKind()]);
    return { latest, counts };
});

export const listEntriesServerFn = createServerFn()
    .validator(entryListSchema)
    .handler(({ data }) => listPublished(data.kind));

export const getEntryServerFn = createServerFn()
    .validator(entrySlugSchema)
    .handler(async ({ data }) => {
        const entry = await findPublishedBySlug(data.slug);
        if (!entry) throw notFound();
        return entry;
    });

export const searchEntriesServerFn = createServerFn()
    .validator(searchSchema)
    .handler(({ data }) => searchPublished(data.q));

/* ---- admin ---- */

export const adminListEntriesServerFn = createServerFn().handler(async () => {
    await requireAuthor();
    return listAll();
});

export const adminGetEntryServerFn = createServerFn()
    .validator(entryIdSchema)
    .handler(async ({ data }) => {
        await requireAuthor();
        const entry = await findById(data.id);
        if (!entry) throw notFound();
        return entry;
    });

export const adminCreateEntryServerFn = createServerFn({ method: 'POST' })
    .validator(entryInputSchema)
    .handler(async ({ data }) => {
        const author = await requireAuthor();
        if (await slugTaken(data.slug)) throw new Error('That slug is already in use.');
        return createEntry(data, author.id);
    });

export const adminUpdateEntryServerFn = createServerFn({ method: 'POST' })
    .validator(z.object({ id: z.string().min(1), input: entryInputSchema }))
    .handler(async ({ data }) => {
        await requireAuthor();
        if (await slugTaken(data.input.slug, data.id))
            throw new Error('That slug is already in use.');
        return updateEntry(data.id, data.input);
    });

export const adminSlugAvailableServerFn = createServerFn()
    .validator(z.object({ slug: z.string().min(1), exceptId: z.string().optional() }))
    .handler(async ({ data }) => {
        await requireAuthor();
        return !(await slugTaken(data.slug, data.exceptId));
    });

export const adminDeleteEntryServerFn = createServerFn({ method: 'POST' })
    .validator(entryIdSchema)
    .handler(async ({ data }) => {
        await requireAuthor();
        await deleteEntry(data.id);
        return { ok: true };
    });
