// Turns src/content/samples.ts into an idempotent SQL file for `wrangler d1 execute`.
import console from 'node:console';
// Sample entries are synthetic; delete them from the admin panel once real content exists.
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const mod = await import(pathToFileURL('src/content/samples.ts').href);
const { sampleEntries } = mod;
const { renderMarkdown } = await import(pathToFileURL('src/lib/markdown.ts').href);

const q = v => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const day = 24 * 60 * 60 * 1000;
const now = Date.now();

const rows = [];
for (const [i, e] of sampleEntries.entries()) {
    const id = `sample-${String(i + 1).padStart(2, '0')}`;
    const publishedAt = now - e.publishedDaysAgo * day;
    rows.push(`INSERT OR REPLACE INTO entries (id, slug, kind, status, title, use_for, summary, body, body_html, ingredients, steps, tags, caution, prep_minutes, cook_minutes, servings, cover_image, author_id, published_at, created_at, updated_at) VALUES (${[
        q(id),
        q(e.slug),
        q(e.kind),
        q('published'),
        q(e.title),
        q(e.useFor),
        q(e.summary),
        q(e.body),
        q(await renderMarkdown(e.body)),
        q(JSON.stringify(e.ingredients)),
        q(JSON.stringify(e.steps)),
        q(JSON.stringify(e.tags)),
        q(e.caution),
        e.prepMinutes ?? 'NULL',
        e.cookMinutes ?? 'NULL',
        q(e.servings),
        'NULL',
        'NULL',
        publishedAt,
        publishedAt,
        publishedAt,
    ].join(', ')});`);
}

mkdirSync('.wrangler', { recursive: true });
writeFileSync('.wrangler/seed.sql', rows.join('\n') + '\n');
console.log(`wrote ${rows.length} sample entries to .wrangler/seed.sql`);
