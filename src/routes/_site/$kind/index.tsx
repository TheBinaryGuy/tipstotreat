import { EntryRow, KindMark } from '@/components/site/entry-parts';
import { entriesQuery } from '@/features/entries/shared/queries';
import { kindFromPath, kindMeta } from '@/lib/format';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/_site/$kind/')({
    beforeLoad: ({ params }) => {
        const kind = kindFromPath[params.kind];
        if (!kind) throw notFound();
        return { kind };
    },
    loader: ({ context }) => context.queryClient.ensureQueryData(entriesQuery(context.kind)),
    head: ({ match, matches }) => {
        const kind = kindFromPath[match.params.kind];
        const origin = (matches[0]?.loaderData as { origin?: string } | undefined)?.origin;
        return {
            links:
                origin && kind
                    ? [{ rel: 'canonical', href: `${origin}/${match.params.kind}` }]
                    : [],
            meta: kind
                ? [
                      { title: `${kindMeta[kind].plural} · TipsToTreat` },
                      { name: 'description', content: sectionBlurb[kind] },
                  ]
                : [],
        };
    },
    component: SectionPage,
});

const sectionBlurb = {
    remedy: 'Indian home remedies for everyday complaints, with the ingredients you already have.',
    tip: 'Small daily habits from an Indian household that keep the family well.',
    recipe: 'Everyday Indian home recipes, written the way they are made at home.',
} as const;

function SectionPage() {
    const { kind } = Route.useRouteContext();
    const { data: entries } = useSuspenseQuery(entriesQuery(kind));
    const meta = kindMeta[kind];

    return (
        <div className='mx-auto max-w-4xl px-5 pt-14'>
            <div className='flex items-center gap-3'>
                <KindMark className='size-11 rounded-xl [&_svg]:size-5' kind={kind} />
                <div>
                    <h1 className='text-3xl font-semibold tracking-tight'>{meta.plural}</h1>
                    <p className='text-muted-foreground'>{sectionBlurb[kind]}</p>
                </div>
            </div>
            {entries.length === 0 ? (
                <p className='text-muted-foreground mt-10 border-t pt-8'>
                    No {meta.plural.toLowerCase()} published yet.
                </p>
            ) : (
                <ul className='mt-8 divide-y border-t'>
                    {entries.map(entry => (
                        <EntryRow entry={entry} key={entry.id} />
                    ))}
                </ul>
            )}
        </div>
    );
}
