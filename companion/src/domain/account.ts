import { MECHANICS } from '../reference';
import { toSmallInt } from './bitfield';
import type { RawSave } from '../import/raw-save-schema';
import type { AccountMetrics, PokemonRecord } from './types';

function numericStats(raw: Record<string, unknown>): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) stats[key] = numberValue;
  }
  return stats;
}

export function getAccountMetrics(pokemon: PokemonRecord[], raw: RawSave): AccountMetrics {
  return {
    startersUnlocked: pokemon.filter(entry => entry.unlocked).length,
    startersTotal: pokemon.length,
    passivesUnlocked: pokemon.filter(entry => entry.passiveUnlocked).length,
    passivesTotal: pokemon.length,
    eggMovesUnlocked: pokemon.reduce((sum, entry) => sum + entry.eggCount, 0),
    eggMovesTotal: pokemon.length * 4,
    perfectIvStarters: pokemon.filter(entry => entry.perfectIvs === 6).length,
    shinyStarters: pokemon.filter(entry => entry.shiny).length,
    t2Shiny: pokemon.filter(entry => entry.t2).length,
    t3Shiny: pokemon.filter(entry => entry.t3).length,
    allShinyTiers: pokemon.filter(entry => entry.t1 && entry.t2 && entry.t3).length,
    fullCostReductions: pokemon.filter(entry => entry.costReductions >= 2).length,
    noCostReductions: pokemon.filter(entry => entry.costReductions === 0).length,
    classicWinners: pokemon.filter(entry => entry.classicWins > 0).length,
    natureUnlocks: pokemon.reduce((sum, entry) => sum + entry.natureCount, 0),
    allNatures: pokemon.filter(entry => entry.natureCount === 25).length,
    achievements: Object.keys(raw.achvUnlocks).length,
    achievementsTotal: MECHANICS.accountTotals.achievements,
    voucherUnlocks: Object.keys(raw.voucherUnlocks).length,
    vouchers: {
      regular: toSmallInt(raw.voucherCounts['0']),
      plus: toSmallInt(raw.voucherCounts['1']),
      premium: toSmallInt(raw.voucherCounts['2']),
      golden: toSmallInt(raw.voucherCounts['3']),
    },
    stats: numericStats(raw.gameStats),
  };
}
