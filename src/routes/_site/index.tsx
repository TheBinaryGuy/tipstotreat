import { EntryRow, KindMark } from '@/components/site/entry-parts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { homeQuery } from '@/features/entries/shared/queries';
import type { Entry, EntryKind } from '@/lib/db/schema';
import { formatDate, kindMeta } from '@/lib/format';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';

export const Route = createFileRoute('/_site/')({
    loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery()),
    head: ({ matches }) => {
        const origin = (matches[0]?.loaderData as { origin?: string } | undefined)?.origin;
        return { links: origin ? [{ rel: 'canonical', href: `${origin}/` }] : [] };
    },
    component: HomePage,
});

const KINDS: EntryKind[] = ['remedy', 'tip', 'recipe', 'article'];

const blurb: Record<EntryKind, string> = {
    remedy: 'A complaint, and what to do about it with what is already in the kitchen.',
    tip: 'Small habits that keep the house well.',
    recipe: 'Everyday home food, written the way it is actually made.',
    article: 'Longer reads: seasons, habits, and stories from the kitchen.',
};

function HomePage() {
    const { data } = useSuspenseQuery(homeQuery());
    const { latest, counts } = data;
    const total = counts.remedy + counts.tip + counts.recipe;
    const featured = latest[0];

    return (
        <div className='mx-auto max-w-4xl px-5'>
            <section className='grid gap-8 pt-12 pb-10 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start'>
                <div>
                    <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                        Home remedies, health tips and recipes from one Indian kitchen.
                    </h1>
                    <p className='text-muted-foreground mt-4 max-w-xl text-lg'>
                        Everything here is something I make or use in my own home, written the way I
                        would tell a neighbour. Ordinary ingredients, clear steps, and a note on
                        when to see a doctor.
                    </p>
                    <div className='mt-6 flex flex-wrap gap-2'>
                        {KINDS.filter(kind => counts[kind] > 0).map(kind => (
                            <Button
                                key={kind}
                                render={<Link params={{ kind: kindMeta[kind].path }} to='/$kind' />}
                                variant='outline'>
                                {kindMeta[kind].plural}
                                <Badge variant='secondary'>{counts[kind]}</Badge>
                            </Button>
                        ))}
                    </div>
                </div>
                {featured ? <Featured entry={featured} /> : null}
            </section>

            {total === 0 ? (
                <p className='text-muted-foreground border-t py-12'>
                    Nothing published yet. Check back soon.
                </p>
            ) : (
                KINDS.map(kind => {
                    const items = latest.filter(entry => entry.kind === kind).slice(0, 4);
                    if (items.length === 0) return null;
                    const meta = kindMeta[kind];
                    return (
                        <section
                            aria-labelledby={`${kind}-heading`}
                            className='border-t py-10'
                            key={kind}>
                            <div className='flex items-center gap-3'>
                                <KindMark kind={kind} />
                                <div className='min-w-0 flex-1'>
                                    <h2
                                        className='text-2xl font-semibold tracking-tight'
                                        id={`${kind}-heading`}>
                                        {meta.plural}
                                    </h2>
                                    <p className='text-muted-foreground text-sm'>{blurb[kind]}</p>
                                </div>
                                <Link
                                    className='text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-sm underline-offset-4 transition-colors hover:underline'
                                    params={{ kind: meta.path }}
                                    to='/$kind'>
                                    All {meta.plural.toLowerCase()}
                                    <ArrowRightIcon className='size-3.5' />
                                </Link>
                            </div>
                            <ul className='mt-4 divide-y'>
                                {items.map(entry => (
                                    <EntryRow entry={entry} key={entry.id} />
                                ))}
                            </ul>
                        </section>
                    );
                })
            )}
        </div>
    );
}

function Featured({ entry }: { entry: Entry }) {
    const meta = kindMeta[entry.kind];
    return (
        <Card className='group bg-primary/5 hover:bg-primary/10 py-0 transition-colors'>
            <Link
                className='block p-5'
                params={{ kind: meta.path, slug: entry.slug }}
                to='/$kind/$slug'>
                {entry.coverImage ? (
                    <img
                        alt=''
                        className='mb-4 aspect-[1.91/1] w-full rounded-lg border object-cover'
                        src={entry.coverImage}
                    />
                ) : null}
                <p className='text-primary flex items-center gap-1.5 text-sm font-medium'>
                    <SparklesIcon className='size-4' /> Newest {meta.label.toLowerCase()}
                </p>
                <p className='mt-2 text-xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4'>
                    {entry.title}
                </p>
                {entry.useFor ? (
                    <p className='text-muted-foreground mt-1 text-sm'>
                        {meta.lead} {entry.useFor.toLowerCase()}
                    </p>
                ) : null}
                {entry.ingredients.length > 0 ? (
                    <ul className='mt-3 flex flex-wrap gap-1.5' aria-label='Ingredients'>
                        {entry.ingredients.slice(0, 5).map(item => (
                            <li key={item.name}>
                                <Badge className='bg-background' variant='outline'>
                                    {item.name}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                ) : null}
                <p className='text-muted-foreground mt-4 text-xs'>
                    {formatDate(entry.publishedAt)}
                </p>
            </Link>
        </Card>
    );
}
