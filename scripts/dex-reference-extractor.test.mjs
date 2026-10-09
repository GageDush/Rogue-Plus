import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enumValues, literal, syntax, fields, speciesEntries, extractSpecies, applyRoots, applyAbilities } from './dex-reference-extractor.mjs';
const enums = {SpeciesId:new Map([['TEST',1]]),PokemonType:new Map([['GRASS',11]]),SpeciesFormKey:new Map()};
const specimen = total => `const data={}; data[SpeciesId.TEST]={species:new PokemonSpecies({id:SpeciesId.TEST,generation:1,type1:PokemonType.GRASS,type2:null,baseTotal:${total},baseHp:1,baseAtk:2,baseDef:3,baseSpatk:4,baseSpdef:5,baseSpd:6}),starterCost:3};`;
test('enum extraction handles explicit/implicit numbers, strings and negatives',()=>{
  assert.deepEqual([...enumValues('enum E { A=-1,B,C=5,D }','E').values()],[-1,0,5,6]);
  assert.equal(enumValues('enum E { A="mega" }','E').get('A'),'mega');
  assert.throws(()=>enumValues('enum E { A=getId() }','E'),/Unsupported/);
});
test('roots reject missing associations, unpriced roots and missing form targets',()=>{
  const make=extra=>speciesEntries(specimen(21).replace('starterCost:3',`starterCost:3,${extra}`));
  const pack=()=>extractSpecies(make('starter:SpeciesId.TEST'),enums,{test:'Test'});
  const records=pack();applyRoots(records,make('starter:SpeciesId.TEST,evolutions:[]'),enums);
  assert.deepEqual(records[0].starterRootIds.value,[1]);assert.deepEqual(records[0].evolutionIds.value,[]);
  assert.throws(()=>applyRoots(pack(),make('starter:999'),enums),/starter root/);
  assert.throws(()=>applyRoots(pack(),make('starter:SpeciesId.TEST,evolutions:[new SpeciesEvolution({speciesId:999})]'),enums),/target/);
  assert.throws(()=>applyRoots(pack(),make('starter:SpeciesId.TEST,evolutions:[new SpeciesFormEvolution({speciesId:SpeciesId.TEST,preFormKey:"fake",evoFormKey:""})]'),enums),/form/);
  const unpriced=pack();unpriced[0].originalStarterCost.value=null;
  assert.throws(()=>applyRoots(unpriced,make('starter:SpeciesId.TEST'),enums),/unpriced/);
});
test('pinned roots cover branching, regional and explicit form relationships',()=>{
  const pack=JSON.parse(readFileSync(new URL('../companion/src/reference/generated/dex-reference.v1.json',import.meta.url)));
  const get=key=>pack.species.find(s=>s.key===key);
  assert.deepEqual(get('GARCHOMP').starterRootIds.value,[get('GIBLE').id]);
  assert.equal(get('EEVEE').evolutionIds.value.length,8);
  assert.deepEqual(get('ALOLA_RAICHU').starterRootIds.value,[get('PICHU').id]);
  assert.ok(get('PIKACHU').evolutionLinks.value.some(link=>link.fromFormKey==='partner'));
  assert.ok(get('CHARIZARD').formChangeLinks.value.some(link=>link.toFormKey==='mega-x'));
  assert.equal(pack.coverage.roots.count,1084);
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
test('ability slots preserve NONE, duplicates and absent hidden slots without ownership',()=>{
  const abilityEnums={...enums,AbilityId:new Map([['NONE',0],['TEST',1],['ABILITY_314',314]])};
  const input=specimen(21).replace('baseTotal:21','ability1:AbilityId.TEST,ability2:AbilityId.NONE,abilityHidden:AbilityId.NONE,baseTotal:21')
    .replace('starterCost:3','starterCost:3,passives:{0:AbilityId.TEST}');
  const entries=speciesEntries(input), records=extractSpecies(entries,abilityEnums,{test:'Test'});
  const names={test:{name:'Official Ability'}};
  const abilities=applyAbilities(records,entries,abilityEnums,names);
  assert.equal(abilities.length,1);
  assert.deepEqual(records[0].forms.value[0].abilities.value,{first:1,second:null,hidden:null});
  assert.equal(records[0].forms.value[0].passiveAbilityId.value,1);
  assert.throws(()=>applyAbilities(records,entries,abilityEnums,{}),/Missing official name/);
  const bad=speciesEntries(input.replace('ability1:AbilityId.TEST','ability1:999'));
  assert.throws(()=>applyAbilities(records,bad,abilityEnums,names),/Missing named ability/);
});
test('pinned abilities resolve ordinary, hidden and form-specific passives',()=>{
  const pack=JSON.parse(readFileSync(new URL('../companion/src/reference/generated/dex-reference.v1.json',import.meta.url)));
  const get=key=>pack.species.find(s=>s.key===key), name=id=>pack.abilities.find(a=>a.id===id).name;
  const bulb=get('BULBASAUR').forms.value[0];
  assert.equal(name(bulb.abilities.value.first),'Overgrow');assert.equal(bulb.abilities.value.second,null);
  assert.equal(name(bulb.abilities.value.hidden),'Chlorophyll');assert.equal(name(bulb.passiveAbilityId.value),'Grassy Surge');
  const venusaur=get('VENUSAUR').forms.value;
  assert.equal(name(venusaur.find(f=>f.key==='mega').passiveAbilityId.value),'Seed Sower');
  assert.equal(pack.coverage.abilities.status,'partial');
  assert.ok(pack.species.every(s=>s.forms.value.every(f=>f.abilities.status==='known'&&f.passiveAbilityId.status==='known')));
  assert.equal(pack.abilities.some(a=>a.key==='ABILITY_314'),false);
});
