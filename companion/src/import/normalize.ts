import { REFERENCE_VERSION, STARTER_ROOTS } from '../reference';
import { getAccountMetrics } from '../domain/account';
import { countBits, hasBit, toIntegerString, toSmallInt } from '../domain/bitfield';
import { decodeVisualIdentity, describeCollectionGaps, describeProgressGaps, getCurrentStarterCost, isStarterUnlocked } from '../domain/pokemon';
import { derivePlanning } from '../domain/priorities';
import type { PokemonRecord, Snapshot } from '../domain/types';
import type { RawSave } from './raw-save-schema';

function pick(entry: Record<string, unknown> | undefined, shortKey: string, longKey: string, fallback: unknown): unknown {
  if (!entry) return fallback;
  if (entry[shortKey] !== undefined) return entry[shortKey];
  if (entry[longKey] !== undefined) return entry[longKey];
  return fallback;
}

function normalizeIvs(value: unknown): [number, number, number, number, number, number] {
  const source = Array.isArray(value) ? value : [];
  const result = source.slice(0, 6).map(item => {
    const iv = toSmallInt(item, 0);
    return Math.max(0, Math.min(31, iv));
  });
  while (result.length < 6) result.push(0);
  return result as [number, number, number, number, number, number];
}

export function normalizeRawSave(raw: RawSave, sourceFile: string): Snapshot {
  const warnings: string[] = [];

  const pokemon: PokemonRecord[] = STARTER_ROOTS.map(reference => {
    const starter = raw.starterData[String(reference.id)];
    const dex = raw.dexData[String(reference.id)];

    const seenAttr = toIntegerString(pick(dex, '$sa', 'seenAttr', 0), reference.name + ' seenAttr');
    const caughtAttr = toIntegerString(pick(dex, '$ca', 'caughtAttr', 0), reference.name + ' caughtAttr');
    const natureAttr = toIntegerString(pick(dex, '$na', 'natureAttr', 0), reference.name + ' natureAttr');
    const eggMoveMask = toSmallInt(pick(starter, '$em', 'eggMoves', 0));
    const abilityMask = toSmallInt(pick(starter, '$a', 'abilityAttr', 0));
    const passiveMask = toSmallInt(pick(starter, '$pa', 'passiveAttr', 0));
    const costReductions = Math.max(0, Math.min(2, toSmallInt(pick(starter, '$vr', 'valueReduction', 0))));
    const candy = Math.max(0, toSmallInt(pick(starter, '$x', 'candyCount', 0)));
    const friendship = Math.max(0, toSmallInt(pick(starter, '$f', 'friendship', 0)));
    const classicWins = Math.max(0, toSmallInt(pick(starter, '$wc', 'classicWinCount', 0)));
    const ivs = normalizeIvs(pick(dex, '$i', 'ivs', [0, 0, 0, 0, 0, 0]));
    const visual = decodeVisualIdentity(caughtAttr);
    const eggs = [1, 2, 4, 8].map(flag => hasBit(eggMoveMask, flag));
    const eggCount = eggs.filter(Boolean).length;
    const perfectIvs = ivs.filter(iv => iv === 31).length;
    const natureCount = countBits(natureAttr);
    const baseRecord: PokemonRecord = {
      id: reference.id,
      name: reference.name,
      baseCost: reference.starterCost,
      currentCost: getCurrentStarterCost(reference.starterCost, costReductions),
      unlocked: isStarterUnlocked(caughtAttr),
      candy,
      friendship,
      luck: visual.shinyTier,
      shiny: visual.shinyCaught,
      t1: visual.shinyCaught && visual.defaultVariantCaught,
      t2: visual.shinyCaught && visual.variant2Caught,
      t3: visual.shinyCaught && visual.variant3Caught,
      passiveUnlocked: hasBit(passiveMask, 1),
      passiveEnabled: hasBit(passiveMask, 2),
      a1Unlocked: hasBit(abilityMask, 1),
      a2Unlocked: hasBit(abilityMask, 2),
      haUnlocked: hasBit(abilityMask, 4),
      egg1: eggs[0],
      egg2: eggs[1],
      egg3: eggs[2],
      egg4: eggs[3],
      eggCount,
      ivHp: ivs[0],
      ivAtk: ivs[1],
      ivDef: ivs[2],
      ivSpa: ivs[3],
      ivSpd: ivs[4],
      ivSpe: ivs[5],
      perfectIvs,
      natureCount,
      costReductions,
      classicWins,
      seen: Math.max(0, toSmallInt(pick(dex, '$s', 'seenCount', 0))),
      caught: Math.max(0, toSmallInt(pick(dex, '$c', 'caughtCount', 0))),
      hatched: Math.max(0, toSmallInt(pick(dex, '$hc', 'hatchedCount', 0))),
      nextAction: '',
      nextCost: null,
      affordable: false,
      priorityScore: 0,
      progressGaps: '',
      collectionGaps: '',
      source: { seenAttr, caughtAttr, natureAttr, eggMoveMask, abilityMask, passiveMask },
      visual,
    };

    const planning = derivePlanning(baseRecord);
    baseRecord.nextAction = planning.nextAction;
    baseRecord.nextCost = planning.nextCost;
    baseRecord.affordable = planning.affordable;
    baseRecord.priorityScore = planning.priorityScore;
    baseRecord.progressGaps = describeProgressGaps(baseRecord);
    baseRecord.collectionGaps = describeCollectionGaps(baseRecord);
    return baseRecord;
  });

  if (pokemon.length !== 572) {
    warnings.push('Reference starter-root count was ' + String(pokemon.length) + ' instead of 572.');
  }

  const account = getAccountMetrics(pokemon, raw);
  const saveTimestamp = new Date(raw.timestamp).toISOString();
  const importId = saveTimestamp.replace(/\D/g, '').slice(0, 14);

  return {
    schemaVersion: 2,
    referenceVersion: REFERENCE_VERSION,
    id: importId,
    importId,
    sourceFile,
    saveTimestamp,
    gameVersion: raw.gameVersion,
    pokemon,
    account,
    latestChanges: [],
    importWarnings: warnings,
  };
}
