import { requireAuthor } from '@/features/auth/server/session.server';
import { getDb } from '@/lib/db';
import { comments, entries, user, type EntryKind } from '@/lib/db/schema';
import { getAuth } from '@/lib/auth';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'admin' | 'user';
    banned: boolean;
    banReason: string | null;
    banExpires: Date | null;
    createdAt: Date;
};

/** All accounts, newest first, through the better-auth admin plugin. */
export const adminListUsersServerFn = createServerFn().handler(async (): Promise<AdminUser[]> => {
    await requireAuthor();
    const result = await getAuth().api.listUsers({
        query: { limit: 200, sortBy: 'createdAt', sortDirection: 'desc' },
        headers: getRequestHeaders(),
    });
    return result.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image ?? null,
        role: u.role === 'admin' ? 'admin' : 'user',
        banned: Boolean(u.banned),
        banReason: u.banReason ?? null,
        banExpires: u.banExpires ? new Date(u.banExpires) : null,
        createdAt: new Date(u.createdAt),
    }));
});

export const BAN_DURATIONS = {
    permanent: 0,
    day: 60 * 60 * 24,
    week: 60 * 60 * 24 * 7,
    month: 60 * 60 * 24 * 30,
} as const;

export const banInputSchema = z.object({
    userId: z.string().min(1),
    reason: z.string().trim().min(3, 'Give a reason; the person will see it').max(300),
    duration: z.enum(['permanent', 'day', 'week', 'month']),
});

/** Ban a reader: revokes their sessions and blocks sign-in, likes, and comments. */
export const adminBanUserServerFn = createServerFn({ method: 'POST' })
    .validator(banInputSchema)
    .handler(async ({ data }) => {
        const me = await requireAuthor();
        if (data.userId === me.id) throw new Error('You cannot ban yourself.');
        const [target] = await getDb()
            .select({ role: user.role })
            .from(user)
            .where(eq(user.id, data.userId))
            .limit(1);
        if (target?.role === 'admin') throw new Error('The author account cannot be banned.');
        const seconds = BAN_DURATIONS[data.duration];
        await getAuth().api.banUser({
            body: {
                userId: data.userId,
                banReason: data.reason,
                ...(seconds ? { banExpiresIn: seconds } : {}),
            },
            headers: getRequestHeaders(),
        });
        return { ok: true };
    });

export const adminUnbanUserServerFn = createServerFn({ method: 'POST' })
    .validator(z.object({ userId: z.string().min(1) }))
    .handler(async ({ data }) => {
        await requireAuthor();
        await getAuth().api.unbanUser({
            body: { userId: data.userId },
            headers: getRequestHeaders(),
        });
        return { ok: true };
    });

/** Promote a reader to author (admin role) or step an author back down. */
export const adminSetRoleServerFn = createServerFn({ method: 'POST' })
    .validator(z.object({ userId: z.string().min(1), role: z.enum(['admin', 'user']) }))
    .handler(async ({ data }) => {
        const me = await requireAuthor();
        if (data.userId === me.id) throw new Error('You cannot change your own role.');
        await getAuth().api.setRole({
            body: { userId: data.userId, role: data.role },
            headers: getRequestHeaders(),
        });
        return { ok: true };
    });

export type AdminComment = {
    id: string;
    body: string;
    createdAt: Date;
    isReply: boolean;
    author: { id: string; name: string; email: string; banned: boolean };
    entry: { id: string; title: string; slug: string; kind: EntryKind };
};

/** Every comment on the site, newest first. */
export const adminListCommentsServerFn = createServerFn().handler(
    async (): Promise<AdminComment[]> => {
        await requireAuthor();
        const rows = await getDb()
            .select({
                id: comments.id,
                body: comments.body,
                parentId: comments.parentId,
                createdAt: comments.createdAt,
                authorId: user.id,
                authorName: user.name,
                authorEmail: user.email,
                authorBanned: user.banned,
                entryId: entries.id,
                entryTitle: entries.title,
                entrySlug: entries.slug,
                entryKind: entries.kind,
            })
            .from(comments)
            .innerJoin(user, eq(comments.userId, user.id))
            .innerJoin(entries, eq(comments.entryId, entries.id))
            .orderBy(desc(comments.createdAt))
            .limit(500);
        return rows.map(row => ({
            id: row.id,
            body: row.body,
            createdAt: row.createdAt,
            isReply: row.parentId !== null,
            author: {
                id: row.authorId,
                name: row.authorName,
                email: row.authorEmail,
                banned: Boolean(row.authorBanned),
            },
            entry: {
                id: row.entryId,
                title: row.entryTitle,
                slug: row.entrySlug,
                kind: row.entryKind,
            },
        }));
    }
);
