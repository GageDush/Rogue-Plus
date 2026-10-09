import type { PokemonRecord } from './types';
import { CANONICAL_TEAM_IDS } from './teams';

export const dexFilters = {
  gaps: 'Missing core progress', red: 'Red shiny owned', passive: 'Passive not unlocked',
  team: 'Bundled team starters', iv: 'Missing perfect IVs', hidden: 'Hidden ability unlocked',
  classic: 'No Classic wins',
} as const;
export type DexCondition = keyof typeof dexFilters;
export const dexRanges = { currentCost: 'Current starter cost', candy: 'Candy balance', perfectIvs: 'Perfect IV slots', eggCount: 'Unlocked egg slots' } as const;
export type DexRangeField = keyof typeof dexRanges;
export const dexSorts = { id: 'Dex number', name: 'Name', currentCost: 'Current cost', luck: 'Luck', candy: 'Candy', perfectIvs: 'Perfect IVs', eggCount: 'Egg slots' } as const;
export type DexSort = keyof typeof dexSorts;
export interface DexQuery {
  text: string;
  scope: 'collected' | 'all';
  conditions: DexCondition[];
  ranges: Partial<Record<DexRangeField, { min?: number; max?: number }>>;
  sort: DexSort;
  direction: 'asc' | 'desc';
}
export const defaultDexQuery: DexQuery = { text: '', scope: 'collected', conditions: [], ranges: {}, sort: 'id', direction: 'asc' };

// Missing values never satisfy a numeric condition or become zero; unknown sorts last.
export function queryDex(pokemon: readonly PokemonRecord[], query: DexQuery): PokemonRecord[] {
  const text = query.text.trim().toLocaleLowerCase();
  const matches: Record<DexCondition, (p: PokemonRecord) => boolean> = {
    gaps: p => typeof p.progressGaps === 'string' && Boolean(p.progressGaps.trim()) && p.progressGaps !== 'None',
    red: p => p.t3 === true, passive: p => p.passiveUnlocked === false,
    team: p => CANONICAL_TEAM_IDS.has(p.id), iv: p => Number.isFinite(p.perfectIvs) && p.perfectIvs < 6,
    hidden: p => p.haUnlocked === true, classic: p => Number.isFinite(p.classicWins) && p.classicWins === 0,
  };
  return pokemon.filter(p => {
    if (query.scope === 'collected' && p.unlocked !== true) return false;
    if (text && ![p.name, p.progressGaps, p.collectionGaps].some(value => value?.toLocaleLowerCase().includes(text))) return false;
    if (!query.conditions.every(condition => matches[condition](p))) return false;
    return (Object.entries(query.ranges) as [DexRangeField, { min?: number; max?: number }][]).every(([field, range]) =>
      Number.isFinite(p[field]) && (range.min === undefined || p[field] >= range.min) && (range.max === undefined || p[field] <= range.max));
  }).sort((a, b) => {
    const left = a[query.sort], right = b[query.sort];
    const knownLeft = typeof left === 'string' ? Boolean(left) : Number.isFinite(left);
    const knownRight = typeof right === 'string' ? Boolean(right) : Number.isFinite(right);
    if (knownLeft !== knownRight) return knownLeft ? -1 : 1;
    const comparison = !knownLeft ? 0 : typeof left === 'string' && typeof right === 'string' ? left.localeCompare(right) : Number(left) - Number(right);
    return comparison * (query.direction === 'asc' ? 1 : -1) || a.id - b.id;
  });
}
