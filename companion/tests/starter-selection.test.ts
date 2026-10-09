import { expect, it } from 'vitest';
import generated from '../src/reference/generated/dex-reference.v1.json';
import { known, type DexReferencePack, type DexSpeciesReference } from '../src/reference/dex-contract';
import { getStarterSelection } from '../src/domain/starter-selection';
import type { PokemonSourceFields } from '../src/domain/types';
const pack = generated as unknown as DexReferencePack;
const species = (key: string) => pack.species.find(species => species.key === key)!;
const ownership = (patch: Partial<PokemonSourceFields> = {}): PokemonSourceFields => ({caughtAttr:'128',seenAttr:'128',natureAttr:'0',abilityMask:1,passiveMask:0,eggMoveMask:0,...patch});
const option = (key: string, move: string, source = ownership()) => getStarterSelection(species(key),pack,source).forms[0].moves.find(option => option.name === move);
it('uses only level 1–5 and unlocked egg slots; keeps later/sentinel moves out', () => {
  const result = getStarterSelection(species('CHARMANDER'),pack,ownership({eggMoveMask:8}));
  expect(result.forms[0].moves.find(move=>move.name==='Bitter Blade')?.availability).toBe('available');
  expect(result.forms[0].moves.find(move=>move.name==='Dragon Dance')?.availability).toBe('locked');
  expect(result.forms[0].moves.find(move=>move.name==='Ember')?.availability).toBe('available');
  expect(result.forms[0].moves.some(move=>move.name==='Flamethrower')).toBe(false);
  const forms = species('BULBASAUR').forms;
  if (forms.status !== 'known') throw Error('Missing fixture forms');
  const synthetic: DexSpeciesReference = {...species('BULBASAUR'),forms:known([{...forms.value[0],
    levelMoves:known([-1,0,1,5,6].map((level,index)=>({level,moveId:pack.moves[index].id})))}])};
  const available = getStarterSelection(synthetic,pack,ownership()).forms[0].moves.filter(move=>move.source==='level');
  expect(available.map(move=>move.id)).toEqual([pack.moves[2].id,pack.moves[3].id]);
});
it('Pikachu does not acquire Pichu egg options; evolved species are not independent starters', () => {
  expect(species('PIKACHU').eggMoveSourceId).toEqual(known(species('PICHU').id));
  expect(getStarterSelection(species('PIKACHU'),pack,ownership({eggMoveMask:15})).forms.every(form=>form.moves.every(move=>move.source!=='egg'))).toBe(true);
  const garchomp = getStarterSelection(species('GARCHOMP'),pack,ownership());
  expect(garchomp.isStarter).toBe(false);expect(garchomp.forms).toEqual([]);
});
it('caught bits and public form eligibility remain distinct; default form aliases work', () => {
  const charizard={...species('CHARIZARD'),originalStarterCost:known(4)};
  expect(getStarterSelection(charizard,pack,ownership({caughtAttr:String(128n|256n)})).forms.find(form=>form.key==='mega-x')?.availability).toBe('ineligible');
  const pichu=species('PIKACHU');
  const missing=getStarterSelection(pichu,pack,ownership());
  const partner=missing.forms.find(form=>form.key==='partner')!;
  expect(partner.availability).toBe('locked');
  const caught=getStarterSelection(pichu,pack,ownership({caughtAttr:String(128n|(128n<<BigInt(partner.index)))}));
  expect(caught.forms.find(form=>form.key==='partner')?.availability).toBe('available');
});
it('single-ability second-slot legacy unlock aliases first and deduplicates names', () => {
  const options=getStarterSelection(species('BULBASAUR'),pack,ownership({abilityMask:2})).forms[0].abilities;
  expect(options.find(ability=>ability.name==='Overgrow')?.availability).toBe('available');
  expect(options.filter(ability=>ability.name==='Overgrow')).toHaveLength(1);
  expect(options.find(ability=>ability.name==='Chlorophyll')?.availability).toBe('locked');
  expect(getStarterSelection(species('BULBASAUR'),pack,ownership({abilityMask:4})).forms[0].abilities.find(ability=>ability.name==='Chlorophyll')?.availability).toBe('available');
});
it('unlocked disabled passive remains available; enabled and unlock states are separate', () => {
  const passive=getStarterSelection(species('BULBASAUR'),pack,ownership({passiveMask:1})).forms[0].passive;
  expect(passive).toMatchObject({name:'Grassy Surge',availability:'available',enabled:false});
  expect(getStarterSelection(species('BULBASAUR'),pack,ownership({passiveMask:3})).forms[0].passive?.enabled).toBe(true);
});
it('partial, invalid and incompatible ownership stays unknown rather than locked', () => {
  expect(option('CHARMANDER','Bitter Blade',{...ownership(),eggMoveMask:undefined as never})?.availability).toBe('unknown');
  expect(option('CHARMANDER','Bitter Blade',ownership({eggMoveMask:99}))?.availability).toBe('unknown');
  expect(getStarterSelection(species('BULBASAUR'),pack,{abilityMask:1}).forms[0].availability).toBe('unknown');
  expect(getStarterSelection(species('BULBASAUR'),pack,ownership(),false).forms[0].abilities.every(option=>option.availability==='unknown')).toBe(true);
});
it('selection is read-only and reports standard-game/challenge limits', () => {
  const source=Object.freeze(ownership({eggMoveMask:15}));const before=JSON.stringify(species('CHARMANDER'));
  const result=getStarterSelection(species('CHARMANDER'),pack,source);
  expect(JSON.stringify(species('CHARMANDER'))).toBe(before);expect(source.eggMoveMask).toBe(15);
  expect(result.boundary).toContain('challenges');
});
