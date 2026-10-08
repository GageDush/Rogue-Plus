import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
test('Pinned upstream SHA', () => {
  const ref = JSON.parse(read('upstream.lock.json')).ref;
  assert.match(ref, /^[a-f0-9]{40}$/);
});
test('Modules support lifecycle cleanup', () => {
  const bridge = read('game-integration/bridge.ts');
  assert.match(bridge, /function enable/);
  assert.match(bridge, /function disable/);
  assert.match(bridge, /damagePreviewModule/);
});
test('Damage preview requests simulation', () => {
  const code = read('game-integration/modules/damage-preview.ts');
  assert.match(code, /simulated: true/);
  assert.doesNotMatch(code, /setHp\(|applyDamage\(|setStatus\(/);
});
test('Root cache does not own game path', () => {
  const patch = read('scripts/patch-companion.mjs');
  assert.match(patch, /startsWith\('\/play\/'\)/);
  assert.match(patch, /key\.startsWith/);
});
test('Build assembles companion and game entrypoints', () => {
  const build = read('scripts/build-alpha.mjs');
  assert.match(build, /play\/index.html/);
});
test('Node scripts pass syntax checks', () => {
  for (const file of ['clone-upstream.mjs', 'patch-game.mjs', 'patch-companion.mjs', 'build-alpha.mjs']) {
    execFileSync('node', ['--check', resolve(root, 'scripts', file)]);
  }
});

test('Image proxy is narrowly scoped and immutable', () => {
  const cfg = JSON.parse(read('wrangler.jsonc'));
  assert.equal(cfg.assets.directory, './dist');
  assert.equal(cfg.assets.binding, 'ASSETS');
  assert.deepEqual(cfg.assets.run_worker_first, ['/play/images/*']);
  const source = read('worker/asset-proxy.js');
  assert.match(source, /056a1f408f26a3be4fef243f7462cb43608c7928/);
  assert.match(source, /method !== 'GET'/);
  assert.doesNotMatch(source, /savedata|\/auth\//i);
});

test('Status moves bypass the attack damage calculator', () => {
  const code = read('game-integration/modules/damage-preview.ts');
  assert.match(code, /import \{ MoveCategory \} from '\.\.\/\.\.\/enums\/move-category'/);
  const statusPosition = code.indexOf('move.category === MoveCategory.STATUS');
  const calculationPosition = code.indexOf('target.getAttackDamage({');
  assert.ok(statusPosition >= 0 && calculationPosition > statusPosition, 'Status must be handled before damage calculation');
  assert.match(code, /no direct attack damage/);
});

test('Mobile preview output is a separate block with a non-overlapping refresh control', () => {
  const code = read('game-integration/modules/damage-preview.ts');
  assert.match(code, /\.rp-panel-output\{display:block/);
  assert.match(code, /\.rp-panel-refresh\{display:block/);
  assert.match(code, /\.rp-panel-moves\{display:flex;flex-wrap:wrap/);
  assert.match(code, /aria-live/);
});
