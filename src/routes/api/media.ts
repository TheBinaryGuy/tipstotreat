import { requireAuthor } from '@/features/auth/server/session.server';
import { MEDIA_MAX_BYTES, MEDIA_TYPES, putMedia } from '@/lib/media.server';
import { createFileRoute } from '@tanstack/react-router';

/** Author-only image upload: multipart/form-data with a `file` field. Returns { url }. */
export const Route = createFileRoute('/api/media')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                try {
                    await requireAuthor();
                } catch (error) {
                    return Response.json({ error: (error as Error).message }, { status: 401 });
                }
                const form = await request.formData();
                const file = form.get('file');
                if (!(file instanceof File)) {
                    return Response.json({ error: 'No file received.' }, { status: 400 });
                }
                if (!MEDIA_TYPES[file.type]) {
                    return Response.json(
                        { error: 'Only PNG, JPEG, WebP, GIF, or AVIF images are allowed.' },
                        { status: 415 }
                    );
                }
                if (file.size > MEDIA_MAX_BYTES) {
                    return Response.json({ error: 'Images must be under 8 MB.' }, { status: 413 });
                }
                const { url } = await putMedia(await file.arrayBuffer(), file.type, 'uploads');
                return Response.json({ url });
            },
        },
    },
});
