// Rogue+ Play image origin adapter. The browser requests same-origin /play/images/*.
// Never proxy authentication, arbitrary URLs, user saves, or POST requests.
const REV = '056a1f408f26a3be4fef243f7462cb43608c7928';
const PREFIX = '/play/images/';
const ORIGIN = 'https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/' + REV + '/images/';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith(PREFIX)) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405 });
      }
      const tail = url.pathname.slice(PREFIX.length).replace(/^\\/+/, '');
      if (!tail || tail.includes('..') || !/^[a-zA-Z0-9_\-./%]+$/.test(tail)) {
        return new Response('Invalid image path', { status: 400 });
      }
      const target = new URL(tail, ORIGIN);
      if (!target.href.startsWith(ORIGIN)) return new Response('Invalid path', { status: 400 });
      try {
        const upstream = await fetch(target, {
          method: request.method,
          headers: request.headers.has('range') ? { range: request.headers.get('range') } : {},
          cf: { cacheEverything: true, cacheTtl: 604800 }
        });
        if (!upstream.ok) {
          return new Response('Asset unavailable', { status: upstream.status });
        }
        const headers = new Headers();
        for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag']) {
          const value = upstream.headers.get(h);
          if (value) headers.set(h, value);
        }
        headers.set('cache-control', 'public, max-age=86400, stale-while-revalidate=604800');
        headers.set('x-rogue-plus-asset-source', 'pinned-pokerogue');
        return new Response(upstream.body, { status: upstream.status, headers });
      } catch {
        return new Response('Image source temporarily unavailable', { status: 502 });
      }
    }
    return env.ASSETS.fetch(request);
  }
};
