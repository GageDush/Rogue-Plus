import { MECHANICS } from '../reference';
import type { PokemonRecord } from './types';

export type EggSort = 'most-eggs' | 'least-progress';
export interface CandyAction {
  pokemon: PokemonRecord;
  kind: 'passive' | 'reduction' | 'eggs';
  label: string;
  cost: number;
  eggBudget?: number;
}

function costsFor(pokemon: PokemonRecord) {
  if (!Number.isInteger(pokemon.baseCost)) return null;
  return MECHANICS.candyCostsByBaseStarterCost[String(pokemon.baseCost) as keyof typeof MECHANICS.candyCostsByBaseStarterCost] ?? null;
}

/** A collection heuristic, not hatch probabilities or the Goals priority score. */
export function eggCollectionProgress(p: PokemonRecord): number {
  return (p.eggCount / 4 + p.perfectIvs / 6 + p.natureCount / 25 + Number(p.haUnlocked) + Number(p.t3)) / 5;
}

/** One recommendation per species; alternatives never double-spend its candy. */
export function getCandyActions(pokemon: readonly PokemonRecord[], sort: EggSort = 'most-eggs'): CandyAction[] {
  const actions: CandyAction[] = [];
  for (const p of pokemon) {
    const costs = costsFor(p);
    if (!p.unlocked || !costs || !Number.isSafeInteger(p.candy) || p.candy < 0) continue;
    if (!p.passiveUnlocked && p.candy >= costs.passive) {
      actions.push({ pokemon: p, kind: 'passive', label: 'Unlock passive', cost: costs.passive });
      continue;
    }
    const reduction = costs.costReduction[p.costReductions];
    if (p.costReductions >= 0 && p.costReductions < 2 && reduction !== undefined && p.candy >= reduction) {
      actions.push({ pokemon: p, kind: 'reduction', label: 'Reduce starter cost', cost: reduction });
      continue;
    }
    // Eggs can improve these imported fields, but never guarantee an unlock.
    if (p.eggCount >= 4 && p.perfectIvs >= 6 && p.natureCount >= 25 && p.haUnlocked && p.t3) continue;
    if (!Number.isSafeInteger(p.hatched) || p.hatched < 0) continue;
    const discount = costs.eggCostReductionThresholds.filter(threshold => p.hatched >= threshold).length;
    const cost = costs.eggCosts[discount];
    const eggBudget = Math.floor(p.candy / cost);
    if (eggBudget > 0) actions.push({ pokemon: p, kind: 'eggs', label: 'Buy species eggs', cost, eggBudget });
  }
  const order = { passive: 0, reduction: 1, eggs: 2 };
  return actions.sort((a, b) => {
    const kind = order[a.kind] - order[b.kind];
    if (kind) return kind;
    if (a.kind === 'eggs' && b.kind === 'eggs') {
      const progress = eggCollectionProgress(a.pokemon) - eggCollectionProgress(b.pokemon);
      const budget = b.eggBudget! - a.eggBudget!;
      return (sort === 'least-progress' ? progress || budget : budget || progress) || a.pokemon.id - b.pokemon.id;
    }
    return a.cost - b.cost || a.pokemon.id - b.pokemon.id;
  });
}
