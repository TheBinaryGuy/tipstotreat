import type { Entry } from '@/lib/db/schema';
import { SITE_NAME } from '@/lib/site';

/**
 * Search and social previews truncate around 155-160 characters; cut on a word boundary so the
 * visible text never ends mid-word. JSON-LD keeps the full summary.
 */
export function metaDescription(text: string, max = 155) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max - 1);
    const at = cut.lastIndexOf(' ');
    return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/** schema.org structured data for an entry: Recipe, HowTo (remedies), or Article (tips). */
export function entryJsonLd(entry: Entry, url: string) {
    const base = {
        '@context': 'https://schema.org',
        name: entry.title,
        headline: entry.title,
        description: entry.summary,
        url,
        datePublished: entry.publishedAt?.toISOString(),
        dateModified: entry.updatedAt.toISOString(),
        inLanguage: 'en',
        publisher: { '@type': 'Organization', name: SITE_NAME },
        keywords: entry.tags.join(', ') || undefined,
    };
    if (entry.kind === 'recipe') {
        return {
            ...base,
            '@type': 'Recipe',
            recipeIngredient: entry.ingredients.map(item =>
                [item.quantity, item.name].filter(Boolean).join(' ')
            ),
            recipeInstructions: entry.steps.map(step => ({ '@type': 'HowToStep', text: step })),
            prepTime: entry.prepMinutes ? `PT${entry.prepMinutes}M` : undefined,
            cookTime: entry.cookMinutes ? `PT${entry.cookMinutes}M` : undefined,
            recipeYield: entry.servings ?? undefined,
            recipeCuisine: 'Indian',
        };
    }
    if (entry.kind === 'remedy') {
        return {
            ...base,
            '@type': 'HowTo',
            supply: entry.ingredients.map(item => ({
                '@type': 'HowToSupply',
                name: [item.quantity, item.name].filter(Boolean).join(' '),
            })),
            step: entry.steps.map(step => ({ '@type': 'HowToStep', text: step })),
        };
    }
    return { ...base, '@type': entry.kind === 'article' ? 'BlogPosting' : 'Article' };
}
