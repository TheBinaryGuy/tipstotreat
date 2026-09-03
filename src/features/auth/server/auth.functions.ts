import { readSession } from '@/features/auth/server/session.server';
import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';

export const getSessionServerFn = createServerFn().handler(async () => {
    const user = await readSession();
    return user ? { user } : null;
});

/** Which sign-in methods are configured, so the UI only shows working buttons. */
export const getAuthMethodsServerFn = createServerFn().handler(() => ({
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
}));
