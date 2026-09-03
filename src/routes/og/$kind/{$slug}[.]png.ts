import { findPublishedBySlug } from '@/features/entries/server/entries.server';
import { kindFromPath, kindMeta } from '@/lib/format';
import { SITE_NAME } from '@/lib/site';
import { createFileRoute } from '@tanstack/react-router';

import {
    OG_ACCENT as ACCENT,
    OG_HEIGHT,
    OG_WIDTH,
    container,
    getOgRenderer,
    ogHeaders,
    ogMark,
    text,
} from '@/lib/og.server';

export const Route = createFileRoute('/og/$kind/{$slug}.png')({
    server: {
        handlers: {
            GET: async ({ params, request }) => {
                const kind = kindFromPath[params.kind];
                const entry = kind ? await findPublishedBySlug(params.slug) : null;
                if (!entry || entry.kind !== kind)
                    return new Response('Not found', { status: 404 });

                const origin = new URL(request.url).origin;
                const meta = kindMeta[entry.kind];
                const chips = entry.ingredients.slice(0, 5).map(item => item.name);

                const node = container({
                    style: {
                        width: 1200,
                        height: 630,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: 72,
                        backgroundColor: '#ffffff',
                        fontFamily: 'Inter Variable',
                        color: '#18181b',
                    },
                    children: [
                        container({
                            style: { display: 'flex', flexDirection: 'column', gap: 24 },
                            children: [
                                container({
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 16,
                                    },
                                    children: [
                                        ogMark(40),
                                        text(meta.label.toUpperCase(), {
                                            fontSize: 24,
                                            fontWeight: 600,
                                            letterSpacing: 2,
                                            color: ACCENT,
                                        }),
                                    ],
                                }),
                                text(entry.title, {
                                    fontSize: entry.title.length > 40 ? 60 : 72,
                                    fontWeight: 700,
                                    lineHeight: 1.1,
                                    letterSpacing: -1.5,
                                }),
                                text(
                                    entry.useFor
                                        ? `${meta.lead} ${entry.useFor.toLowerCase()}`
                                        : entry.summary,
                                    {
                                        fontSize: 32,
                                        color: '#52525b',
                                        lineHeight: 1.35,
                                    }
                                ),
                            ],
                        }),
                        container({
                            style: {
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                            },
                            children: [
                                container({
                                    style: { display: 'flex', flexDirection: 'row', gap: 12 },
                                    children: chips.map(chip =>
                                        text(chip, {
                                            fontSize: 24,
                                            color: '#3f3f46',
                                            paddingTop: 8,
                                            paddingBottom: 8,
                                            paddingLeft: 18,
                                            paddingRight: 18,
                                            borderWidth: 2,
                                            borderColor: '#e4e4e7',
                                            borderRadius: 999,
                                        })
                                    ),
                                }),
                                text(SITE_NAME, { fontSize: 28, fontWeight: 700, color: ACCENT }),
                            ],
                        }),
                    ],
                });

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
