import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enumValues, literal, syntax, fields, speciesEntries, extractSpecies, applyRoots, applyAbilities, extractMoves, applyLearnsets, camel } from './dex-reference-extractor.mjs';
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
test('move constructors preserve categories and sentinel power, ignore nested attributes and fail unsupported shapes',()=>{
  const e={...enums,MoveId:new Map([['NONE',0],['TEST',1],['STATUS',2]])};
  const source='function initMoves(){ allMoves.push(new AttackMove(MoveId.TEST,PokemonType.GRASS,MoveCategory.PHYSICAL,40,100,10,-1,0,1).attr(new Attribute(MoveId.STATUS)),new SelfStatusMove(MoveId.STATUS,PokemonType.GRASS,100,10,-1,0,1)); }';
  const names={test:{name:'Test Attack'},status:{name:'Test Status'}};
  const moves=extractMoves(source,e,names);
  assert.equal(moves[0].basePower.value,40);assert.equal(moves[1].basePower.value,-1);assert.equal(moves[1].category.value,'STATUS');
  assert.equal(camel('BREAKNECK_BLITZ__PHYSICAL'),'breakneckBlitzPhysical');
  assert.throws(()=>extractMoves(source.replace('new AttackMove','new StrangeMove'),e,names),/Unsupported move constructor/);
  assert.throws(()=>extractMoves(source.replace('PHYSICAL,40','PHYSICAL,computePower()'),e,names),/Unsupported source expression/);
  assert.throws(()=>extractMoves(source,{...e,MoveId:new Map([...e.MoveId,['MISSING',3]])},names),/Incomplete/);
});
test('learnsets preserve form additions, sentinel levels and inherited egg slot order',()=>{
  const e={...enums,MoveId:new Map([['TEST',1],['SECOND',2],['THIRD',3],['FOURTH',4]])};
  const source=specimen(21).replace('starterCost:3','starterCost:3,starter:SpeciesId.TEST,levelMoves:[[RELEARN_MOVE,MoveId.TEST],[1,MoveId.SECOND]],formLevelMoves:{"": [[5,MoveId.THIRD]]}');
  const entries=speciesEntries(source),records=extractSpecies(entries,e,{test:'Test'});applyRoots(records,entries,e);
  const egg='const speciesEggMoves = {[SpeciesId.TEST]:[MoveId.FOURTH,MoveId.THIRD,MoveId.SECOND,MoveId.TEST]} as const;';
  const moves=[1,2,3,4].map(id=>({id})),constants={RELEARN_MOVE:-1};
  applyLearnsets(records,entries,e,moves,egg,constants);
  assert.deepEqual(records[0].eggMoveIds.value,[4,3,2,1]);assert.equal(records[0].eggMoveSourceId.value,1);
  assert.deepEqual(records[0].forms.value[0].levelMoves.value.map(m=>m.level),[-1,1,5]);
  assert.throws(()=>applyLearnsets(records,entries,e,moves,egg.replace('MoveId.FOURTH,',''),constants),/Invalid egg slot/);
  assert.throws(()=>applyLearnsets(records,entries,e,[{id:1}],egg,constants),/Invalid egg slot/);
  const bad=speciesEntries(source.replace('formLevelMoves:{""','formLevelMoves:{"fake"'));
  assert.throws(()=>applyLearnsets(records,bad,e,moves,egg,constants),/Unknown learnset form/);
});
test('pinned move facts include fixed/variable power, egg inheritance and form learnsets',()=>{
  const pack=JSON.parse(readFileSync(new URL('../companion/src/reference/generated/dex-reference.v1.json',import.meta.url)));
  const get=key=>pack.species.find(s=>s.key===key),move=key=>pack.moves.find(m=>m.key===key);
  assert.equal(move('BITTER_BLADE').name,'Bitter Blade');assert.equal(move('BITTER_BLADE').basePower.value,90);
  assert.equal(move('DRAGON_DANCE').category.value,'STATUS');assert.equal(move('HARD_PRESS').basePower.value,-1);
  assert.equal(get('PIKACHU').eggMoveSourceId.value,get('PICHU').id);
  assert.deepEqual(get('PIKACHU').eggMoveIds,get('PICHU').eggMoveIds);
  assert.equal(get('CHARMANDER').eggMoveIds.value[3],move('BITTER_BLADE').id);
  const pika=get('PIKACHU').forms.value;
  assert.ok(pika.find(f=>f.key==='partner').levelMoves.value.some(m=>m.moveId===move('ZIPPY_ZAP').id));
  assert.equal(pika.find(f=>f.key==='').levelMoves.value.some(m=>m.moveId===move('ZIPPY_ZAP').id),false);
  assert.ok(get('VENUSAUR').forms.value[0].levelMoves.value.some(m=>m.level===0));
  assert.equal(pack.coverage.moves.status,'complete');assert.equal(pack.coverage.selection.status,'unavailable');
});
