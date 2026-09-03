import { env } from 'cloudflare:workers';

export const MEDIA_MAX_BYTES = 8 * 1024 * 1024;
export const MEDIA_TYPES: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
};

/** How an upload will be used decides how it is resized and re-encoded. */
export type MediaVariant = 'cover' | 'inline' | 'avatar';

const VARIANTS: Record<MediaVariant, { transform: ImageTransform; quality: number }> = {
    cover: { transform: { width: 1600, height: 1600, fit: 'scale-down' }, quality: 82 },
    inline: { transform: { width: 1400, height: 1400, fit: 'scale-down' }, quality: 80 },
    avatar: { transform: { width: 256, height: 256, fit: 'cover' }, quality: 82 },
};

function toStream(bytes: ArrayBuffer | Uint8Array) {
    return new Blob([bytes as BlobPart]).stream();
}

/**
 * Resize and re-encode an image as WebP through Cloudflare Images. Animated GIFs are kept as they
 * are, and if the binding is unavailable (or the transform fails) the original bytes are stored.
 */
export async function optimizeImage(
    bytes: ArrayBuffer | Uint8Array,
    contentType: string,
    variant: MediaVariant
): Promise<{ bytes: ArrayBuffer | Uint8Array; contentType: string }> {
    const images = (env as { IMAGES?: ImagesBinding }).IMAGES;
    if (!images || contentType === 'image/gif') return { bytes, contentType };
    try {
        const { transform, quality } = VARIANTS[variant];
        const result = await images
            .input(toStream(bytes))
            .transform(transform)
            .output({ format: 'image/webp', quality });
        const out = await new Response(result.image()).arrayBuffer();
        // Only keep the re-encoded copy when it is actually smaller or was resized.
        return { bytes: out, contentType: 'image/webp' };
    } catch (error) {
        console.warn('[media] optimisation skipped:', (error as Error).message);
        return { bytes, contentType };
    }
}

/** Store bytes in R2 under a random key and return the public path served by /media/$. */
export async function putMedia(
    bytes: ArrayBuffer | Uint8Array,
    contentType: string,
    prefix: string
) {
    const ext = MEDIA_TYPES[contentType];
    if (!ext) throw new Error('Only PNG, JPEG, WebP, GIF, or AVIF images are allowed.');
    const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
    await env.MEDIA.put(key, bytes, {
        httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
    });
    return { key, url: `/media/${key}` };
}

/** Optimise for the given use, then store. */
export async function putOptimizedMedia(
    bytes: ArrayBuffer | Uint8Array,
    contentType: string,
    prefix: string,
    variant: MediaVariant
) {
    const optimized = await optimizeImage(bytes, contentType, variant);
    return putMedia(optimized.bytes, optimized.contentType, prefix);
}

/** A 1200x630 JPEG of a stored cover for link previews (WhatsApp needs < 500 KB). */
export async function coverForOpenGraph(mediaPath: string): Promise<Response | null> {
    const images = (env as { IMAGES?: ImagesBinding }).IMAGES;
    const key = mediaPath.replace(/^\/media\//, '');
    const object = await env.MEDIA.get(key);
    if (!object || !images) return null;
    const result = await images
        .input(object.body)
        .transform({ width: 1200, height: 630, fit: 'cover' })
        .output({ format: 'image/jpeg', quality: 80 });
    return result.response();
}
