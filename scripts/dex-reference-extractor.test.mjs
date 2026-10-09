import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enumValues, literal, syntax, fields, speciesEntries, extractSpecies } from './dex-reference-extractor.mjs';
const enums = {SpeciesId:new Map([['TEST',1]]),PokemonType:new Map([['GRASS',11]]),SpeciesFormKey:new Map()};
const specimen = total => `const data={}; data[SpeciesId.TEST]={species:new PokemonSpecies({id:SpeciesId.TEST,generation:1,type1:PokemonType.GRASS,type2:null,baseTotal:${total},baseHp:1,baseAtk:2,baseDef:3,baseSpatk:4,baseSpdef:5,baseSpd:6}),starterCost:3};`;
test('enum extraction handles explicit/implicit numbers, strings and negatives',()=>{
  assert.deepEqual([...enumValues('enum E { A=-1,B,C=5,D }','E').values()],[-1,0,5,6]);
  assert.equal(enumValues('enum E { A="mega" }','E').get('A'),'mega');
  assert.throws(()=>enumValues('enum E { A=getId() }','E'),/Unsupported/);
});
test('static literals reject calls, spreads, malformed syntax and duplicate fields',()=>{
  assert.throws(()=>literal(syntax('call()').statements[0].expression),/Unsupported/);
  assert.throws(()=>syntax('const a = {'),/Invalid TypeScript/);
  assert.throws(()=>fields(syntax('({a:1,a:2})').statements[0].expression.expression),/Duplicate/);
  assert.throws(()=>speciesEntries('a[SpeciesId.TEST]={...other}'),/Unsupported/);
});
test('species values preserve absent cost, verify totals and reject duplicate IDs',()=>{
  const entries=speciesEntries(specimen(21)), record=extractSpecies(entries,enums,{test:'Official Test'})[0];
  assert.equal(record.forms.value[0].baseStatTotal.value,21);
  assert.deepEqual(record.forms.value[0].types.value,[11]);
  assert.equal(record.forms.value[0].abilities.status,'unavailable');
  assert.throws(()=>extractSpecies(speciesEntries(specimen(22)),enums,{test:'Test'}),/total mismatch/);
  assert.throws(()=>extractSpecies([...entries,...entries],enums,{test:'Test'}),/identity/);
  assert.throws(()=>extractSpecies(entries,enums,{}),/Missing official name/);
  assert.equal(extractSpecies(speciesEntries(specimen(21).replace('starterCost:3','other:3')),enums,{test:'Test'})[0].originalStarterCost.value,null);
  assert.deepEqual(extractSpecies(entries,enums,{test:'Test'}),extractSpecies(entries,enums,{test:'Test'}));
});
test('pinned pack covers declarations, generations, regional and special forms',()=>{
  const pack=JSON.parse(readFileSync(new URL('../companion/src/reference/generated/dex-reference.v1.json',import.meta.url)));
  assert.equal(pack.species.length,1084);
  assert.equal(pack.species.reduce((n,s)=>n+s.forms.value.length,0),1500);
  const species=key=>pack.species.find(s=>s.key===key);
  assert.equal(species('BULBASAUR').name,'Bulbasaur');
  assert.equal(species('BULBASAUR').forms.value[0].baseStatTotal.value,318);
  assert.equal(species('GARCHOMP').forms.value[0].baseStats.value.attack,130);
  assert.equal(species('ALOLA_VULPIX').forms.value[0].types.value[0],14);
  assert.equal(species('CHARIZARD').forms.value.find(f=>f.key==='mega-x').baseStatTotal.value,634);
  assert.equal(species('MIRAIDON').generation.value,9);
  assert.equal(pack.coverage.selection.status,'unavailable');
});
