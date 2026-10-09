import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

/** Local Vite server, isolated synthetic UI; fetches the actual pinned public assets. */
export async function checkArtwork(browser, base, captures) {
  if (captures) await mkdir(captures, { recursive: true });
  for (const [width, height, theme] of [[320, 720, 'light'], [390, 844, 'dark'], [1100, 390, 'light'], [1600, 900, 'dark']]) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const expected = await page.evaluate(async theme => {
      const React = (await import('/node_modules/.vite/deps/react.js')).default;
      const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
      const { PokemonSprite } = await import('/src/ui/components/PokemonSprite.tsx');
      const { resolvePokemonAsset } = await import('/src/domain/assets.ts');
      document.documentElement.dataset.theme = theme;
      const host = document.createElement('section');
      host.id = 'artwork-proof'; host.style.cssText = 'position:relative;z-index:999;background:var(--bg);color:var(--text);padding:12px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px';
      document.body.replaceChildren(host);
      const requests = [25, 152, 252, 387, 495, 650, 722, 810, 906, 642, 4144, 8901].map(id => ({ id }));
      requests.push({ id: 25, shinyTier: 1 }, { id: 25, shinyTier: 2 }, { id: 25, shinyTier: 3 });
      const resolved = await Promise.all(requests.map(resolvePokemonAsset));
      createRoot(host).render(React.createElement(React.Fragment, null, ...requests.map((request, i) =>
        React.createElement('div', { key: i }, React.createElement(PokemonSprite, { request, size: 64, title: 'Synthetic art ' + i }), React.createElement('span', null, '#' + request.id + ' tier ' + (request.shinyTier ?? 0))))));
      return resolved.map(asset => ({ key: asset.atlasKey, tier: asset.shinyTier, fallback: asset.fallbackFromTier, url: asset.atlasImageUrl }));
    }, theme);
    await page.waitForFunction(() => document.querySelectorAll('#artwork-proof [data-asset-revision]').length === 15, null, { timeout: 60000 });
    const actual = await page.locator('#artwork-proof [data-asset-revision]').evaluateAll(nodes => nodes.map(n => ({
      key: n.dataset.atlasKey, tier: Number(n.dataset.shinyTier), fallback: n.dataset.fallbackFromTier ? Number(n.dataset.fallbackFromTier) : null,
    })));
    assert.deepEqual(actual, expected.map(({ key, tier, fallback }) => ({ key, tier, fallback })));
    // Canvas reads prove CORS-compatible PNG pixels, rather than metadata or a CSS URL alone.
    const pixels = await page.evaluate(async urls => Promise.all([...new Set(urls)].map(async url => {
      const image = new Image(); image.crossOrigin = 'anonymous'; image.src = url; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((value, i) => i % 4 === 3 && value > 0);
    })), expected.map(asset => asset.url));
    assert.ok(pixels.every(Boolean), 'Actual pinned image pixels missing');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Artwork fixture overflow');
    if (captures) await page.screenshot({ path: `${captures}/artwork-${width}-${theme}.png` });
    await context.close();
    console.log(`PASS: pinned artwork ${width}x${height} ${theme}, 15 rendered requests and actual CORS pixels`);
  }
  for (const extension of ['png', 'json']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.route(`**/pokemon_icons_*.${extension}`, route => route.abort('failed'));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Try sample view/ }).click();
    await page.locator('.bottom-nav').getByRole('button', { name: 'Dex', exact: true }).click();
    await page.getByRole('img', { name: /icon unavailable/ }).first().waitFor();
    assert.equal(await page.locator('[data-asset-revision]').count(), 0, `${extension} failure presented as success`);
    assert.match(await page.getByRole('img', { name: /icon unavailable/ }).first().innerText(), /^#\d+/);
    await context.close();
  }
  console.log('Artwork: four viewport/theme fixtures, 15 requests each, real CORS pixels and JSON/PNG failure states passed.');
}

// Optional standalone runner; Playwright is installed separately like the other browser checks.
if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    await checkArtwork(browser, process.env.ROGUE_PLUS_BASE_URL || 'http://127.0.0.1:5173/', process.env.ROGUE_PLUS_CAPTURE_DIR);
  } finally { await browser.close(); }
}
