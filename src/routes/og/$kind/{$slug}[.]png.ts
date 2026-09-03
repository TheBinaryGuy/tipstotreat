import { findPublishedBySlug } from '@/features/entries/server/entries.server';
import { kindFromPath, kindMeta } from '@/lib/format';
import { SITE_NAME } from '@/lib/site';
import { container, text } from '@takumi-rs/helpers';
import { Renderer, initSync } from '@takumi-rs/wasm';
import wasmModule from '@takumi-rs/wasm/auto';
import { createFileRoute } from '@tanstack/react-router';
import interWoff2 from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';

let renderer: Renderer | undefined;
let fontOrigin: string | undefined;

/** One WASM renderer per isolate, with Inter registered from the site's own asset URL. */
function getRenderer(origin: string) {
    if (!renderer) {
        // Under the Cloudflare Vite plugin the "workerd" export condition resolves
        // `@takumi-rs/wasm/auto` to a compiled WebAssembly.Module.
        initSync({ module: wasmModule as unknown as WebAssembly.Module });
        renderer = new Renderer();
    }
    if (fontOrigin !== origin) {
        renderer.registerFont(new URL(interWoff2, origin).href);
        fontOrigin = origin;
    }
    return renderer;
}

const ACCENT = '#432dd7';

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
                                text(meta.label.toUpperCase(), {
                                    fontSize: 24,
                                    fontWeight: 600,
                                    letterSpacing: 2,
                                    color: ACCENT,
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

                const png = await getRenderer(origin).render(node, {
                    width: 1200,
                    height: 630,
                    format: 'png',
                });
                return new Response(png, {
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
                    },
                });
            },
        },
    },
});
