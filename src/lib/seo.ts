import type { Entry } from '@/lib/db/schema';
import { SITE_NAME } from '@/lib/site';

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
