import { describe, expect, it } from 'vitest';
import { buildDemoState } from '../src/pokerogue';
import { getCandyActions } from '../src/domain/candy-actions';
import { createPokeRogueData } from '../src/domain/facade';
import { shinyLabel } from '../src/ui/view-models';
import type { PokemonRecord } from '../src/domain/types';

const starter = (patch: Partial<PokemonRecord> = {}): PokemonRecord => ({
  ...buildDemoState().current!.pokemon[0], id: 1, baseCost: 3, candy: 100,
  passiveUnlocked: true, costReductions: 2, eggCount: 4, perfectIvs: 6,
  natureCount: 25, haUnlocked: true, t3: true, hatched: 0, ...patch,
});

describe('Candy actions use budgets, not promised random rewards', () => {
  it('puts affordable passives before reductions and eggs without double spending', () => {
    const actions = getCandyActions([starter({ id: 3, eggCount: 0 }), starter({ id: 2, costReductions: 0 }), starter({ id: 1, passiveUnlocked: false, costReductions: 0 })]);
    expect(actions.map(a => a.kind)).toEqual(['passive', 'reduction', 'eggs']);
    expect(actions.map(a => a.cost)).toEqual([35, 20, 25]);
    expect(new Set(actions.map(a => a.pokemon.id)).size).toBe(3);
  });
  it('offers an affordable reduction when passive is out of budget, or affordable eggs when both upgrades are out of budget', () => {
    expect(getCandyActions([starter({ passiveUnlocked: false, costReductions: 0, candy: 20 })])[0].kind).toBe('reduction');
    expect(getCandyActions([starter({ passiveUnlocked: false, eggCount: 3, candy: 25 })])[0].kind).toBe('eggs');
  });
  it('excludes unaffordable, locked, fully egg-maxed and unsupported-cost species', () => {
    expect(getCandyActions([starter(), starter({ candy: 0, eggCount: 0 }), starter({ unlocked: false, eggCount: 0 }), starter({ baseCost: 11, eggCount: 0 })])).toEqual([]);
    expect(getCandyActions([starter({ t3: false })])[0].kind).toBe('eggs');
  });
  it.each([[0,25],[19,25],[20,22],[39,22],[40,18],[79,18],[80,12],[200,12]])('uses hatch count %i at the pinned boundary price %i', (hatched, cost) => {
    const [a] = getCandyActions([starter({ eggCount: 3, hatched, candy: 100 })]);
    expect(a.cost).toBe(cost);
    expect(a.eggBudget).toBe(Math.floor(100 / cost));
  });
  it('uses every pinned base-cost row, not reduced starter point cost', () => {
    const expected = [15,15,12,10,9,7,6,5,5,5];
    expected.forEach((cost, index) => expect(getCandyActions([starter({ baseCost: index + 1, currentCost: 0.25, eggCount: 0, hatched: 100 })])[0].cost).toBe(cost));
  });
  it('sorts eggs by budget or least progress with stable ties and leaves inputs unchanged', () => {
    const input = [starter({ id: 2, eggCount: 3, candy: 100 }), starter({ id: 1, eggCount: 0, candy: 25 })];
    const before = JSON.stringify(input);
    expect(getCandyActions(input).map(a => a.pokemon.id)).toEqual([2,1]);
    expect(getCandyActions(input, 'least-progress').map(a => a.pokemon.id)).toEqual([1,2]);
    expect(JSON.stringify(input)).toBe(before);
  });
  it('does not change Goals scores, storage or the snapshot', () => {
    const snapshot = buildDemoState().current!;
    const data = createPokeRogueData(snapshot);
    const before = JSON.stringify(snapshot);
    getCandyActions(data.pokemon);
    expect(JSON.stringify(snapshot)).toBe(before);
    expect(shinyLabel('Shiny T3 · T1')).toBe('Red shiny · Yellow shiny');
  });
});
