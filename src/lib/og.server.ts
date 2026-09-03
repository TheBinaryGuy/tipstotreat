import { container, image, text } from '@takumi-rs/helpers';
import { Renderer, initSync } from '@takumi-rs/wasm';
import wasmModule from '@takumi-rs/wasm/auto';
import interWoff2 from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_ACCENT = '#432dd7';
export const OG_INK = '#18181b';
export const OG_MUTED = '#52525b';

let renderer: Renderer | undefined;
let fontOrigin: string | undefined;

/** One WASM renderer per isolate, with Inter registered from the site's own asset URL. */
export function getOgRenderer(origin: string) {
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

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${OG_ACCENT}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49"/><path d="M15 15h6"/><path d="M18 12v6"/></svg>`;

/** The heart-plus mark as an image node. */
export function ogMark(size: number) {
    return image({
        src: `data:image/svg+xml;utf8,${encodeURIComponent(markSvg)}`,
        style: { width: size, height: size },
    });
}

export const ogPage = (children: ReturnType<typeof container>[]) =>
    container({
        style: {
            width: OG_WIDTH,
            height: OG_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 72,
            backgroundColor: '#ffffff',
            fontFamily: 'Inter Variable',
            color: OG_INK,
        },
        children,
    });

export const ogHeaders = {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=86400, s-maxage=604800',
};

export { container, text };
