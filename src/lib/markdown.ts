import rehypeSanitize, { defaultSchema, type Options } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const schema: Options = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        a: [
            ...(defaultSchema.attributes?.a ?? []),
            ['rel', 'noopener', 'noreferrer'],
            ['target', '_blank'],
        ],
    },
};

const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify);

/** Markdown (GitHub flavoured) to sanitized HTML. Runs on the server when an entry is saved. */
export async function renderMarkdown(markdown: string): Promise<string> {
    if (!markdown.trim()) return '';
    const file = await processor.process(markdown);
    return String(file);
}

/** A plain-text excerpt for search engines and previews. */
export function markdownExcerpt(markdown: string, max = 160) {
    const text = markdown
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/[#>*_`~-]+/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
