import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';

/** IndexNow key file: `/<key>.txt` must return the key itself. */
export const Route = createFileRoute('/{$indexnowKey}.txt')({
    server: {
        handlers: {
            GET: ({ params }) => {
                const key = env.INDEXNOW_KEY;
                if (!key || params.indexnowKey !== key)
                    return new Response('Not found', { status: 404 });
                return new Response(key, { headers: { 'Content-Type': 'text/plain' } });
            },
        },
    },
});
