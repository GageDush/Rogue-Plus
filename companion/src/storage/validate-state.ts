// Validation only: never repair, coerce or write rejected account data.
function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(path);
  return value as Record<string, unknown>;
}
function invalid(path: string): never {
  throw new Error('Invalid Rogue+ data at ' + path + '. Existing data was not replaced.');
}
function text(value: unknown, path: string, nonempty = false): void {
  if (typeof value !== 'string' || (nonempty && !value.trim())) invalid(path);
}
function number(value: unknown, path: string, max = Number.MAX_SAFE_INTEGER, integer = true): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max || (integer && !Number.isSafeInteger(value))) invalid(path);
}
function bool(value: unknown, path: string): void { if (typeof value !== 'boolean') invalid(path); }
export function timestamp(value: unknown, path: string): void {
  text(value, path, true);
  if (!/^\d{4}-\d\d-\d\dT/.test(value as string) || !Number.isFinite(Date.parse(value as string))) invalid(path);
}
function array(value: unknown, path: string, visit: (item: unknown, path: string) => void): void {
  if (!Array.isArray(value)) invalid(path);
  value.forEach((item, i) => visit(item, path + '[' + i + ']'));
}
const pokemonBooleans = ['unlocked', 'shiny', 't1', 't2', 't3', 'passiveUnlocked', 'passiveEnabled', 'a1Unlocked', 'a2Unlocked', 'haUnlocked', 'egg1', 'egg2', 'egg3', 'egg4', 'affordable'];
const accountCounters = ['startersUnlocked', 'startersTotal', 'passivesUnlocked', 'passivesTotal', 'eggMovesUnlocked', 'eggMovesTotal', 'perfectIvStarters', 'shinyStarters', 't2Shiny', 't3Shiny', 'allShinyTiers', 'fullCostReductions', 'noCostReductions', 'classicWinners', 'natureUnlocks', 'allNatures', 'achievements', 'achievementsTotal', 'voucherUnlocks'];
function pokemon(value: unknown, path: string): void {
  const p = record(value, path);
  number(p.id, path + '.id'); if (p.id === 0) invalid(path + '.id');
  text(p.name, path + '.name', true);
  for (const key of pokemonBooleans) bool(p[key], path + '.' + key);
  for (const key of ['baseCost', 'currentCost', 'priorityScore']) number(p[key], path + '.' + key, Number.MAX_SAFE_INTEGER, false);
  for (const key of ['candy', 'friendship', 'classicWins', 'seen', 'caught', 'hatched']) number(p[key], path + '.' + key);
  for (const key of ['ivHp', 'ivAtk', 'ivDef', 'ivSpa', 'ivSpd', 'ivSpe']) number(p[key], path + '.' + key, 31);
  for (const [key, max] of Object.entries({ luck: 3, eggCount: 4, perfectIvs: 6, natureCount: 25, costReductions: 2 })) number(p[key], path + '.' + key, max);
  for (const key of ['nextAction', 'progressGaps', 'collectionGaps']) text(p[key], path + '.' + key);
  if (p.nextCost !== null) number(p.nextCost, path + '.nextCost', Number.MAX_SAFE_INTEGER, false);
  // Older supported snapshots lack source/visual detail; absence stays unknown.
  if (p.source !== undefined) {
    const source = record(p.source, path + '.source');
    for (const key of ['seenAttr', 'caughtAttr', 'natureAttr']) {
      if (typeof source[key] !== 'string' || !/^\d+$/.test(source[key] as string)) invalid(path + '.source.' + key);
    }
    for (const [key, max] of Object.entries({ eggMoveMask: 15, abilityMask: 7, passiveMask: 3 })) number(source[key], path + '.source.' + key, max);
  }
  if (p.visual !== undefined) {
    const visual = record(p.visual, path + '.visual');
    number(visual.shinyTier, path + '.visual.shinyTier', 3);
    for (const key of ['shinyCaught', 'maleCaught', 'femaleCaught', 'defaultVariantCaught', 'variant2Caught', 'variant3Caught', 'defaultFormCaught']) bool(visual[key], path + '.visual.' + key);
  }
}
function change(value: unknown, path: string): void {
  const c = record(value, path);
  timestamp(c.timestamp, path + '.timestamp'); number(c.pokemonId, path + '.pokemonId');
  for (const key of ['importId', 'pokemon', 'category', 'before', 'after', 'teamImpact', 'sourceFile']) text(c[key], path + '.' + key);
  if (!['Info', 'Improvement', 'Complete', 'Major', 'Team'].includes(c.importance as string)) invalid(path + '.importance');
}
function snapshot(value: unknown, path: string): void {
  const s = record(value, path);
  if (s.schemaVersion !== undefined && s.schemaVersion !== 1 && s.schemaVersion !== 2) invalid(path + '.schemaVersion');
  if (s.referenceVersion !== undefined) text(s.referenceVersion, path + '.referenceVersion', true);
  for (const key of ['legacy', 'demo']) if (s[key] !== undefined) bool(s[key], path + '.' + key);
  for (const key of ['id', 'importId', 'sourceFile', 'gameVersion']) text(s[key], path + '.' + key, true);
  timestamp(s.saveTimestamp, path + '.saveTimestamp');
  array(s.pokemon, path + '.pokemon', pokemon);
  const ids = (s.pokemon as Record<string, unknown>[]).map(p => p.id);
  if (new Set(ids).size !== ids.length) invalid(path + '.pokemon duplicate IDs');
  const account = record(s.account, path + '.account');
  for (const key of accountCounters) number(account[key], path + '.account.' + key);
  const vouchers = record(account.vouchers, path + '.account.vouchers');
  for (const key of ['regular', 'plus', 'premium', 'golden']) number(vouchers[key], path + '.account.vouchers.' + key);
  const stats = record(account.stats, path + '.account.stats');
  for (const [key, value] of Object.entries(stats)) number(value, path + '.account.stats.' + key, Number.MAX_SAFE_INTEGER, false);
  array(s.latestChanges, path + '.latestChanges', change);
  if (s.importWarnings !== undefined) array(s.importWarnings, path + '.importWarnings', (v, p) => text(v, p));
}
export function validateState(value: unknown): void {
  const state = record(value, 'state');
  if (state.current !== null) snapshot(state.current, 'state.current');
  array(state.snapshots, 'state.snapshots', snapshot);
  array(state.history, 'state.history', change);
}
