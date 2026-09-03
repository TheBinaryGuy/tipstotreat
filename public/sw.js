/* TipsToTreat service worker: network-first pages with an offline fallback,
   cache-first for hashed assets and fonts. Bump VERSION to drop old caches. */
const VERSION = 'v1';
const PAGE_CACHE = `pages-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const OFFLINE_URL = '/offline';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(PAGE_CACHE).then(cache => cache.add(OFFLINE_URL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches
            .keys()
            .then(keys =>
                Promise.all(keys.filter(key => ![PAGE_CACHE, ASSET_CACHE].includes(key)).map(key => caches.delete(key)))
            )
            .then(() => self.clients.claim())
    );
});

function isAsset(url) {
    return (
        url.pathname.startsWith('/assets/') ||
        /\.(?:woff2?|png|svg|ico|webp|jpg|jpeg)$/.test(url.pathname)
    );
}

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    // Never cache auth, server-function RPCs, or the author panel.
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_server') || url.pathname.startsWith('/admin')) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(PAGE_CACHE).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(async () => (await caches.match(request)) ?? (await caches.match(OFFLINE_URL)))
        );
        return;
    }

    if (isAsset(url)) {
        event.respondWith(
            caches.match(request).then(
                cached =>
                    cached ??
                    fetch(request).then(response => {
                        const copy = response.clone();
                        caches.open(ASSET_CACHE).then(cache => cache.put(request, copy));
                        return response;
                    })
            )
        );
    }
});
