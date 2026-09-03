import { createFileRoute } from '@tanstack/react-router';

/** robots.txt with an absolute sitemap URL for whichever origin is serving the site. */
export const Route = createFileRoute('/robots.txt')({
    server: {
        handlers: {
            GET: ({ request }) => {
                const origin = new URL(request.url).origin;
                const body = [
                    'User-agent: *',
                    'Allow: /',
                    'Disallow: /admin',
                    'Disallow: /api/',
                    'Disallow: /search',
                    '',
                    `Sitemap: ${origin}/sitemap.xml`,
                    '',
                ].join('\n');
                return new Response(body, {
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            },
        },
    },
});
