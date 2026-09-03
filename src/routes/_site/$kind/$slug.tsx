import { IngredientList, KindMark, StepList, metaLine } from '@/components/site/entry-parts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyPageMenu } from '@/features/entries/components/copy-page-menu';
import { ShareMenu } from '@/features/entries/components/share-menu';
import { entriesQuery, entryQuery } from '@/features/entries/shared/queries';
import { Comments } from '@/features/social/components/comments';
import { LikeButton } from '@/features/social/components/like-button';
import { entrySocialQuery } from '@/features/social/shared/queries';
import { formatDate, kindFromPath, kindMeta } from '@/lib/format';
import { entryJsonLd } from '@/lib/seo';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, getRouteApi, notFound } from '@tanstack/react-router';

const rootRoute = getRouteApi('__root__');
import { ArrowLeftIcon, PencilIcon, TriangleAlertIcon } from 'lucide-react';

export const Route = createFileRoute('/_site/$kind/$slug')({
    beforeLoad: ({ params }) => {
        const kind = kindFromPath[params.kind];
        if (!kind) throw notFound();
        return { kind };
    },
    loader: async ({ context, params }) => {
        const [entry] = await Promise.all([
            context.queryClient.ensureQueryData(entryQuery(params.slug)),
            context.queryClient.ensureQueryData(entrySocialQuery(params.slug)),
        ]);
        if (entry.kind !== context.kind) throw notFound();
        return { entry };
    },
    head: ({ loaderData, matches, params }) => {
        if (!loaderData) return {};
        const { entry } = loaderData;
        const origin = (matches[0]?.loaderData as { origin?: string } | undefined)?.origin;
        const url = origin ? `${origin}/${params.kind}/${params.slug}` : undefined;
        return {
            meta: [
                { title: `${entry.title} · TipsToTreat` },
                { name: 'description', content: entry.summary },
                { property: 'og:title', content: entry.title },
                { property: 'og:description', content: entry.summary },
                { property: 'og:type', content: 'article' },
                ...(url ? [{ property: 'og:url', content: url }] : []),
                ...(entry.publishedAt
                    ? [
                          {
                              property: 'article:published_time',
                              content: entry.publishedAt.toISOString(),
                          },
                      ]
                    : []),
                { property: 'article:modified_time', content: entry.updatedAt.toISOString() },
                ...(origin
                    ? [
                          {
                              property: 'og:image',
                              content: `${origin}/og/${params.kind}/${params.slug}.png`,
                          },
                          {
                              property: 'og:image:secure_url',
                              content: `${origin}/og/${params.kind}/${params.slug}.png`,
                          },
                          { property: 'og:image:type', content: 'image/png' },
                          { property: 'og:image:width', content: '1200' },
                          { property: 'og:image:height', content: '630' },
                          { property: 'og:image:alt', content: entry.title },
                          { name: 'twitter:card', content: 'summary_large_image' },
                          { name: 'twitter:title', content: entry.title },
                          { name: 'twitter:description', content: entry.summary },
                          {
                              name: 'twitter:image',
                              content: `${origin}/og/${params.kind}/${params.slug}.png`,
                          },
                          { name: 'twitter:image:alt', content: entry.title },
                      ]
                    : []),
            ],
            links: url
                ? [
                      { rel: 'canonical', href: url },
                      { rel: 'alternate', type: 'text/markdown', href: `${url}.md` },
                  ]
                : [],
            scripts: url
                ? [
                      {
                          type: 'application/ld+json',
                          children: JSON.stringify(entryJsonLd(entry, url)),
                      },
                  ]
                : [],
        };
    },
    component: EntryPage,
});

