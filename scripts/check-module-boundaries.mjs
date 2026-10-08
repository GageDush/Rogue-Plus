import { readdir, readFile } from 'node:fs/promises';
import { resolve, join, dirname, relative, sep } from 'node:path';

const sourceRoot = resolve(import.meta.dirname, '../companion/src');
const errors = [];
let filesChecked = 0;
async function walk(path) {
  for (const entry of await readdir(path, {withFileTypes:true})) {
    const full=join(path,entry.name);
    if(entry.isDirectory()) await walk(full);
    else if(/\.[cm]?[jt]sx?$/.test(entry.name)) {
      filesChecked++;
      const from=relative(sourceRoot,full).split(sep);
      const source=await readFile(full,'utf8');
      for (const match of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
        const spec=match[1];
        if(!spec.startsWith('.')) continue;
        const target=relative(sourceRoot,resolve(dirname(full),spec)).split(sep);
        const feature=from[0]==='features' ? from[1] : null;
        const targetFeature=target[0]==='features' ? target[1] : null;
        if(feature && targetFeature && feature!==targetFeature) {
          errors.push(from.join('/')+' imports other feature '+target.join('/'));
        }
        if(['domain','import','storage','ui'].includes(from[0])&&target[0]==='features') {
          errors.push(from.join('/')+' depends on feature UI '+target.join('/'));
        }
        if(['domain','import','storage'].includes(from[0])&&target[0]==='ui') {
          errors.push(from.join('/')+' depends on shared UI '+target.join('/'));
        }
      }
    }
  }
}
await walk(sourceRoot);
const app=await readFile(join(sourceRoot,'App.tsx'),'utf8');
for(const screen of ['HomePage','DexPage','DetailPage','TeamsPage','HuntPage','FusionPage','TrainerPage','ChangesPage','MorePage','SettingsPage']) {
  if(app.includes('function '+screen+'(')) errors.push('App.tsx still contains '+screen+' implementation');
  if(!app.includes('<'+screen)) errors.push('App.tsx does not route to '+screen);
}
if(errors.length) {
  console.error('Rogue+ module boundary failures:\n'+errors.join('\n'));
  process.exitCode=1;
} else {
  console.log('PASS: '+filesChecked+' source files obey feature, domain and storage boundaries; 10 screens routed from app shell');
}
