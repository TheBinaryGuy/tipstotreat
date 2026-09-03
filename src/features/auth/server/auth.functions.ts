import { readSession } from '@/features/auth/server/session.server';
import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { z } from 'zod';

export const getSessionServerFn = createServerFn().handler(async () => {
    const user = await readSession();
    return user ? { user } : null;
});

/** Which sign-in methods are configured, so the UI only shows working buttons. */
export const getAuthMethodsServerFn = createServerFn().handler(() => ({
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
}));

/** The ban reason for a banned account, so the sign-in page can show it. Returns null otherwise. */
export const getBanNoticeServerFn = createServerFn()
    .validator(z.object({ email: z.email() }))
    .handler(async ({ data }) => {
        const { getDb } = await import('@/lib/db');
        const { user } = await import('@/lib/db/schema');
        const { eq } = await import('drizzle-orm');
        const [row] = await getDb()
            .select({ banned: user.banned, reason: user.banReason, expires: user.banExpires })
            .from(user)
            .where(eq(user.email, data.email.toLowerCase()))
            .limit(1);
        if (!row?.banned) return null;
        if (row.expires && row.expires.getTime() < Date.now()) return null;
        return { reason: row.reason, expires: row.expires };
    });
