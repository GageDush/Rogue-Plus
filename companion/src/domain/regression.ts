import { countBits } from './bitfield';
import { getCurrentStarterCost, isStarterUnlocked } from './pokemon';
import type { Snapshot } from './types';

/** Local-only account expectations; never bundle a personal regression fixture. */
export interface AccountRegressionFixture {
  gameVersion: string;
  saveTimestampUtc: string;
  accountExpectations?: Record<string, number | null | Record<string, number | null>>;
  careerExpectations?: Record<string, number | null>;
}

export function assertNormalizedSnapshot(snapshot: Snapshot): void {
  const { account, pokemon } = snapshot;
  if (account.startersTotal !== pokemon.length || account.passivesTotal !== pokemon.length) {
    throw new Error('Normalized snapshot has inconsistent starter/passive totals.');
  }
  if (account.eggMovesTotal !== pokemon.length * 4) {
    throw new Error('Normalized snapshot has an inconsistent egg-move total.');
  }
  for (const [name, value, maximum] of [
    ['startersUnlocked', account.startersUnlocked, account.startersTotal],
    ['passivesUnlocked', account.passivesUnlocked, account.passivesTotal],
    ['eggMovesUnlocked', account.eggMovesUnlocked, account.eggMovesTotal],
  ] as const) {
    if (!Number.isInteger(value) || value < 0 || value > maximum) {
      throw new Error('Invalid normalized snapshot value: ' + name);
    }
  }
}

/** Optional test-only validation using a local fixture outside the web bundle. */
export function assertAccountRegression(snapshot: Snapshot, fixture: AccountRegressionFixture): void {
  if (snapshot.gameVersion !== fixture.gameVersion || snapshot.saveTimestamp !== fixture.saveTimestampUtc) {
    throw new Error('Local regression fixture does not match the selected save.');
  }
  const failures: string[] = [];
  const actual = snapshot.account as unknown as Record<string, unknown>;
  const check = (label: string, value: unknown, expected: number) => {
    if (value !== expected) failures.push(label + ': expected ' + expected + ', received ' + String(value));
  };
  for (const [key, expected] of Object.entries(fixture.accountExpectations ?? {})) {
    if (typeof expected === 'number') check(key, actual[key], expected);
    else if (expected && typeof expected === 'object') {
      const section = actual[key] as Record<string, unknown> | undefined;
      for (const [field, count] of Object.entries(expected)) {
        if (typeof count === 'number') check(key + '.' + field, section?.[field], count);
      }
    }
  }
  for (const [key, expected] of Object.entries(fixture.careerExpectations ?? {})) {
    if (typeof expected === 'number') check('gameStats.' + key, snapshot.account.stats[key], expected);
  }
  if (failures.length) throw new Error('Local account regression failed: ' + failures.join('; '));
}

export function runDomainSelfTest(): boolean {
  try {
    if (!isStarterUnlocked('157')) return false;
    if (isStarterUnlocked('0')) return false;
    if (countBits(15) !== 4) return false;
    if (getCurrentStarterCost(1, 2) !== 0.25) return false;
    if (getCurrentStarterCost(8, 2) !== 6) return false;
    return true;
  } catch {
    return false;
  }
}
