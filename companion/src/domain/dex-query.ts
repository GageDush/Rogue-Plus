import type { PokemonRecord } from './types';
import { CANONICAL_TEAM_IDS } from './teams';
import type { DexEntry } from './dex-catalog';
import { DEX_REFERENCE } from '../reference';

export const dexFilters = {
  gaps: 'Missing core progress', red: 'Red shiny owned', passive: 'Passive not unlocked',
  team: 'Bundled team starters', iv: 'Missing perfect IVs', hidden: 'Hidden ability unlocked',
  classic: 'No Classic wins',
} as const;
export type DexCondition = keyof typeof dexFilters;
export const dexRanges = { currentCost: 'Current starter cost', candy: 'Candy balance', perfectIvs: 'Perfect IV slots', eggCount: 'Unlocked egg slots' } as const;
export type DexRangeField = keyof typeof dexRanges;
export const dexSorts = { id: 'Dex number', name: 'Name', currentCost: 'Current cost', luck: 'Luck', candy: 'Candy', perfectIvs: 'Perfect IVs', eggCount: 'Egg slots', generation:'Generation', baseStatTotal:'Base stat total', speed:'Base Speed' } as const;
export const dexTypes = [...DEX_REFERENCE.types.values()].filter(type=>type.id>=0 && type.id<18);
export const dexGenerations = [1,2,3,4,5,6,7,8,9];
export type DexSort = keyof typeof dexSorts;
export interface DexQuery {
  text: string;
  scope: 'collected' | 'all';
  conditions: DexCondition[];
  ranges: Partial<Record<DexRangeField, { min?: number; max?: number }>>;
  sort: DexSort;
  direction: 'asc' | 'desc';
  types?: number[];
  generations?: number[];
}
export const defaultDexQuery: DexQuery = { text: '', scope: 'collected', conditions: [], ranges: {}, sort: 'id', direction: 'asc' };

// Missing values never satisfy a numeric condition or become zero; unknown sorts last.
export function queryDex(pokemon: readonly PokemonRecord[], query: DexQuery): PokemonRecord[] {
  const text = query.text.trim().toLocaleLowerCase();
  return pokemon.filter(p => {
    if (query.scope === 'collected' && p.unlocked !== true) return false;
    if (text && ![p.name, p.progressGaps, p.collectionGaps].some(value => value?.toLocaleLowerCase().includes(text))) return false;
    return matchesImportedConditions(p,query);
  }).sort((a,b)=>compareValues(a.id,b.id,accountSort(a,query.sort),accountSort(b,query.sort),query.direction));
}
function matchesImportedConditions(p: PokemonRecord | null, query: DexQuery): boolean {
  if (!p) return query.conditions.length===0 && Object.keys(query.ranges).length===0;
  const matches: Record<DexCondition, (p: PokemonRecord) => boolean> = {
    gaps: p => typeof p.progressGaps === 'string' && Boolean(p.progressGaps.trim()) && p.progressGaps !== 'None',
    red: p => p.t3 === true, passive: p => p.passiveUnlocked === false,
    team: p => CANONICAL_TEAM_IDS.has(p.id), iv: p => Number.isFinite(p.perfectIvs) && p.perfectIvs < 6,
    hidden: p => p.haUnlocked === true, classic: p => Number.isFinite(p.classicWins) && p.classicWins === 0,
  };
    if (!query.conditions.every(condition => matches[condition](p))) return false;
    return (Object.entries(query.ranges) as [DexRangeField, { min?: number; max?: number }][]).every(([field, range]) =>
      Number.isFinite(p[field]) && (range.min === undefined || p[field] >= range.min) && (range.max === undefined || p[field] <= range.max));
}
function accountSort(account: PokemonRecord | null, key: DexSort): string | number | undefined {
  return account && key in account ? account[key as keyof PokemonRecord] as string | number : undefined;
}
function compareValues(leftId:number,rightId:number,left:unknown,right:unknown,direction:DexQuery['direction']): number {
    const knownLeft = typeof left === 'string' ? Boolean(left) : Number.isFinite(left);
    const knownRight = typeof right === 'string' ? Boolean(right) : Number.isFinite(right);
    if (knownLeft !== knownRight) return knownLeft ? -1 : 1;
    const comparison = !knownLeft ? 0 : typeof left === 'string' && typeof right === 'string' ? left.localeCompare(right) : Number(left) - Number(right);
    return comparison * (direction === 'asc' ? 1 : -1) || leftId - rightId;
}
function textReason(entry:DexEntry,text:string,scope:DexQuery['scope']):string | undefined {
  const has=(name:string | undefined)=>name?.toLocaleLowerCase().includes(text);
  if ([entry.name,entry.reference?.name,entry.account?.progressGaps,entry.account?.collectionGaps].some(has)) return '';
  const related=entry.relatedNames.find(has);
  if(related)return `Related species: ${related}`;
  const type=entry.typeNames.find(has);if(type)return `Type: ${type}`;
  for(const form of entry.selection?.forms ?? []) {
    if(form.availability==='ineligible')continue;
    const candidates=[...form.moves,...form.abilities,...(form.passive?[form.passive]:[])];
    const match=candidates.find(option=>has(option.name)&&(scope==='all'||option.availability==='available'));
    if(match)return `${match.availability==='available'?'Available':match.availability==='locked'?'Locked':'Ownership unknown'} ${match.source==='ability'?'ability':match.source==='passive'?'passive':'move'}: ${match.name}`;
  }
  return undefined;
}
/** Reference and imported controls share one query; no expression grammar is silently parsed. */
export function queryDexEntries(entries: readonly DexEntry[],query:DexQuery):DexEntry[] {
  const text=query.text.trim().toLocaleLowerCase();
  const filtered: DexEntry[]=[];
  for(const entry of entries) {
    if(query.scope==='collected'&&entry.account?.unlocked!==true)continue;
    if(!matchesImportedConditions(entry.account,query))continue;
    if(query.types?.length&&(!entry.reference||entry.reference.forms.status!=='known'||!entry.reference.forms.value.some(form=>(query.scope==='all'||entry.selection?.forms.some(option=>option.index===form.index&&option.availability==='available'))&&form.types.status==='known'&&form.types.value.some(type=>query.types!.includes(type)))))continue;
    if(query.generations?.length&&(entry.generation===undefined||!query.generations.includes(entry.generation)))continue;
    const reason=text?textReason(entry,text,query.scope):'';
    if(reason===undefined)continue;
    filtered.push({...entry,matchReason:reason || undefined});
  }
  const sortValue=(entry:DexEntry)=>query.sort==='id'?entry.id:query.sort==='name'?entry.name:query.sort==='generation'?entry.generation:query.sort==='baseStatTotal'?entry.baseStatTotal:query.sort==='speed'?entry.baseStats?.speed:accountSort(entry.account,query.sort);
  return filtered.sort((a,b)=>compareValues(a.id,b.id,sortValue(a),sortValue(b),query.direction));
}
