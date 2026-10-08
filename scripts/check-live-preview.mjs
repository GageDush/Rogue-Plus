// Network smoke test for a separately deployed Rogue+ Play preview.
// Uses only public assets. Does NOT invoke login, upload, or savedata endpoints.
import assert from 'node:assert/strict';

const base = (process.env.ROGUE_PLUS_PREVIEW_URL ?? 'https://alpha-play-integration-rogue-plus.gagedush-bff.workers.dev').replace(/\/$/, '');
const check = async (path, expectedType, checkBody = null) => {
  const url = base + path;
  const response = await fetch(url, { headers: { 'accept': '*/*' }, signal: AbortSignal.timeout(30000) });
  const type = response.headers.get('content-type') ?? '';
  assert.ok(response.ok, path + ': HTTP ' + response.status);
  assert.ok(type.includes(expectedType), path + ': expected ' + expectedType + ' but got ' + type);
  const data = await response.arrayBuffer();
  assert.ok(data.byteLength > 0, path + ': empty body');
  if (checkBody) checkBody(Buffer.from(data), path);
  console.log('PASS', response.status, path, type, data.byteLength + ' bytes');
  return Buffer.from(data);
};
const companion = await check('/', 'text/html');
assert.match(companion.toString(), /id=["']root["']/);
const game = await check('/play/', 'text/html');
assert.match(game.toString(), /id=["']app["']/);
const manifest = JSON.parse((await check('/play/asset-manifest.json', 'application/json')).toString());
assert.ok(typeof manifest.js === 'string' && manifest.js.startsWith('./assets/'));
const js = '/play/' + manifest.js.slice(2);
await check(js, 'javascript');
for (const sheet of manifest.css || []) await check('/play/' + sheet.slice(2), 'text/css');
await check('/play/service-worker.js', 'javascript');
const locale = JSON.parse((await check('/play/locales/en/menu.json', 'application/json')).toString());
assert.ok(Object.keys(locale).length > 3, 'Missing English game locale data');
for (const image of ['logo.png','logo_fake.png','snow.png']) {
  await check('/play/images//' + image, 'image/png', bytes => {
    assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  });
}
await check('/play/images/arenas/abyss_a.png', 'image/png', bytes => {
 assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
});
const post = await fetch(base + '/play/images/arenas/abyss_a.png', {method:'POST'});
assert.equal(post.status,405,'Asset proxy must reject state-changing methods');
console.log('PASS Rogue+ Play preview static and image proxy smoke tests');
