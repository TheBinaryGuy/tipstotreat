import { listPublished } from '@/features/entries/server/entries.server';
import { kindMeta } from '@/lib/format';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import { createFileRoute } from '@tanstack/react-router';

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** RSS 2.0 feed of every published entry, newest first. */
export const Route = createFileRoute('/feed.xml')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const origin = new URL(request.url).origin;
                const entries = (await listPublished()).slice(0, 50);
                const items = entries
                    .map(entry => {
                        const url = `${origin}/${kindMeta[entry.kind].path}/${entry.slug}`;
                        const image = entry.coverImage ? `${origin}${entry.coverImage}` : null;
                        return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${(entry.publishedAt ?? entry.createdAt).toUTCString()}</pubDate>
      <category>${escapeXml(kindMeta[entry.kind].label)}</category>
      <description>${escapeXml(entry.summary)}</description>
      <content:encoded><![CDATA[${image ? `<p><img src="${image}" alt="" /></p>` : ''}${entry.bodyHtml}]]></content:encoded>${image ? `\n      <enclosure url="${image}" type="image/png" length="0" />` : ''}
    </item>`;
                    })
                    .join('\n');
                const lastBuild = (entries[0]?.publishedAt ?? new Date()).toUTCString();
                const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${origin}/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
                return new Response(xml, {
                    headers: {
                        'Content-Type': 'application/rss+xml; charset=utf-8',
                        'Cache-Control': 'public, max-age=900',
                    },
                });
            },
        },
    },
});