function EntryPage() {
    const { slug } = Route.useParams();
    const { kind, session } = Route.useRouteContext();
    const viewer = session?.user ?? null;
    const { data: entry } = useSuspenseQuery(entryQuery(slug));
    const { data: social } = useSuspenseQuery(entrySocialQuery(slug));
    const related = useQuery({
        ...entriesQuery(kind),
        select: list => list.filter(e => e.id !== entry.id).slice(0, 3),
    });
    const meta = kindMeta[kind];
    const { origin } = rootRoute.useLoaderData();
    const pageUrl = `${origin}/${meta.path}/${slug}`;
    const line = metaLine(entry);
    const updated =
        entry.publishedAt && entry.updatedAt.getTime() - entry.publishedAt.getTime() > 86_400_000
            ? ` · updated ${formatDate(entry.updatedAt)}`
            : '';

    return (
        <article className='mx-auto max-w-4xl px-5 pt-12'>
            <div className='flex items-center justify-between gap-4'>
                <Link
                    className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm underline-offset-4 transition-colors hover:underline'
                    params={{ kind: meta.path }}
                    to='/$kind'>
                    <ArrowLeftIcon className='size-3.5' /> All {meta.plural.toLowerCase()}
                </Link>
                {viewer?.role === 'admin' ? (
                    <Link
                        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm underline-offset-4 transition-colors hover:underline'
                        params={{ id: entry.id }}
                        to='/admin/entries/$id'>
                        <PencilIcon className='size-3.5' /> Edit
                    </Link>
                ) : null}
            </div>
            <div className='mt-5 flex items-start gap-3'>
                <KindMark className='mt-1 hidden sm:grid' kind={kind} />
                <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>{entry.title}</h1>
            </div>
            {line ? <p className='text-muted-foreground mt-3'>{line}</p> : null}
            <p className='mt-5 max-w-prose text-lg'>{entry.summary}</p>
            <div className='mt-4 flex flex-wrap items-center gap-4'>
                <LikeButton
                    count={social.likeCount}
                    entryId={entry.id}
                    liked={social.liked}
                    signedIn={viewer !== null}
                    slug={slug}
                />
                <ShareMenu text={entry.summary} title={entry.title} url={pageUrl} />
                <p className='text-muted-foreground text-sm'>
                    Published {formatDate(entry.publishedAt)}
                    {updated}
                </p>
                <div className='ml-auto'>
                    <CopyPageMenu markdownUrl={`${pageUrl}.md`} pageUrl={pageUrl} />
                </div>
            </div>

            <div className='mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_16rem]'>
                <aside className='md:order-last'>
                    {entry.ingredients.length > 0 ? (
                        <Card className='md:sticky md:top-6' size='sm'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Ingredients</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <IngredientList ingredients={entry.ingredients} />
                            </CardContent>
                        </Card>
                    ) : null}
                </aside>
                <div className='min-w-0'>
                    {entry.steps.length > 0 ? (
                        <section aria-labelledby='steps-heading'>
                            <h2 className='text-2xl' id='steps-heading'>
                                Method
                            </h2>
                            <StepList className='mt-4' steps={entry.steps} />
                        </section>
                    ) : null}

                    {entry.bodyHtml ? (
                        <section className='mt-10'>
                            <div
                                className='prose prose-zinc dark:prose-invert max-w-none'
                                // Authored only by the signed-in author in the admin panel.
                                dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
                            />
                        </section>
                    ) : null}

                    {entry.caution ? (
                        <Alert className='mt-10' variant='destructive'>
                            <TriangleAlertIcon />
                            <AlertTitle>When to see a doctor</AlertTitle>
                            <AlertDescription>{entry.caution}</AlertDescription>
                        </Alert>
                    ) : null}
                </div>
            </div>

            {entry.tags.length > 0 ? (
                <ul aria-label='Tags' className='mt-12 flex flex-wrap gap-1.5'>
                    {entry.tags.map(tag => (
                        <li key={tag}>
                            <Badge
                                render={<Link search={{ q: tag }} to='/search' />}
                                variant='outline'>
                                {tag}
                            </Badge>
                        </li>
                    ))}
                </ul>
            ) : null}

            <Comments comments={social.comments} entryId={entry.id} slug={slug} viewer={viewer} />

            {related.data && related.data.length > 0 ? (
                <section aria-labelledby='related-heading' className='mt-14 border-t pt-8'>
                    <h2 className='text-2xl' id='related-heading'>
                        More {meta.plural.toLowerCase()}
                    </h2>
                    <ul className='mt-2 divide-y'>
                        {related.data.map(item => (
                            <li key={item.id}>
                                <Link
                                    className='group hover:bg-muted/60 -mx-3 block rounded-lg px-3 py-3 transition-colors'
                                    params={{ kind: meta.path, slug: item.slug }}
                                    to='/$kind/$slug'>
                                    <span className='font-medium group-hover:underline group-hover:underline-offset-4'>
                                        {item.title}
                                    </span>
                                    <span className='text-muted-foreground mt-0.5 line-clamp-1 block text-sm'>
                                        {item.summary}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </article>
    );
}
