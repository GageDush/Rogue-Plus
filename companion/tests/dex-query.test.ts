import { describe, expect, it } from 'vitest';
import { buildDemoState } from '../src/pokerogue';
import { defaultDexQuery, queryDex } from '../src/domain/dex-query';
import type { PokemonRecord } from '../src/domain/types';
const starter = (patch: Partial<PokemonRecord>): PokemonRecord => ({ ...buildDemoState().current!.pokemon[0], unlocked: true, ...patch });
describe('Dex imported-field query', () => {
  it('defaults to collected, with explicit all scope and stable number order', () => {
    const rows = [starter({ id: 3 }), starter({ id: 2, unlocked: false }), starter({ id: 1 })];
    expect(queryDex(rows, defaultDexQuery).map(p => p.id)).toEqual([1, 3]);
    expect(queryDex(rows, { ...defaultDexQuery, scope: 'all' }).map(p => p.id)).toEqual([1, 2, 3]);
  });
  it('combines search, conditions and inclusive bounds without mutating facts', () => {
    const rows = [starter({ id: 1, name: 'Bulbasaur', t3: true, haUnlocked: true, candy: 10 }), starter({ id: 2, name: 'Bulbasaur', t3: false, haUnlocked: true, candy: 10 }), starter({ id: 3, name: 'Bulbasaur', t3: true, haUnlocked: true, candy: 11 })];
    const before = JSON.stringify(rows);
    expect(queryDex(rows, { ...defaultDexQuery, text: 'BULBA', conditions: ['red', 'hidden'], ranges: { candy: { min: 10, max: 10 } } }).map(p => p.id)).toEqual([1]);
    expect(JSON.stringify(rows)).toBe(before);
  });
  it('does not treat missing numbers or ownership as zero or false', () => {
    const rows = [starter({ id: 1, candy: undefined as unknown as number, classicWins: undefined as unknown as number, passiveUnlocked: undefined as unknown as boolean }), starter({ id: 2, candy: 0, classicWins: 0, passiveUnlocked: false })];
    expect(queryDex(rows, { ...defaultDexQuery, ranges: { candy: { min: 0 } } }).map(p => p.id)).toEqual([2]);
    expect(queryDex(rows, { ...defaultDexQuery, conditions: ['classic', 'passive'] }).map(p => p.id)).toEqual([2]);
    for (const direction of ['asc', 'desc'] as const) expect(queryDex(rows, { ...defaultDexQuery, sort: 'candy', direction }).map(p => p.id)).toEqual([2, 1]);
  });
  it('sorts names and numbers with deterministic ties and supports gap search', () => {
    const rows = [starter({ id: 3, name: 'Zubat', candy: 20 }), starter({ id: 2, name: 'Abra', candy: 20 }), starter({ id: 1, name: 'Abra', candy: 10, progressGaps: 'Missing passive' })];
    expect(queryDex(rows, { ...defaultDexQuery, sort: 'name', direction: 'desc' }).map(p => p.id)).toEqual([3, 1, 2]);
    expect(queryDex(rows, { ...defaultDexQuery, sort: 'candy', direction: 'desc' }).map(p => p.id)).toEqual([2, 3, 1]);
    expect(queryDex(rows, { ...defaultDexQuery, text: 'missing passive' }).map(p => p.id)).toContain(1);
    expect(queryDex([], defaultDexQuery)).toEqual([]);
  });
});
