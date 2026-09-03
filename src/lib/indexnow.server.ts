import { env } from 'cloudflare:workers';

/**
 * IndexNow: tells Bing, Yandex, Seznam, and Naver about new or changed URLs the moment they
 * publish. DuckDuckGo serves Bing's index, so this covers it too. The key is verified by
 * serving it at `/<key>.txt`.
 */
export async function submitToIndexNow(origin: string, urls: string[]) {
    const key = env.INDEXNOW_KEY;
    if (!key || urls.length === 0) return { submitted: 0 };
    const host = new URL(origin).host;
    if (host.startsWith('localhost')) return { submitted: 0 };
    const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
            host,
            key,
            keyLocation: `${origin}/indexnow.txt`,
            urlList: urls.slice(0, 10_000),
        }),
    });
    return {
        submitted: response.ok || response.status === 202 ? urls.length : 0,
        status: response.status,
    };
}
