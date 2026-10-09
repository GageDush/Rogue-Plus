import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

async function files(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await files(join(directory, entry.name), path + '/'));
    else if (path !== 'sw.js' && !path.endsWith('.map')) result.push(path);
  }
  return result.sort();
}
export async function buildOfflineWorker(directory) {
  const template = await readFile(join(directory, 'sw.js'), 'utf8');
  if (!template.includes('__ROGUE_BUILD_ID__') || !template.includes("['__ROGUE_PRECACHE__']")) throw new Error('Offline worker template markers missing.');
  const paths = await files(directory);
  if (!paths.includes('index.html') || !paths.some(path => path.endsWith('.js')) || !paths.some(path => path.endsWith('.css'))) throw new Error('Offline build is missing app dependencies.');
  const hash = createHash('sha256').update(template);
  for (const path of paths) hash.update(path).update(await readFile(join(directory, path)));
  const revision = hash.digest('hex').slice(0, 20);
  const worker = template.replace('__ROGUE_BUILD_ID__', revision)
    .replace("['__ROGUE_PRECACHE__']", JSON.stringify(paths.map(path => './' + path)));
  await writeFile(join(directory, 'sw.js'), worker);
  return { revision, paths };
}
export function offlineBuildPlugin() {
  let directory;
  return {
    name: 'rogue-plus-offline-shell', apply: 'build',
    configResolved(config) { directory = resolve(config.root, config.build.outDir); },
    async closeBundle() { await buildOfflineWorker(directory); },
  };
}
