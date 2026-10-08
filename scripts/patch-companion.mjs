import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const appPath = resolve(root, 'companion/src/App.tsx');
const workerPath = resolve(root, 'companion/public/sw.js');
if (!existsSync(appPath) || !existsSync(workerPath)) {
  throw new Error('Missing original companion/ App.tsx or service worker.');
}
let app = readFileSync(appPath, 'utf8');
function replaceOnce(from, to) {
  if (app.includes(to)) return;
  if (!app.includes(from)) throw new Error('Companion patch anchor changed: ' + from.slice(0, 50));
  app = app.replace(from, to);
}
replaceOnce("type Page =\n  | 'home'", "type Page =\n  | 'play'\n  | 'home'");
replaceOnce("const pageTitles: Record<Page, string> = {\n  home:", "const pageTitles: Record<Page, string> = {\n  play: 'Play PokéRogue',\n  home:");
const nav = "<NavButton icon={<Swords />} label='Teams' active={page === 'teams'} onClick={() => navigate('teams')} />";
const add = "<NavButton icon={<Swords />} label='Play' active={page === 'play'} onClick={() => navigate('play')} />\n        " + nav;
if (!app.includes("label='Play' active={page === 'play'}")) {
  const count = app.split(nav).length - 1;
  if (count !== 2) throw new Error('Expected Teams links in both navigation bars, found ' + count);
  app = app.replaceAll(nav, add);
}
replaceOnce("<div className='content'>\n          {page === 'home'", "<div className='content'>\n          {page === 'play' && <PlayPage />}\n          {page === 'home'");
if (!app.includes('function PlayPage()')) {
  app += [
    '',
    'function PlayPage() {',
    '  return (',
    "    <section className='onboarding'>",
    "      <div className='eyebrow'>ROGUE+ PLAY · EXPERIMENTAL</div>",
    '      <h2>PokéRogue with Rogue+ extensions</h2>',
    '      <p>The game runs as a separate upstream build under /play/. During battle, tap the R+ button for a damage preview.</p>',
    "      <div className='button-row'>",
    "        <a className='primary big' href='/play/'>Launch PokéRogue</a>",
    '      </div>',
    '      <p>Gameplay login and session saving depend on upstream services. Account data is not uploaded to Rogue+.</p>',
    '    </section>',
    '  );',
    '}',
    ''
  ].join('\n');
}
writeFileSync(appPath, app);
let worker = readFileSync(workerPath, 'utf8');
const cleanupBefore = ".filter(key => key !== CACHE && key !== ASSET_CACHE)";
const cleanupAfter = ".filter(key => key.startsWith('pokerogue-command-center-') && key !== CACHE)";
if (!worker.includes(cleanupAfter)) {
  if (!worker.includes(cleanupBefore)) throw new Error('Unexpected cache cleanup logic; review before patching.');
  worker = worker.replace(cleanupBefore, cleanupAfter);
}
const fetchBefore = "self.addEventListener('fetch', event => {\n  if (event.request.method !== 'GET') return;";
const fetchAfter = "self.addEventListener('fetch', event => {\n  if (new URL(event.request.url).pathname.startsWith('/play/')) return;\n  if (event.request.method !== 'GET') return;";
if (!worker.includes(fetchAfter)) {
  if (!worker.includes(fetchBefore)) throw new Error('Service-worker fetch anchor changed.');
  worker = worker.replace(fetchBefore, fetchAfter);
}
writeFileSync(workerPath, worker);
console.log('Companion Play navigation installed; game caches isolated.');
