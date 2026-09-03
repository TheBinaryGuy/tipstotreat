import { listPublished } from '@/features/entries/server/entries.server';
import { kindMeta } from '@/lib/format';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import { createFileRoute } from '@tanstack/react-router';

/** llms.txt: a plain-text index for AI systems, per llmstxt.org. */
export const Route = createFileRoute('/llms.txt')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const origin = new URL(request.url).origin;
                const entries = await listPublished();
                const lines = [
                    `# ${SITE_NAME}`,
                    '',
                    `> ${SITE_DESCRIPTION}`,
                    '',
                    'One author writes everything from her own household practice. Entries are household practices, not medical advice; each remedy says when to see a doctor.',
                    'Every entry is available as Markdown by adding `.md` to its URL.',
                    '',
                ];
                for (const kind of ['remedy', 'tip', 'recipe'] as const) {
                    const list = entries.filter(entry => entry.kind === kind);
                    if (list.length === 0) continue;
                    lines.push(`## ${kindMeta[kind].plural}`, '');
                    for (const entry of list) {
                        lines.push(
                            `- [${entry.title}](${origin}/${kindMeta[kind].path}/${entry.slug}.md): ${entry.summary}`
                        );
                    }
                    lines.push('');
                }
                return new Response(lines.join('\n'), {
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'Cache-Control': 'public, max-age=300',
                    },
                });
            },
        },
    },
});
