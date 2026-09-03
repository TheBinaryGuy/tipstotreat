import { readSession, requireUser } from '@/features/auth/server/session.server';
import { findPublishedBySlug } from '@/features/entries/server/entries.server';
import {
    addComment,
    deleteComment,
    entrySocial,
    toggleLike,
} from '@/features/social/server/social.server';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const entryIdSchema = z.object({ entryId: z.string().min(1) });

export const getEntrySocialServerFn = createServerFn()
    .validator(z.object({ slug: z.string().min(1) }))
    .handler(async ({ data }) => {
        const entry = await findPublishedBySlug(data.slug);
        if (!entry) throw notFound();
        const viewer = await readSession();
        return entrySocial(entry.id, viewer?.id ?? null);
    });

export const toggleLikeServerFn = createServerFn({ method: 'POST' })
    .validator(entryIdSchema)
    .handler(async ({ data }) => {
        const user = await requireUser();
        return { liked: await toggleLike(data.entryId, user.id) };
    });

export const commentBodySchema = z
    .string()
    .trim()
    .min(2, 'Write a little more')
    .max(1000, 'Keep it under 1000 characters');

export const addCommentServerFn = createServerFn({ method: 'POST' })
    .validator(z.object({ entryId: z.string().min(1), body: commentBodySchema }))
    .handler(async ({ data }) => {
        const user = await requireUser();
        return { id: await addComment(data.entryId, user.id, data.body) };
    });

export const deleteCommentServerFn = createServerFn({ method: 'POST' })
    .validator(z.object({ id: z.string().min(1) }))
    .handler(async ({ data }) => {
        const user = await requireUser();
        await deleteComment(data.id, user);
        return { ok: true };
    });
