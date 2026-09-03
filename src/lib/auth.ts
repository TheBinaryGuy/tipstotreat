import { getDb, schema } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { passkey } from '@better-auth/passkey';
import { admin, lastLoginMethod, twoFactor } from 'better-auth/plugins';
import { resetPasswordEmail, sendEmail } from '@/lib/email.server';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { env } from 'cloudflare:workers';
import { count } from 'drizzle-orm';

let instance: ReturnType<typeof createAuth> | undefined;

function createAuth() {
    const db = getDb();
    const authorEmail = env.AUTHOR_EMAIL?.trim().toLowerCase() || null;
    const google =
        env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
            ? {
                  clientId: env.GOOGLE_CLIENT_ID,
                  clientSecret: env.GOOGLE_CLIENT_SECRET,
                  prompt: 'select_account' as const,
              }
            : undefined;

    return betterAuth({
        appName: 'TipsToTreat',
        // Unset in preview deployments: better-auth then derives the origin from each request,
        // so version-preview hostnames work without configuration.
        baseURL: env.BETTER_AUTH_URL || undefined,
        secret: env.BETTER_AUTH_SECRET,
        database: drizzleAdapter(db, {
            provider: 'sqlite',
            schema,
        }),
        plugins: [
            admin({ defaultRole: 'user', adminRoles: ['admin'] }),
            lastLoginMethod(),
            twoFactor({ issuer: 'TipsToTreat' }),
            passkey({
                rpID: env.PASSKEY_RP_ID || 'localhost',
                rpName: 'TipsToTreat',
                origin: env.SITE_URL || env.BETTER_AUTH_URL || 'http://localhost:5173',
            }),
            tanstackStartCookies(),
        ],
        emailAndPassword: {
            enabled: true,
            minPasswordLength: 10,
            sendResetPassword: async ({ user: account, url }) => {
                const mail = resetPasswordEmail(account.name, url);
                await sendEmail({
                    to: account.email,
                    subject: 'Reset your TipsToTreat password',
                    ...mail,
                });
            },
            resetPasswordTokenExpiresIn: 60 * 60,
        },
        socialProviders: google ? { google } : {},
        session: {
            cookieCache: { enabled: true, maxAge: 5 * 60 },
        },
        databaseHooks: {
            user: {
                create: {
                    // The site has one author, who is the admin-plugin "admin". With AUTHOR_EMAIL
                    // set, that address gets the role however it signs up (password or Google);
                    // without it (local dev), the first account does. Everyone else is a "user".
                    before: async ({ email, ...rest }) => {
                        let isAuthor: boolean;
                        if (authorEmail) {
                            isAuthor = email.toLowerCase() === authorEmail;
                        } else {
                            const [row] = await db.select({ n: count() }).from(user);
                            isAuthor = (row?.n ?? 0) === 0;
                        }
                        return { data: { ...rest, email, role: isAuthor ? 'admin' : 'user' } };
                    },
                },
            },
        },
    });
}

/** Server-only better-auth instance, created lazily so the D1 binding is read per worker. */
export function getAuth() {
    instance ??= createAuth();
    return instance;
}

export type Auth = ReturnType<typeof getAuth>;
export type Session = Auth['$Infer']['Session'];
