import {
    OG_ACCENT,
    OG_HEIGHT,
    OG_MUTED,
    OG_WIDTH,
    container,
    getOgRenderer,
    ogHeaders,
    ogMark,
    ogPage,
    text,
} from '@/lib/og.server';
import { SITE_NAME } from '@/lib/site';
import { createFileRoute } from '@tanstack/react-router';

/** The site-wide social image (home, sections, search). */
export const Route = createFileRoute('/og/site.png')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const origin = new URL(request.url).origin;
                const node = ogPage([
                    container({
                        style: { display: 'flex', flexDirection: 'column', gap: 28 },
                        children: [
                            ogMark(96),
                            text(SITE_NAME, {
                                fontSize: 84,
                                fontWeight: 700,
                                letterSpacing: -2,
                                lineHeight: 1,
                            }),
                            text(
                                'Home remedies, health tips and recipes from one Indian kitchen.',
                                {
                                    fontSize: 36,
                                    color: OG_MUTED,
                                    lineHeight: 1.35,
                                }
                            ),
                        ],
                    }),
                    container({
                        style: { display: 'flex', flexDirection: 'row', gap: 40 },
                        children: ['Remedies', 'Tips', 'Recipes'].map(label =>
                            text(label, { fontSize: 28, fontWeight: 600, color: OG_ACCENT })
                        ),
                    }),
                ]);
                const png = await getOgRenderer(origin).render(node, {
                    width: OG_WIDTH,
                    height: OG_HEIGHT,
                    format: 'png',
                });
                return new Response(png, { headers: ogHeaders });
            },
        },
    },
});
