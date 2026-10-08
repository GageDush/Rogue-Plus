import { CANONICAL_TEAM_IDS } from './domain/teams';
import { getCurrentStarterCost } from './domain/pokemon';
import type { AccountMetrics, AppState, ChangeRecord, PokemonRecord, Snapshot } from './domain/types';
import { importSaveText, runImportSelfTest } from './import/import-save';
import { REFERENCE_VERSION } from './reference';
import { runStorageSchemaSelfTest } from './store';
import { runStaticArchitectureAudit } from './domain/audit';

export type { AccountMetrics, AppState, ChangeRecord, PokemonRecord, Snapshot } from './domain/types';

export function decryptAndNormalize(text: string, sourceFile: string, state: AppState): AppState {
  return importSaveText(text, sourceFile, state);
}

export function getLatestImportChanges(state: AppState) {
  return state.current?.latestChanges || [];
}

export function runDecryptSelfTest() {
  return runImportSelfTest() && runStorageSchemaSelfTest() && runStaticArchitectureAudit().ok;
}

export function buildDemoState(): AppState {
  const now = new Date().toISOString();
  const demoPokemon: PokemonRecord[] = [
    demoPokemonRow(898, 'Calyrex', 8, { luck: 3, t1: true, t2: true, t3: true, passiveUnlocked: true, eggCount: 4, perfectIvs: 5, ivSpe: 29, costReductions: 2, classicWins: 2 }),
    demoPokemonRow(19, 'Rattata', 1, { luck: 3, t1: true, t2: true, t3: true, passiveUnlocked: true, eggCount: 4, perfectIvs: 6, costReductions: 2, classicWins: 2 }),
    demoPokemonRow(300, 'Skitty', 1, { luck: 3, t1: true, t2: true, t3: true, passiveUnlocked: true, eggCount: 4, perfectIvs: 6, costReductions: 2 }),
    demoPokemonRow(290, 'Nincada', 4, { candy: 45, luck: 1, t1: true, passiveUnlocked: false, eggCount: 4, perfectIvs: 6, costReductions: 1 }),
    demoPokemonRow(932, 'Nacli', 4, { luck: 3, t1: true, t2: true, t3: true, passiveUnlocked: true, eggCount: 4, perfectIvs: 6, costReductions: 2, classicWins: 2 }),
    demoPokemonRow(425, 'Drifloon', 2, { passiveUnlocked: true, eggCount: 4, perfectIvs: 6, costReductions: 2, classicWins: 2 }),
    demoPokemonRow(190, 'Aipom', 2, { luck: 1, t1: true, passiveUnlocked: true, eggCount: 4, perfectIvs: 5, costReductions: 2, classicWins: 2 }),
    demoPokemonRow(664, 'Scatterbug', 2, { luck: 1, t1: true, passiveUnlocked: true, eggCount: 3, perfectIvs: 6, costReductions: 2 }),
  ];

  const account: AccountMetrics = {
    startersUnlocked: 8,
    startersTotal: 8,
    passivesUnlocked: 7,
    passivesTotal: 8,
    eggMovesUnlocked: 31,
    eggMovesTotal: 32,
    perfectIvStarters: 5,
    shinyStarters: 7,
    t2Shiny: 4,
    t3Shiny: 4,
    allShinyTiers: 4,
    fullCostReductions: 7,
    noCostReductions: 0,
    classicWinners: 5,
    natureUnlocks: 170,
    allNatures: 1,
    achievements: 6,
    achievementsTotal: 76,
    voucherUnlocks: 9,
    vouchers: { regular: 12, plus: 3, premium: 1, golden: 0 },
    stats: { battles: 125, trainersDefeated: 15, pokemonHatched: 24, shinyPokemonHatched: 2, highestEndlessWave: 53, highestLevel: 74, sessionsWon: 2 },
  };

  const changes: ChangeRecord[] = [
    { timestamp: now, importId: 'DEMO', pokemon: 'Aipom', pokemonId: 190, category: 'Shiny T3', before: 'T1', after: 'T3', importance: 'Major', teamImpact: 'Skill Link Farm', sourceFile: 'sample.prsv' },
    { timestamp: now, importId: 'DEMO', pokemon: 'Scatterbug', pokemonId: 664, category: 'Egg Move 4', before: 'Locked', after: 'Unlocked', importance: 'Complete', teamImpact: 'Skill Link Farm', sourceFile: 'sample.prsv' },
  ];

  const snapshot: Snapshot = {
    schemaVersion: 2,
    referenceVersion: REFERENCE_VERSION,
    id: 'DEMO',
    importId: 'DEMO',
    sourceFile: 'sample.prsv',
    saveTimestamp: now,
    gameVersion: 'Sample',
    pokemon: demoPokemon,
    account,
    latestChanges: changes,
    demo: true,
  };
  return { current: snapshot, snapshots: [snapshot], history: changes };
}

