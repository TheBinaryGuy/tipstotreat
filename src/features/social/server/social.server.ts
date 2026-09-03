import { getDb } from '@/lib/db';
import { commentLikes, comments, likes, user } from '@/lib/db/schema';
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';

export type CommentView = {
    id: string;
    body: string;
    parentId: string | null;
    createdAt: Date;
    likeCount: number;
    liked: boolean;
    /** Names of people who liked it; only filled in for the author. */
    likers?: string[];
    author: { id: string; name: string; image: string | null; role: string | null };
};

export type Liker = { id: string; name: string; image: string | null; at: Date };

export async function entrySocial(entryId: string, viewer: { id: string; role: string } | null) {
    const db = getDb();
    const viewerId = viewer?.id ?? null;
    const isAuthor = viewer?.role === 'admin';
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
            parentId: comments.parentId,
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

    const likers: Liker[] | undefined = isAuthor
        ? await db
              .select({ id: user.id, name: user.name, image: user.image, at: likes.createdAt })
              .from(likes)
              .innerJoin(user, eq(likes.userId, user.id))
              .where(eq(likes.entryId, entryId))
              .orderBy(desc(likes.createdAt))
              .limit(100)
        : undefined;

    const ids = rows.map(row => row.id);
    const likeCounts = new Map<string, number>();
    const likedByViewer = new Set<string>();
    const commentLikers = new Map<string, string[]>();
    if (ids.length > 0) {
        const counts = await db
            .select({ commentId: commentLikes.commentId, n: count() })
            .from(commentLikes)
            .where(inArray(commentLikes.commentId, ids))
            .groupBy(commentLikes.commentId);
        for (const row of counts) likeCounts.set(row.commentId, Number(row.n));
        if (viewerId) {
            const mine = await db
                .select({ commentId: commentLikes.commentId })
                .from(commentLikes)
                .where(
                    and(inArray(commentLikes.commentId, ids), eq(commentLikes.userId, viewerId))
                );
            for (const row of mine) likedByViewer.add(row.commentId);
        }
        if (isAuthor) {
            const who = await db
                .select({ commentId: commentLikes.commentId, name: user.name })
                .from(commentLikes)
                .innerJoin(user, eq(commentLikes.userId, user.id))
                .where(inArray(commentLikes.commentId, ids))
                .orderBy(desc(commentLikes.createdAt));
            for (const row of who) {
                commentLikers.set(row.commentId, [
                    ...(commentLikers.get(row.commentId) ?? []),
                    row.name,
                ]);
            }
        }
    }

    const list: CommentView[] = rows.map(row => ({
        id: row.id,
        body: row.body,
        parentId: row.parentId,
        createdAt: row.createdAt,
        likeCount: likeCounts.get(row.id) ?? 0,
        liked: likedByViewer.has(row.id),
        likers: isAuthor ? (commentLikers.get(row.id) ?? []) : undefined,
        author: {
            id: row.authorId,
            name: row.authorName,
            image: row.authorImage,
            role: row.authorRole,
        },
    }));
    return { likeCount: likeRow?.n ?? 0, liked, likers, comments: list };
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

export async function toggleCommentLike(commentId: string, userId: string) {
    const db = getDb();
    const existing = await db
        .select({ userId: commentLikes.userId })
        .from(commentLikes)
        .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)))
        .limit(1);
    if (existing.length > 0) {
        await db
            .delete(commentLikes)
            .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
        return false;
    }
    await db.insert(commentLikes).values({ commentId, userId });
    return true;
}

export async function addComment(
    entryId: string,
    userId: string,
    body: string,
    parentId: string | null
) {
    const db = getDb();
    let rootId: string | null = null;
    if (parentId) {
        const [parent] = await db
            .select({ id: comments.id, entryId: comments.entryId, parentId: comments.parentId })
            .from(comments)
            .where(eq(comments.id, parentId))
            .limit(1);
        if (!parent || parent.entryId !== entryId)
            throw new Error('That comment no longer exists.');
        // Keep threads one level deep: a reply to a reply hangs off the same top-level comment.
        rootId = parent.parentId ?? parent.id;
    }
    const id = crypto.randomUUID();
    await db.insert(comments).values({ id, entryId, userId, body, parentId: rootId });
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
    // Replies go with their parent (no FK cascade on parent_id, so delete them explicitly).
    await db.delete(comments).where(eq(comments.parentId, id));
    await db.delete(comments).where(eq(comments.id, id));
}
