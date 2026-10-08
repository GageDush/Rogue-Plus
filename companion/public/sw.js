const CACHE = 'pokerogue-command-center-v2';
const ASSET_CACHE = 'pokerogue-assets-056a1f4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

const ASSET_BASE =
  'https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/056a1f408f26a3be4fef243f7462cb43608c7928/images';

const ICON_ATLASES = [];
for (let generation = 1; generation <= 9; generation += 1) {
  ICON_ATLASES.push('pokemon_icons_' + generation);
  ICON_ATLASES.push('pokemon_icons_' + generation + 'v');
}
const ASSET_URLS = ICON_ATLASES.flatMap(key => [
  ASSET_BASE + '/' + key + '.json',
  ASSET_BASE + '/' + key + '.png',
]);

async function warmAssetCache() {
  const cache = await caches.open(ASSET_CACHE);
  await Promise.allSettled(
    ASSET_URLS.map(async url => {
      if (await cache.match(url)) return;
      const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
      if (response.ok) await cache.put(url, response.clone());
    })
  );
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE && key !== ASSET_CACHE)
            .map(key => caches.delete(key))
        )
      ),
      warmAssetCache(),
    ]).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      cached =>
        cached ||
        fetch(event.request).then(response => {
          const copy = response.clone();
          const targetCache = event.request.url.startsWith(ASSET_BASE) ? ASSET_CACHE : CACHE;
          caches
            .open(targetCache)
            .then(cache => cache.put(event.request, copy))
            .catch(() => undefined);
          return response;
        })
    )
  );
});
