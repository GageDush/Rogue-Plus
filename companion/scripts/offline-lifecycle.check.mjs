// Separate Node lifecycle checks; excluded from Vitest's application test discovery.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildOfflineWorker } from './offline-build.mjs';

const template = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const scope = 'https://synthetic.example/companion/';
const shell = ['./index.html', './assets/app.js', './assets/app.css', './rogue-mark.png'];
const worker = revision => template.replace('__ROGUE_BUILD_ID__', revision).replace("['__ROGUE_PRECACHE__']", JSON.stringify(shell));
function harness(code, storage = new Map(), network = { offline: false, failed: '', version: 'old' }) {
  const handlers = {}; let skips = 0; let claims = 0;
  const key = request => typeof request === 'string' ? request : request.url;
  const fetch = async request => {
    const url = key(request);
    if (network.offline || url.includes(network.failed || '\0')) throw new Error('Network unavailable');
    return new Response(url.includes('index.html') ? network.version : 'synthetic ' + url);
  };
  const caches = {
    async open(name) {
      if (!storage.has(name)) storage.set(name, new Map());
      const values = storage.get(name);
      return {
        async addAll(requests) {
          const responses = await Promise.all(requests.map(fetch));
          if (responses.some(r => !r.ok)) throw new Error('HTTP failure');
          requests.forEach((r, i) => values.set(key(r), responses[i].clone()));
        },
        async match(request) { return values.get(key(request))?.clone(); },
        async put(request, response) { values.set(key(request), response.clone()); },
      };
    },
    async keys() { return [...storage.keys()]; },
    async delete(name) { return storage.delete(name); },
  };
  vm.runInNewContext(code, { URL, Request, AbortController, setTimeout, clearTimeout, fetch, caches,
    self: { registration: { scope }, addEventListener: (name, fn) => { handlers[name] = fn; },
      skipWaiting: () => { skips++; }, clients: { claim: () => { claims++; } } } });
  return {
    storage, network, get skips() { return skips; }, get claims() { return claims; },
    async lifecycle(name) { let done; handlers[name]({ waitUntil: p => { done = p; } }); await done; },
    async request(path, mode = 'cors', method = 'GET') {
      let response; const waits = [];
      handlers.fetch({ request: { url: new URL(path, scope).href, mode, method },
        respondWith: p => { response = p; }, waitUntil: p => waits.push(p) });
      const result = await response; await Promise.all(waits); return result;
    },
  };
}
test('build includes all local dependencies and deterministic content revisions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'rogue-offline-'));
  try {
    await mkdir(join(directory, 'assets'));
    for (const [path, content] of [['sw.js', template], ['index.html', 'shell'], ['assets/app.js', 'script'], ['assets/app.css', 'styles'], ['rogue-mark.png', 'mark']]) await writeFile(join(directory, path), content);
    const first = await buildOfflineWorker(directory);
    assert.deepEqual(first.paths, ['assets/app.css', 'assets/app.js', 'index.html', 'rogue-mark.png']);
    assert.ok(!(await readFile(join(directory, 'sw.js'), 'utf8')).includes('__ROGUE_'));
    await writeFile(join(directory, 'sw.js'), template);
    assert.equal((await buildOfflineWorker(directory)).revision, first.revision);
    await writeFile(join(directory, 'sw.js'), template); await writeFile(join(directory, 'assets/app.js'), 'new script');
    assert.notEqual((await buildOfflineWorker(directory)).revision, first.revision);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('fresh install serves the shell and every dependency with network fully offline', async () => {
  const app = harness(worker('old')); await app.lifecycle('install'); app.network.offline = true;
  assert.equal(await (await app.request('./', 'navigate')).text(), 'old');
  for (const path of shell) assert.ok((await app.request(path)).ok);
  assert.equal(app.skips, 0); assert.equal(app.claims, 0);
});
test('interrupted update removes incomplete cache and leaves the old build available', async () => {
  const old = harness(worker('old')); await old.lifecycle('install');
  const next = harness(worker('new'), old.storage, { offline: false, failed: 'app.css', version: 'new' });
  await assert.rejects(next.lifecycle('install'));
  assert.ok(old.storage.has('rogue-plus-shell-old')); assert.ok(!old.storage.has('rogue-plus-shell-new'));
  old.network.offline = true; assert.equal(await (await old.request('./', 'navigate')).text(), 'old');
});
test('HTML remains paired with old assets while the complete update waits', async () => {
  const old = harness(worker('old')); await old.lifecycle('install'); old.network.version = 'new';
  const next = harness(worker('new'), old.storage, old.network); await next.lifecycle('install');
  assert.equal(await (await old.request('./', 'navigate')).text(), 'old');
  assert.equal(next.skips, 0); assert.equal(next.claims, 0);
  next.storage.set('unrelated-app', new Map()); next.storage.set('pokerogue-command-center-v2', new Map());
  await next.lifecycle('activate');
  assert.ok(next.storage.has('unrelated-app')); assert.ok(!next.storage.has('rogue-plus-shell-old'));
  assert.ok(!next.storage.has('pokerogue-command-center-v2'));
  assert.equal(await (await next.request('./', 'navigate')).text(), 'new');
});
test('rollback installs a coherent previous build before retiring the newer cache', async () => {
  const next = harness(worker('new')); next.network.version = 'new'; await next.lifecycle('install');
  const old = harness(worker('old'), next.storage, { offline: false, failed: '', version: 'old' });
  await old.lifecycle('install'); await old.lifecycle('activate'); old.network.offline = true;
  assert.equal(await (await old.request('./', 'navigate')).text(), 'old');
  for (const path of shell) assert.ok((await old.request(path)).ok);
});
test('warmed pinned artwork stays offline; APIs, other caches and writes are untouched', async () => {
  const app = harness(worker('old')); await app.lifecycle('install'); await app.lifecycle('activate');
  assert.equal(app.storage.get('pokerogue-assets-056a1f4').size, 36);
  app.network.offline = true;
  const image = 'https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/056a1f408f26a3be4fef243f7462cb43608c7928/images/pokemon_icons_1.png';
  assert.ok((await app.request(image)).ok);
  assert.equal(await app.request('https://api.pokerogue.net/account/info'), undefined);
  assert.equal(await app.request('./assets/app.js', 'cors', 'POST'), undefined);
});
test('artwork outages do not prevent the cached app from activating', async () => {
  const app = harness(worker('old')); await app.lifecycle('install'); app.network.offline = true;
  await app.lifecycle('activate'); assert.ok((await app.request('./', 'navigate')).ok);
});
