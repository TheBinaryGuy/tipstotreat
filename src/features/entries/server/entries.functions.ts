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
import { submitToIndexNow } from '@/lib/indexnow.server';
import { kindMeta } from '@/lib/format';
import { notFound } from '@tanstack/react-router';
import { getRequest } from '@tanstack/react-start/server';
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
        const entry = await createEntry(data, author.id);
        if (entry.status === 'published') await notifyIndexers(entry.kind, entry.slug);
        return entry;
    });

export const adminUpdateEntryServerFn = createServerFn({ method: 'POST' })
    .validator(z.object({ id: z.string().min(1), input: entryInputSchema }))
    .handler(async ({ data }) => {
        await requireAuthor();
        if (await slugTaken(data.input.slug, data.id))
            throw new Error('That slug is already in use.');
        const entry = await updateEntry(data.id, data.input);
        if (entry.status === 'published') await notifyIndexers(entry.kind, entry.slug);
        return entry;
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

/** Best-effort: tell IndexNow about the entry, its section, and the front page. Never fails a save. */
async function notifyIndexers(kind: keyof typeof kindMeta, slug: string) {
    try {
        const origin = new URL(getRequest().url).origin;
        await submitToIndexNow(origin, [
            `${origin}/`,
            `${origin}/${kindMeta[kind].path}`,
            `${origin}/${kindMeta[kind].path}/${slug}`,
            `${origin}/sitemap.xml`,
        ]);
    } catch {
        /* indexing is a nicety */
    }
}
