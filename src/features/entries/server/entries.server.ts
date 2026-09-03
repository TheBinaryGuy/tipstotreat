import { getDb } from '@/lib/db';
import { entries, type Entry, type EntryKind } from '@/lib/db/schema';
import type { EntryInput } from '@/features/entries/shared/schema';
import { renderMarkdown } from '@/lib/markdown';
import { and, desc, eq, like, or, sql } from 'drizzle-orm';

const published = eq(entries.status, 'published');

export async function listPublished(kind?: EntryKind): Promise<Entry[]> {
    const db = getDb();
    return db
        .select()
        .from(entries)
        .where(kind ? and(published, eq(entries.kind, kind)) : published)
        .orderBy(desc(entries.publishedAt), desc(entries.createdAt));
}

export async function findPublishedBySlug(slug: string): Promise<Entry | null> {
    const db = getDb();
    const [row] = await db
        .select()
        .from(entries)
        .where(and(published, eq(entries.slug, slug)))
        .limit(1);
    return row ?? null;
}

export async function countPublishedByKind(): Promise<Record<EntryKind, number>> {
    const db = getDb();
    const rows = await db
        .select({ kind: entries.kind, n: sql<number>`count(*)` })
        .from(entries)
        .where(published)
        .groupBy(entries.kind);
    const counts: Record<EntryKind, number> = { remedy: 0, tip: 0, recipe: 0 };
    for (const row of rows) counts[row.kind] = Number(row.n);
    return counts;
}

export async function searchPublished(q: string): Promise<Entry[]> {
    const db = getDb();
    const needle = `%${q.replace(/[%_]/g, '')}%`;
    return db
        .select()
        .from(entries)
        .where(
            and(
                published,
                or(
                    like(entries.title, needle),
                    like(entries.useFor, needle),
                    like(entries.summary, needle),
                    like(entries.ingredients, needle),
                    like(entries.tags, needle)
                )
            )
        )
        .orderBy(desc(entries.publishedAt))
        .limit(40);
}

/* ---- admin ---- */

export async function listAll(): Promise<Entry[]> {
    return getDb().select().from(entries).orderBy(desc(entries.updatedAt));
}

export async function findById(id: string): Promise<Entry | null> {
    const [row] = await getDb().select().from(entries).where(eq(entries.id, id)).limit(1);
    return row ?? null;
}

export async function slugTaken(slug: string, exceptId?: string) {
    const [row] = await getDb()
        .select({ id: entries.id })
        .from(entries)
        .where(eq(entries.slug, slug))
        .limit(1);
    return Boolean(row && row.id !== exceptId);
}

async function toRow(input: EntryInput) {
    return {
        kind: input.kind,
        status: input.status,
        title: input.title,
        slug: input.slug,
        useFor: input.useFor || null,
        summary: input.summary,
        body: input.body,
        bodyHtml: await renderMarkdown(input.body),
        ingredients: input.ingredients,
        steps: input.steps,
        tags: input.tags,
        caution: input.caution || null,
        prepMinutes: input.prepMinutes,
        cookMinutes: input.cookMinutes,
        servings: input.servings || null,
    };
}

export async function createEntry(input: EntryInput, authorId: string): Promise<Entry> {
    const db = getDb();
    const now = new Date();
    const [row] = await db
        .insert(entries)
        .values({
            id: crypto.randomUUID(),
            ...(await toRow(input)),
            authorId,
            publishedAt: input.status === 'published' ? now : null,
            createdAt: now,
            updatedAt: now,
        })
        .returning();
    if (!row) throw new Error('Insert failed');
    return row;
}

export async function updateEntry(id: string, input: EntryInput): Promise<Entry> {
    const db = getDb();
    const existing = await findById(id);
    if (!existing) throw new Error('Entry not found');
    const publishedAt =
        input.status === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt;
    const [row] = await db
        .update(entries)
        .set({ ...(await toRow(input)), publishedAt, updatedAt: new Date() })
        .where(eq(entries.id, id))
        .returning();
    if (!row) throw new Error('Update failed');
    return row;
}

export async function deleteEntry(id: string) {
    await getDb().delete(entries).where(eq(entries.id, id));
}
