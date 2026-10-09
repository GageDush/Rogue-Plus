import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { enumValues, speciesEntries, extractSpecies, applyRoots, applyAbilities } from './dex-reference-extractor.mjs';
const root = resolve(import.meta.dirname,'..');
// Gitlink at the unchanged game revision; do not use the locales moving branch.
export const localeCommit = '0696f674f631b47f208f5d687b427ed3e7cd81b0';
export async function generateDexReferences() {
  const lock = JSON.parse(await readFile(resolve(root,'reference-sources.lock.json'),'utf8'));
  if (lock.game.commit !== 'e734a202a912cc969409c84111b5ab6a15fc7774') throw Error('Review Dex extractor before changing game revision');
  const paths = ['src/enums/species-id.ts','src/enums/pokemon-type.ts','src/enums/species-form-key.ts',
    ...Array.from({length:9},(_,i) => `src/data/balance/species/generation-${String(i+1).padStart(2,'0')}.ts`)];
  const sources = [];
  async function source(repository, commit, path) {
    const response = await fetch(`https://raw.githubusercontent.com/${repository}/${commit}/${path}`, {signal:AbortSignal.timeout(45000)});
    if (!response.ok) throw Error(`Pinned source ${response.status}: ${path}`);
    const text = await response.text();
    sources.push({repository,commit,path,sha256:createHash('sha256').update(text).digest('hex')});
    return text;
  }
  const texts = await Promise.all(paths.map(path => source(lock.game.repository, lock.game.commit, path)));
  const names = JSON.parse(await source('pagefaultgames/pokerogue-locales',localeCommit,'en/pokemon.json'));
  const enums = Object.fromEntries(['SpeciesId','PokemonType','SpeciesFormKey'].map((name,i) => [name,enumValues(texts[i],name)]));
  const entries = texts.slice(3).flatMap(speciesEntries);
  const species = extractSpecies(entries,enums,names);
  applyRoots(species,entries,enums);
  const abilityPath='src/enums/ability-id.ts';paths.push(abilityPath);
  enums.AbilityId=enumValues(await source(lock.game.repository,lock.game.commit,abilityPath),'AbilityId');
  const abilityNames=JSON.parse(await source('pagefaultgames/pokerogue-locales',localeCommit,'en/ability.json'));
  const abilities=applyAbilities(species,entries,enums,abilityNames);
  for (const path of ['src/data/species-data-registry.ts','src/data/pokemon-species.ts']) {
    paths.push(path); await source(lock.game.repository,lock.game.commit,path);
  }
  const expectedIds = [...enums.SpeciesId.values()].filter(id => id > 0);
  if (expectedIds.length !== species.length || expectedIds.some(id => !species.some(s => s.id === id))) throw Error('Incomplete species declaration coverage');
  const types = [...enums.PokemonType].filter(([,id]) => id >= 0).map(([key,id]) => ({key,id,name:key[0]+key.slice(1).toLowerCase()}));
  const pending = boundary => ({status:'unavailable',count:0,boundary});
  const pack = {schemaVersion:1,referenceVersion:'upstream-'+lock.game.commit.slice(0,12),
    provenance:{repository:lock.game.repository,commit:lock.game.commit,paths},
    coverage:{species:{status:'complete',count:species.length,boundary:'Every non-NONE SpeciesId declaration and explicit PokemonForm at the pinned game revision.'},
      roots:{status:'complete',count:species.length,boundary:'Explicit starter associations and declared evolution/form-change links; no evolution eligibility claims.'},
      abilities:{status:'partial',count:abilities.length,boundary:'Named ability IDs and all declared per-form ordinary/hidden slots and passives, including index-zero passive fallback. Official unnamed ABILITY_314/ABILITY_317 placeholders excluded.'}, moves:pending('Move packet pending.'), selection:pending('Starter compatibility packet pending.')},
    species,types,abilities,moves:[]};
  const output = resolve(root,'companion/src/reference/generated/dex-reference.v1.json');
  await mkdir(dirname(output),{recursive:true});
  await writeFile(output,JSON.stringify(pack,null,2)+'\n');
  const report = {schemaVersion:1,gameCommit:lock.game.commit,localeCommit,
    counts:{species:species.length,forms:species.reduce((n,s)=>n+s.forms.value.length,0)},
    sources:sources.sort((a,b)=>(a.repository+'/'+a.path).localeCompare(b.repository+'/'+b.path))};
  await writeFile(resolve(root,'companion/src/reference/generated/dex-coverage.v1.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`Generated ${report.counts.species} species / ${report.counts.forms} forms at unchanged pin`);
  return pack;
}
