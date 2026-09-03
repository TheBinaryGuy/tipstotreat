import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';

/** IndexNow key file. The key location is declared in every submission, so a fixed path works. */
export const Route = createFileRoute('/indexnow.txt')({
    server: {
        handlers: {
            GET: () => {
                const key = env.INDEXNOW_KEY;
                if (!key) return new Response('Not found', { status: 404 });
                return new Response(key, { headers: { 'Content-Type': 'text/plain' } });
            },
        },
    },
});
