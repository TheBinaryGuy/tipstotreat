import type { EntryKind } from '@/lib/db/schema';

export const kindMeta: Record<
    EntryKind,
    { label: string; plural: string; path: string; lead: string }
> = {
    remedy: {
        label: 'Remedy',
        plural: 'Remedies',
        path: 'remedies',
        lead: 'For',
    },
    tip: { label: 'Tip', plural: 'Tips', path: 'tips', lead: 'Helps with' },
    recipe: {
        label: 'Recipe',
        plural: 'Recipes',
        path: 'recipes',
        lead: 'Good for',
    },
    article: { label: 'Article', plural: 'Articles', path: 'articles', lead: 'About' },
};

export const kindFromPath: Record<string, EntryKind> = {
    remedies: 'remedy',
    tips: 'tip',
    recipes: 'recipe',
    articles: 'article',
};

export function formatDate(value: Date | number | string | null | undefined) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function slugify(input: string) {
    return input
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function minutesLabel(prep?: number | null, cook?: number | null) {
    const parts: string[] = [];
    if (prep) parts.push(`${prep} min prep`);
    if (cook) parts.push(`${cook} min cook`);
    return parts.join(' · ');
}
