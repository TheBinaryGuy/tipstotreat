import type { Entry } from '@/lib/db/schema';
import { kindMeta } from '@/lib/format';

/** The whole entry as one Markdown document: what AI crawlers and `.md` links get. */
export function entryToMarkdown(entry: Entry, url: string) {
    const meta = kindMeta[entry.kind];
    const lines: string[] = [`# ${entry.title}`, ''];
    if (entry.useFor) lines.push(`${meta.lead} ${entry.useFor.toLowerCase()}.`, '');
    lines.push(entry.summary, '');
    if (entry.ingredients.length > 0) {
        lines.push('## Ingredients', '');
        for (const item of entry.ingredients) {
            lines.push(`- ${item.name}${item.quantity ? ` — ${item.quantity}` : ''}`);
        }
        lines.push('');
    }
    if (entry.steps.length > 0) {
        lines.push('## Method', '');
        entry.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
        lines.push('');
    }
    if (entry.body.trim()) lines.push(entry.body.trim(), '');
    if (entry.caution) lines.push('## When to see a doctor', '', entry.caution, '');
    lines.push(
        '---',
        '',
        `Source: ${url}`,
        `Published: ${entry.publishedAt?.toISOString().slice(0, 10) ?? ''}`
    );
    return lines.join('\n');
}
