import { listPublished } from '@/features/entries/server/entries.server';
import { entryToMarkdown } from '@/lib/entry-markdown';
import { kindMeta } from '@/lib/format';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import { createFileRoute } from '@tanstack/react-router';

/** llms-full.txt: every published entry in one Markdown document. */
export const Route = createFileRoute('/llms-full.txt')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const origin = new URL(request.url).origin;
                const entries = await listPublished();
                const parts = [`# ${SITE_NAME}`, '', `> ${SITE_DESCRIPTION}`, ''];
                for (const entry of entries) {
                    parts.push(
                        '---',
                        '',
                        entryToMarkdown(
                            entry,
                            `${origin}/${kindMeta[entry.kind].path}/${entry.slug}`
                        ),
                        ''
                    );
                }
                return new Response(parts.join('\n'), {
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'Cache-Control': 'public, max-age=300',
                    },
                });
            },
        },
    },
});
