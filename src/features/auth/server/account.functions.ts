import { requireUser } from '@/features/auth/server/session.server';
import { getAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { account, user } from '@/lib/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/** What the Settings page needs to know about the signed-in account. */
export const getAccountOverviewServerFn = createServerFn().handler(async () => {
    const me = await requireUser();
    const db = getDb();
    const [row] = await db
        .select({ twoFactorEnabled: user.twoFactorEnabled, image: user.image, name: user.name })
        .from(user)
        .where(eq(user.id, me.id))
        .limit(1);
    const providers = await db
        .select({ providerId: account.providerId })
        .from(account)
        .where(eq(account.userId, me.id));
    return {
        name: row?.name ?? me.name,
        email: me.email,
        image: row?.image ?? null,
        role: me.role,
        hasPassword: providers.some(p => p.providerId === 'credential'),
        providers: providers.map(p => p.providerId),
        twoFactorEnabled: Boolean(row?.twoFactorEnabled),
    };
});

/** Accounts created with Google have no password; this sets one so email sign-in works too. */
export const setPasswordServerFn = createServerFn({ method: 'POST' })
    .validator(z.object({ newPassword: z.string().min(10).max(200) }))
    .handler(async ({ data }) => {
        await requireUser();
        await getAuth().api.setPassword({
            body: { newPassword: data.newPassword },
            headers: getRequestHeaders(),
        });
        return { ok: true };
    });
