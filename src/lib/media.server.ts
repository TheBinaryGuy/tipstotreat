import { env } from 'cloudflare:workers';

export const MEDIA_MAX_BYTES = 8 * 1024 * 1024;
export const MEDIA_TYPES: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
};

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
