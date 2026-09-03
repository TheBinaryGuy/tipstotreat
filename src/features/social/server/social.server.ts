import { getDb } from '@/lib/db';
import { comments, likes, user } from '@/lib/db/schema';
import { and, asc, count, eq } from 'drizzle-orm';

export type CommentView = {
    id: string;
    body: string;
    createdAt: Date;
    author: { id: string; name: string; image: string | null; role: string | null };
};

export async function entrySocial(entryId: string, viewerId: string | null) {
    const db = getDb();
    const [likeRow] = await db.select({ n: count() }).from(likes).where(eq(likes.entryId, entryId));
    const liked = viewerId
        ? (
              await db
                  .select({ userId: likes.userId })
                  .from(likes)
                  .where(and(eq(likes.entryId, entryId), eq(likes.userId, viewerId)))
                  .limit(1)
          ).length > 0
        : false;
    const rows = await db
        .select({
            id: comments.id,
            body: comments.body,
            createdAt: comments.createdAt,
            authorId: user.id,
            authorName: user.name,
            authorImage: user.image,
            authorRole: user.role,
        })
        .from(comments)
        .innerJoin(user, eq(comments.userId, user.id))
        .where(eq(comments.entryId, entryId))
        .orderBy(asc(comments.createdAt));
    const list: CommentView[] = rows.map(row => ({
        id: row.id,
        body: row.body,
        createdAt: row.createdAt,
        author: {
            id: row.authorId,
            name: row.authorName,
            image: row.authorImage,
            role: row.authorRole,
        },
    }));
    return { likeCount: likeRow?.n ?? 0, liked, comments: list };
}

export async function toggleLike(entryId: string, userId: string) {
    const db = getDb();
    const existing = await db
        .select({ userId: likes.userId })
        .from(likes)
        .where(and(eq(likes.entryId, entryId), eq(likes.userId, userId)))
        .limit(1);
    if (existing.length > 0) {
        await db.delete(likes).where(and(eq(likes.entryId, entryId), eq(likes.userId, userId)));
        return false;
    }
    await db.insert(likes).values({ entryId, userId });
    return true;
}

export async function addComment(entryId: string, userId: string, body: string) {
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(comments).values({ id, entryId, userId, body });
    return id;
}

export async function deleteComment(id: string, requester: { id: string; role: string }) {
    const db = getDb();
    const [row] = await db
        .select({ userId: comments.userId })
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1);
    if (!row) return;
    if (row.userId !== requester.id && requester.role !== 'admin') {
        throw new Error('You can only delete your own comments.');
    }
    await db.delete(comments).where(eq(comments.id, id));
}
