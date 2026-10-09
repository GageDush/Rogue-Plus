// Production build replaces these markers with a content revision and all local assets.
const BUILD_ID = '__ROGUE_BUILD_ID__';
const SHELL = ['__ROGUE_PRECACHE__'];
const CORE_PREFIX = 'rogue-plus-shell-';
const CACHE = CORE_PREFIX + BUILD_ID;
const ASSET_CACHE = 'pokerogue-assets-056a1f4';
const ASSET_BASE = 'https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/056a1f408f26a3be4fef243f7462cb43608c7928/images';
const ROOT = new URL('./', self.registration.scope);
const INDEX = new URL('index.html', ROOT).href;
const CORE_URLS = new Set(SHELL.map(path => new URL(path, ROOT).href));

async function installShell() {
  const cache = await caches.open(CACHE);
  try {
    // addAll stores the manifest atomically and rejects missing/error responses.
    await cache.addAll([...CORE_URLS].map(url => new Request(url, { cache: 'reload' })));
  } catch (error) {
    await caches.delete(CACHE);
    throw error;
  }
}
async function warmArtwork() {
  const cache = await caches.open(ASSET_CACHE);
  const urls = [];
  for (let generation = 1; generation <= 9; generation += 1) {
    for (const suffix of ['', 'v']) {
      for (const extension of ['json', 'png']) urls.push(ASSET_BASE + '/pokemon_icons_' + generation + suffix + '.' + extension);
    }
  }
  await Promise.allSettled(urls.map(async url => {
    if (await cache.match(url)) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { mode: 'cors', cache: 'force-cache', signal: controller.signal });
      if (response.ok) await cache.put(url, response);
    } finally { clearTimeout(timeout); }
  }));
}
self.addEventListener('install', event => {
  event.waitUntil(installShell());
  // Wait for existing clients to close; never interrupt an import/session.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key =>
      (key.startsWith(CORE_PREFIX) && key !== CACHE) || key === 'pokerogue-command-center-v2'
    ).map(key => caches.delete(key)));
    await warmArtwork();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate' && url.origin === ROOT.origin && url.pathname.startsWith(ROOT.pathname)) {
    // HTML and hashed dependencies come from the same installed build.
    event.respondWith(caches.open(CACHE).then(cache => cache.match(INDEX)).then(response => response || fetch(request)));
    return;
  }
  if (CORE_URLS.has(url.href)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(request)).then(response => response || fetch(request)));
    return;
  }
  if (url.href.startsWith(ASSET_BASE + '/')) {
    const response = (async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      const fetched = await fetch(request);
      if (fetched.ok) await cache.put(request, fetched.clone());
      return fetched;
    })();
    event.respondWith(response);
    event.waitUntil(response.then(() => undefined).catch(() => undefined));
  }
  // Unrelated origins, APIs and non-build files use the network without caching.
});
