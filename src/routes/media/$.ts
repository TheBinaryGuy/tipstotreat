import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';

/** Serves images from the R2 bucket. Keys are random, so objects are effectively public. */
export const Route = createFileRoute('/media/$')({
    server: {
        handlers: {
            GET: async ({ params, request }) => {
                const key = params._splat ?? '';
                if (!key || key.includes('..')) return new Response('Not found', { status: 404 });
                const object = await env.MEDIA.get(key, {
                    onlyIf: request.headers,
                    range: request.headers,
                });
                if (!object) return new Response('Not found', { status: 404 });
                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('ETag', object.httpEtag);
                headers.set('Cache-Control', 'public, max-age=31536000, immutable');
                if (!('body' in object) || !object.body) {
                    return new Response(null, { status: 304, headers });
                }
                return new Response(object.body, { headers });
            },
        },
    },
});
