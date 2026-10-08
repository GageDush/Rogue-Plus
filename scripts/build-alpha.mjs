import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, rmSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const companion = resolve(root, 'companion');
const upstream = resolve(root, 'upstream');
if (!existsSync(resolve(companion, 'package.json')) || !existsSync(resolve(upstream, 'package.json'))) {
  throw new Error('Missing companion/ or upstream/. Follow docs/NEXT_TASK.md.');
}
if (!readFileSync(resolve(upstream, 'src/main.ts'), 'utf8').includes('installRoguePlusBridge(game)')) {
  throw new Error('Game bridge not patched. Run npm run patch.');
}
if (!readFileSync(resolve(companion, 'src/App.tsx'), 'utf8').includes('function PlayPage()')) {
  throw new Error('Companion Play screen not patched. Run npm run patch.');
}
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
run('npm', ['run', 'build'], companion);
run('pnpm', ['build'], upstream);
const dist = resolve(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(resolve(companion, 'dist'), dist, { recursive: true });
cpSync(resolve(upstream, 'dist'), resolve(dist, 'play'), { recursive: true });
if (!existsSync(resolve(dist, 'index.html')) || !existsSync(resolve(dist, 'play/index.html'))) {
  throw new Error('Combined output does not contain both entry points.');
}
console.log('Prepared dist/index.html and dist/play/index.html.');
