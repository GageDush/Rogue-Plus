import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..', 'dist');
const read = file => readFileSync(join(root, file), 'utf8');
const home = read('index.html');
const play = read('play/index.html');
assert.match(home, /id="root"/, 'Companion app shell must be present');
assert.match(play, /id="app"/, 'Upstream PokéRogue app shell must be present');
assert.ok(!home.includes('src/main.ts'), 'Raw TypeScript cannot be served to the browser');
assert.ok(!play.includes('src/main.ts'), 'Raw game TypeScript cannot be served to the browser');
const manifest = JSON.parse(read('play/asset-manifest.json'));
for (const relative of [manifest.js, ...(manifest.css || [])]) {
  assert.ok(relative.startsWith('./'), 'Game bundles must use relative paths: ' + relative);
  assert.ok(existsSync(join(root, 'play', relative)), 'Missing bundled game asset: ' + relative);
}
const required = ['play/service-worker.js'];
for (const p of required) assert.ok(existsSync(join(root, p)), 'Missing game runtime resource: ' + p);
function inspectDirectory(dir) {
  let files = 0, maxBytes = 0, biggest = '';
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const s = inspectDirectory(full);
      files += s.files;
      if (s.maxBytes > maxBytes) { maxBytes = s.maxBytes; biggest = s.biggest; }
    } else if (entry.isFile()) {
      const bytes = statSync(full).size;
      files++;
      if (bytes > maxBytes) { maxBytes = bytes; biggest = full; }
    }
  }
  return { files, maxBytes, biggest };
}
const s = inspectDirectory(root);
const categories = readdirSync(join(root,'play'), {withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>({folder:e.name,...inspectDirectory(join(root,'play',e.name))})).sort((a,b)=>b.files-a.files);
console.log('Game asset inventory:',JSON.stringify(categories.map(x=>({folder:x.folder,files:x.files,maxBytes:x.maxBytes})),null,2));
console.log(JSON.stringify({ result: 'PASS', entryPoints: ['/', '/play/'], gameEntrypoint: manifest.js, totalFiles: s.files, largestAssetBytes: s.maxBytes, largestAsset: s.biggest }, null, 2));
