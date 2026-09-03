import { findPublishedBySlug } from '@/features/entries/server/entries.server';
import { kindFromPath } from '@/lib/format';
import { coverForOpenGraph } from '@/lib/media.server';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Link-preview image built from the entry's own cover: 1200x630, JPEG, well under WhatsApp's
 * 500 KB cap. Entries without a cover (or without the Images binding) fall back to the drawn card.
 */
export const Route = createFileRoute('/og/$kind/{$slug}.jpg')({
    server: {
        handlers: {
            GET: async ({ params, request }) => {
                const kind = kindFromPath[params.kind];
                const entry = kind ? await findPublishedBySlug(params.slug) : null;
                if (!entry || entry.kind !== kind)
                    return new Response('Not found', { status: 404 });
                const fallback = new URL(`/og/${params.kind}/${params.slug}.png`, request.url);
                if (!entry.coverImage) return Response.redirect(fallback.href, 302);
                try {
                    const response = await coverForOpenGraph(entry.coverImage);
                    if (!response) return Response.redirect(fallback.href, 302);
                    const headers = new Headers(response.headers);
                    headers.set('Content-Type', 'image/jpeg');
                    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
                    return new Response(response.body, { headers });
                } catch {
                    return Response.redirect(fallback.href, 302);
                }
            },
        },
    },
});
