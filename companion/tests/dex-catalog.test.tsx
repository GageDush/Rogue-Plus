import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildDemoState } from '../src/pokerogue';
import { createDexCatalog } from '../src/domain/dex-catalog';
import { defaultDexQuery, queryDexEntries } from '../src/domain/dex-query';
import { DetailPage } from '../src/features/dex/DetailPage';
const fixture = (eggMoveMask=0) => {
  const snapshot=buildDemoState().current!;
  snapshot.pokemon=[{...snapshot.pokemon[0],id:4,name:'Charmander',unlocked:true,haUnlocked:false,passiveUnlocked:true,passiveEnabled:false,eggCount:0,egg1:false,egg2:false,egg3:false,egg4:false,t1:false,t2:false,t3:false,luck:0,visual:{...snapshot.pokemon[0].visual,shinyTier:0},
    source:{caughtAttr:'128',seenAttr:'128',natureAttr:'0',abilityMask:1,passiveMask:1,eggMoveMask}}];
  return snapshot;
};
it('projects pinned species without manufacturing ownership or mutating snapshots',()=>{
  const snapshot=fixture();const before=JSON.stringify(snapshot);const entries=createDexCatalog(snapshot);
  expect(entries).toHaveLength(1084);expect(entries.find(entry=>entry.id===445)).toMatchObject({account:null,starterIds:[443],starterNames:['Gible'],selection:null});
  expect(JSON.stringify(snapshot)).toBe(before);
  expect(queryDexEntries(entries,defaultDexQuery).map(entry=>entry.id)).toEqual([4]);
  expect(queryDexEntries(createDexCatalog(null),{...defaultDexQuery,scope:'all'})).toHaveLength(1084);
  expect(queryDexEntries(createDexCatalog(null),defaultDexQuery)).toEqual([]);
});
it('related evolution names find the associated starter with a match reason',()=>{
  const result=queryDexEntries(createDexCatalog(null),{...defaultDexQuery,scope:'all',text:'Garchomp'});
  expect(result.find(entry=>entry.id===443)?.matchReason).toMatch(/Related species: Garchomp/);
  expect(result.some(entry=>entry.id===445)).toBe(true);
});
it('Collected options require unlocks; All labels possible locked and unknown choices',()=>{
  const query={...defaultDexQuery,text:'Bitter Blade'};
  expect(queryDexEntries(createDexCatalog(fixture()),query)).toEqual([]);
  expect(queryDexEntries(createDexCatalog(fixture()),{...query,scope:'all'}).find(entry=>entry.id===4)?.matchReason).toMatch(/Locked move/);
  expect(queryDexEntries(createDexCatalog(fixture(8)),query).map(entry=>entry.id)).toEqual([4]);
  const partial=fixture(8);partial.referenceVersion='different';
  expect(queryDexEntries(createDexCatalog(partial),query)).toEqual([]);
  expect(queryDexEntries(createDexCatalog(partial),{...query,scope:'all'}).find(entry=>entry.id===4)?.matchReason).toMatch(/Ownership unknown/);
});
it('type and generation groups use OR within groups and AND between groups',()=>{
  const entries=createDexCatalog(fixture());
  const query={...defaultDexQuery,types:[9,10],generations:[1,2]};
  expect(queryDexEntries(entries,query).map(entry=>entry.id)).toEqual([4]);
  expect(queryDexEntries(entries,{...query,generations:[9]})).toEqual([]);
  const partial=fixture();partial.pokemon[0].source=undefined as never;
  expect(queryDexEntries(createDexCatalog(partial),query)).toEqual([]);
  expect(queryDexEntries(entries,{...query,scope:'all'}).every(entry=>[1,2].includes(entry.generation!))).toBe(true);
});
it('reference stat sorting and imported ranges remain separate',()=>{
  const entries=createDexCatalog(fixture());
  const sorted=queryDexEntries(entries,{...defaultDexQuery,scope:'all',sort:'baseStatTotal',direction:'desc'});
  expect(sorted[0].baseStatTotal).toBeGreaterThanOrEqual(sorted[1].baseStatTotal!);
  expect(queryDexEntries(entries,{...defaultDexQuery,scope:'all',ranges:{candy:{min:0}}}).map(entry=>entry.id)).toEqual([4]);
});
it('details distinguish public stats, ownership, slots and passive enabled state',()=>{
  const entries=createDexCatalog(fixture());
  const render=(id:number)=>renderToStaticMarkup(<DetailPage entry={entries.find(entry=>entry.id===id)!} data={null} onTeam={()=>{}} onPokemon={()=>{}}/>);
  expect(render(4)).toContain('Bitter Blade');expect(render(4)).toContain('locked');expect(render(4)).toContain('Enabled: no');
  expect(render(445)).toContain('Gible');expect(render(445)).not.toContain('Account completion');expect(render(445)).toContain('Base stat total');
  const unknown=renderToStaticMarkup(<DetailPage entry={createDexCatalog(null).find(entry=>entry.id===4)!} data={null} onTeam={()=>{}} onPokemon={()=>{}}/>);
  expect(unknown).toContain('Ownership unknown');expect(unknown).not.toContain('Account completion');
});
