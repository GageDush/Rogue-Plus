import { MECHANICS } from '../reference';
import { CANONICAL_TEAM_IDS } from './teams';
import type { PokemonRecord } from './types';

interface PlanningResult {
  nextAction: string;
  nextCost: number | null;
  affordable: boolean;
  priorityScore: number;
}

function candyThreshold(baseCost: number): { passive: number; costReduction: number[] } {
  const key = String(Math.max(1, Math.min(10, Math.round(baseCost))));
  const thresholds = (MECHANICS.candyCostsByBaseStarterCost as Record<string, { passive: number; costReduction: number[] }>)[key];
  return thresholds;
}

export function derivePlanning(pokemon: Pick<PokemonRecord,
  'id' | 'baseCost' | 'candy' | 'passiveUnlocked' | 'costReductions' | 'eggCount' | 'perfectIvs' | 't3' | 'classicWins'
>): PlanningResult {
  const threshold = candyThreshold(pokemon.baseCost);
  let nextAction = 'Collection polish';
  let nextCost: number | null = null;

  if (!pokemon.passiveUnlocked) {
    nextAction = 'Unlock passive';
    nextCost = threshold.passive;
  } else if (pokemon.costReductions < 1) {
    nextAction = 'Cost Reduction 1';
    nextCost = threshold.costReduction[0];
  } else if (pokemon.costReductions < 2) {
    nextAction = 'Cost Reduction 2';
    nextCost = threshold.costReduction[1];
  } else if (pokemon.eggCount < 4) {
    nextAction = 'Finish egg moves';
  } else if (pokemon.perfectIvs < 6) {
    nextAction = 'Finish IVs';
  }

  const affordable = nextCost !== null && pokemon.candy >= nextCost;
  let priorityScore = CANONICAL_TEAM_IDS.has(pokemon.id) ? 50 : 0;
  if (!pokemon.passiveUnlocked) priorityScore += 20;
  priorityScore += (4 - pokemon.eggCount) * 12;
  priorityScore += (6 - pokemon.perfectIvs) * 6;
  priorityScore += (2 - pokemon.costReductions) * 10;
  if (!pokemon.t3) priorityScore += 4;
  if (pokemon.classicWins < 1) priorityScore += 4;
  if (affordable) priorityScore += 15;

  return { nextAction, nextCost, affordable, priorityScore };
}
