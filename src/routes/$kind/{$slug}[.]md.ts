import { findPublishedBySlug } from '@/features/entries/server/entries.server';
import { entryToMarkdown } from '@/lib/entry-markdown';
import { kindFromPath } from '@/lib/format';
import { createFileRoute } from '@tanstack/react-router';

/** Every entry is also available as plain Markdown at `/<kind>/<slug>.md`. */
export const Route = createFileRoute('/$kind/{$slug}.md')({
    server: {
        handlers: {
            GET: async ({ params, request }) => {
                const kind = kindFromPath[params.kind];
                const entry = kind ? await findPublishedBySlug(params.slug) : null;
                if (!entry || entry.kind !== kind)
                    return new Response('Not found', { status: 404 });
                const origin = new URL(request.url).origin;
                return new Response(
                    entryToMarkdown(entry, `${origin}/${params.kind}/${params.slug}`),
                    {
                        headers: {
                            'Content-Type': 'text/markdown; charset=utf-8',
                            'Cache-Control': 'public, max-age=300',
                        },
                    }
                );
            },
        },
    },
});
