import { requireUser } from '@/features/auth/server/session.server';
import {
    MEDIA_MAX_BYTES,
    MEDIA_TYPES,
    type MediaVariant,
    putOptimizedMedia,
} from '@/lib/media.server';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Image upload: multipart/form-data with a `file` field. Returns { url }. Authors upload covers
 * and inline images (8 MB); every other signed-in user may upload a profile picture (2 MB).
 */
export const Route = createFileRoute('/api/media')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                let isAuthor = false;
                try {
                    const me = await requireUser();
                    isAuthor = me.role === 'admin';
                } catch (error) {
                    return Response.json({ error: (error as Error).message }, { status: 401 });
                }
                const maxBytes = isAuthor ? MEDIA_MAX_BYTES : 2 * 1024 * 1024;
                const form = await request.formData();
                const file = form.get('file');
                const requested = form.get('purpose');
                const variant: MediaVariant = !isAuthor
                    ? 'avatar'
                    : requested === 'cover' || requested === 'avatar'
                      ? requested
                      : 'inline';
                if (!(file instanceof File)) {
                    return Response.json({ error: 'No file received.' }, { status: 400 });
                }
                if (!MEDIA_TYPES[file.type]) {
                    return Response.json(
                        { error: 'Only PNG, JPEG, WebP, GIF, or AVIF images are allowed.' },
                        { status: 415 }
                    );
                }
                if (file.size > maxBytes) {
                    return Response.json(
                        { error: `Images must be under ${Math.round(maxBytes / 1024 / 1024)} MB.` },
                        { status: 413 }
                    );
                }
                const { url } = await putOptimizedMedia(
                    await file.arrayBuffer(),
                    file.type,
                    variant === 'avatar' ? 'avatars' : 'uploads',
                    variant
                );
                return Response.json({ url });
            },
        },
    },
});
