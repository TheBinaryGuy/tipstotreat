import type { SessionUser } from '@/features/auth/shared/types';
import { getAuth } from '@/lib/auth';
import { getRequestHeaders } from '@tanstack/react-start/server';

/** Server-only: the signed-in user for the current request, or null. */
export async function readSession(): Promise<SessionUser | null> {
    const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
    if (!session) return null;
    return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: session.user.role === 'admin' ? 'admin' : 'user',
    };
}

/** Any signed-in account (readers included). Call inside server-function handlers. */
export async function requireUser(): Promise<SessionUser> {
    const user = await readSession();
    if (!user) throw new Error('Sign in to do that.');
    return user;
}

/** The site's author (better-auth admin role) only. Route guards are UX; this is the boundary. */
export async function requireAuthor(): Promise<SessionUser> {
    const user = await requireUser();
    if (user.role !== 'admin') throw new Error('Only the author can do that.');
    return user;
}
