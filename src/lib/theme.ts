import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';

export type Theme = 'light' | 'dark';

const themeCookieName = 'preferred-theme';

function validateTheme(value: unknown): Theme {
    if (value !== 'light' && value !== 'dark') {
        throw new Error('Invalid theme');
    }

    return value;
}

export const getThemeServerFn = createServerFn().handler(async () => {
    const theme = getCookie(themeCookieName);
    return theme === 'dark' ? 'dark' : 'light';
});

export const setThemeServerFn = createServerFn({ method: 'POST' })
    .validator(validateTheme)
    .handler(async ({ data }) => {
        setCookie(themeCookieName, data, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
            sameSite: 'lax',
        });
    });
