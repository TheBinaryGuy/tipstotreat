import { EntryRow } from '@/components/site/entry-parts';
import { searchQuery } from '@/features/entries/shared/queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_site/search')({
    validateSearch: z.object({ q: z.string().trim().max(80).catch('') }),
    loaderDeps: ({ search }) => ({ q: search.q }),
    loader: ({ context, deps }) =>
        deps.q ? context.queryClient.ensureQueryData(searchQuery(deps.q)) : Promise.resolve([]),
    head: ({ match }) => ({
        meta: [
            { title: `${match.search.q ? `“${match.search.q}” · ` : ''}Search · TipsToTreat` },
            { name: 'robots', content: 'noindex, follow' },
        ],
    }),
    component: SearchPage,
});

function SearchPage() {
    const { q } = Route.useSearch();
    return (
        <div className='mx-auto max-w-4xl px-5 pt-14'>
            <h1 className='text-3xl font-semibold tracking-tight'>
                {q ? `Results for “${q}”` : 'Search'}
            </h1>
            {q ? (
                <Results q={q} />
            ) : (
                <p className='text-muted-foreground mt-3'>
                    Type a complaint, an ingredient, or a dish in the search box.
                </p>
            )}
        </div>
    );
}

function Results({ q }: { q: string }) {
    const { data: results } = useSuspenseQuery(searchQuery(q));
    if (results.length === 0) {
        return (
            <p className='text-muted-foreground mt-3 max-w-prose'>
                Nothing matched. Try a simpler word, an ingredient, or the complaint itself (cough,
                acidity, cracked heels).
            </p>
        );
    }
    return (
        <>
            <p className='text-muted-foreground mt-2 text-sm'>
                {results.length} {results.length === 1 ? 'entry' : 'entries'}
            </p>
            <ul className='mt-6 divide-y border-t'>
                {results.map(entry => (
                    <EntryRow entry={entry} key={entry.id} showKind />
                ))}
            </ul>
        </>
    );
}