function demoPokemonRow(id: number, name: string, baseCost: number, partial: Partial<PokemonRecord>): PokemonRecord {
  const luck = partial.luck || 0;
  const p: PokemonRecord = {
    id,
    name,
    baseCost,
    currentCost: getCurrentStarterCost(baseCost, partial.costReductions || 0),
    unlocked: true,
    candy: 25,
    friendship: 0,
    luck,
    shiny: luck > 0,
    t1: false,
    t2: false,
    t3: false,
    passiveUnlocked: false,
    passiveEnabled: true,
    a1Unlocked: true,
    a2Unlocked: true,
    haUnlocked: true,
    egg1: true,
    egg2: true,
    egg3: true,
    egg4: true,
    eggCount: 4,
    ivHp: 31,
    ivAtk: 31,
    ivDef: 31,
    ivSpa: 31,
    ivSpd: 31,
    ivSpe: 31,
    perfectIvs: 6,
    natureCount: 22,
    costReductions: 2,
    classicWins: 0,
    seen: 5,
    caught: 2,
    hatched: 20,
    nextAction: 'Collection polish',
    nextCost: null,
    affordable: false,
    priorityScore: CANONICAL_TEAM_IDS.has(id) ? 54 : 4,
    progressGaps: 'None',
    collectionGaps: '3 natures; Classic win',
    source: { seenAttr: '0', caughtAttr: '0', natureAttr: '0', eggMoveMask: 15, abilityMask: 7, passiveMask: 3 },
    visual: { shinyTier: luck >= 3 ? 3 : luck >= 2 ? 2 : luck >= 1 ? 1 : 0, shinyCaught: luck > 0, maleCaught: true, femaleCaught: false, defaultVariantCaught: luck > 0, variant2Caught: luck >= 2, variant3Caught: luck >= 3, defaultFormCaught: true },
    ...partial,
  };
  p.shiny = p.t1 || p.t2 || p.t3 || p.luck > 0;
  p.visual = {
    ...p.visual,
    shinyTier: p.t3 ? 3 : p.t2 ? 2 : p.t1 ? 1 : 0,
    shinyCaught: p.shiny,
    defaultVariantCaught: p.t1,
    variant2Caught: p.t2,
    variant3Caught: p.t3,
  };
  const gaps: string[] = [];
  if (!p.passiveUnlocked) gaps.push('Passive');
  if (p.eggCount < 4) gaps.push(String(4 - p.eggCount) + ' egg move');
  if (p.perfectIvs < 6) gaps.push(String(6 - p.perfectIvs) + ' IV stat');
  if (p.costReductions < 2) gaps.push(String(2 - p.costReductions) + ' cost reduction');
  p.progressGaps = gaps.length ? gaps.join('; ') : 'None';
  p.nextAction = !p.passiveUnlocked
    ? 'Unlock passive'
    : p.costReductions < 2
      ? 'Finish cost reductions'
      : p.eggCount < 4
        ? 'Finish egg moves'
        : p.perfectIvs < 6
          ? 'Finish IVs'
          : 'Collection polish';
  return p;
}

