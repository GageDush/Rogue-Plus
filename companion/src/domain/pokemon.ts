import { countBits, hasBit, toBigInt } from './bitfield';
import type { PokemonRecord, PokemonVisualIdentity } from './types';

const DEX_SHINY = 2;
const DEX_MALE = 4;
const DEX_FEMALE = 8;
const DEX_VARIANT_1 = 16;
const DEX_VARIANT_2 = 32;
const DEX_VARIANT_3 = 64;
const DEX_DEFAULT_FORM = 128;

export function isStarterUnlocked(caughtAttr: unknown): boolean {
  return toBigInt(caughtAttr, 'caughtAttr') !== 0n;
}

export function decodeVisualIdentity(caughtAttr: unknown): PokemonVisualIdentity {
  const shinyCaught = hasBit(caughtAttr, DEX_SHINY);
  const t1 = shinyCaught && hasBit(caughtAttr, DEX_VARIANT_1);
  const t2 = shinyCaught && hasBit(caughtAttr, DEX_VARIANT_2);
  const t3 = shinyCaught && hasBit(caughtAttr, DEX_VARIANT_3);
  return {
    shinyTier: t3 ? 3 : t2 ? 2 : t1 ? 1 : 0,
    shinyCaught,
    maleCaught: hasBit(caughtAttr, DEX_MALE),
    femaleCaught: hasBit(caughtAttr, DEX_FEMALE),
    defaultVariantCaught: hasBit(caughtAttr, DEX_VARIANT_1),
    variant2Caught: hasBit(caughtAttr, DEX_VARIANT_2),
    variant3Caught: hasBit(caughtAttr, DEX_VARIANT_3),
    defaultFormCaught: hasBit(caughtAttr, DEX_DEFAULT_FORM),
  };
}

export function getNatureCount(natureAttr: unknown): number {
  return countBits(natureAttr);
}

export function getCurrentStarterCost(baseCost: number, reductions: number): number {
  let value = baseCost;
  for (let i = 0; i < reductions; i += 1) {
    value = value > 1 ? value - 1 : value / 2;
  }
  return value;
}

export function describeProgressGaps(pokemon: Pick<PokemonRecord, 'passiveUnlocked' | 'eggCount' | 'perfectIvs' | 'costReductions'>): string {
  const gaps: string[] = [];
  if (!pokemon.passiveUnlocked) gaps.push('Passive');
  if (pokemon.eggCount < 4) {
    const remaining = 4 - pokemon.eggCount;
    gaps.push(String(remaining) + ' egg move' + (remaining === 1 ? '' : 's'));
  }
  if (pokemon.perfectIvs < 6) {
    const remaining = 6 - pokemon.perfectIvs;
    gaps.push(String(remaining) + ' IV stat' + (remaining === 1 ? '' : 's'));
  }
  if (pokemon.costReductions < 2) {
    const remaining = 2 - pokemon.costReductions;
    gaps.push(String(remaining) + ' cost reduction' + (remaining === 1 ? '' : 's'));
  }
  return gaps.length ? gaps.join('; ') : 'None';
}

export function describeCollectionGaps(pokemon: Pick<PokemonRecord, 'natureCount' | 't1' | 't2' | 't3' | 'classicWins'>): string {
  const gaps: string[] = [];
  if (pokemon.natureCount < 25) gaps.push(String(25 - pokemon.natureCount) + ' natures');
  if (!pokemon.t1) gaps.push('T1 shiny');
  if (!pokemon.t2) gaps.push('T2 shiny');
  if (!pokemon.t3) gaps.push('T3 shiny');
  if (pokemon.classicWins < 1) gaps.push('Classic win');
  return gaps.length ? gaps.join('; ') : 'None';
}
