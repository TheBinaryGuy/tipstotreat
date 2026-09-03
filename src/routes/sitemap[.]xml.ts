import { listPublished } from '@/features/entries/server/entries.server';
import { kindMeta } from '@/lib/format';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sitemap.xml')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const origin = new URL(request.url).origin;
                const entries = await listPublished();
                const urls = [
                    { loc: `${origin}/`, priority: '1.0' },
                    ...(['remedy', 'tip', 'recipe', 'article'] as const).map(kind => ({
                        loc: `${origin}/${kindMeta[kind].path}`,
                        priority: '0.8',
                    })),
                    ...entries.map(entry => ({
                        loc: `${origin}/${kindMeta[entry.kind].path}/${entry.slug}`,
                        lastmod: entry.updatedAt.toISOString(),
                        priority: '0.7',
                    })),
                ];
                const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
                    .map(
                        url =>
                            `  <url><loc>${url.loc}</loc>${'lastmod' in url && url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}<priority>${url.priority}</priority></url>`
                    )
                    .join('\n')}\n</urlset>\n`;
                return new Response(xml, {
                    headers: {
                        'Content-Type': 'application/xml; charset=utf-8',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            },
        },
    },
});
