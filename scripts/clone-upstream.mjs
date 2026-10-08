import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const lock = JSON.parse(readFileSync(resolve(root, 'upstream.lock.json'), 'utf8'));
const target = resolve(root, 'upstream');
const git = (...args) => execFileSync('git', args, { stdio: 'inherit' });
if (!existsSync(resolve(target, '.git'))) {
  git('clone', '--branch', lock.branch, '--depth', '1', '--recurse-submodules', '--shallow-submodules', lock.repository, target);
}
let sha = execFileSync('git', ['-C', target, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (sha !== lock.ref) {
  git('-C', target, 'fetch', '--depth', '1', 'origin', lock.ref);
  git('-C', target, 'checkout', '--detach', lock.ref);
}
sha = execFileSync('git', ['-C', target, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (sha !== lock.ref) throw new Error('Upstream source revision does not match upstream.lock.json.');
git('-C', target, 'submodule', 'update', '--init', '--recursive', '--depth', '1');
console.log('Upstream pinned at ' + sha + '. Install pnpm dependencies inside upstream/.');
