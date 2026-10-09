import { describe, expect, it } from 'vitest';
import {
  createBackupEnvelope,
  createStateEnvelope,
  emptyAppState,
  migrateLegacyState,
  normalizeLoadedState,
  parseBackup,
  parseStateEnvelope,
  runStorageSchemaSelfTest,
} from '../src/storage/schema';
import { runImportSelfTest } from '../src/import/import-save';
import type { AppState } from '../src/domain/types';
import { buildDemoState } from '../src/pokerogue';

const sample = (): AppState => {
  const current = buildDemoState().current!;
  current.sourceFile = 'sample-only.prsv';
  return { current, snapshots: [current], history: [] };
};

describe('Local-only backup and storage safety', () => {
  it('runs existing schema and encrypted import self-tests', () => {
    expect(runStorageSchemaSelfTest()).toBe(true);
    expect(runImportSelfTest()).toBe(true);
  });

  it('round trips synthetic account and snapshot data without altering the input', () => {
    const original = sample();
    const before = structuredClone(original);
    const envelope = createBackupEnvelope(original, '2026-01-02T00:00:00.000Z');
    const parsed = parseBackup(JSON.parse(JSON.stringify(envelope)));
    expect(parsed.source).toBe('schema-v1-backup');
    expect(parsed.warnings).toEqual([]);
    expect(parsed.state).toEqual(before);
    expect(original).toEqual(before);
    expect(parsed.state).not.toBe(original);
  });

  it('restores both versioned envelopes and legacy raw backups', () => {
    const state = sample();
    const envelope = createStateEnvelope(state, '2026-01-02T00:00:00.000Z');
    expect(parseStateEnvelope(JSON.parse(JSON.stringify(envelope))).state).toEqual(state);
    const legacy = parseBackup(state);
    expect(legacy.source).toBe('legacy-raw-backup');
    expect(legacy.warnings.length).toBeGreaterThan(0);
  });

  it('preserves old schema snapshots with explicit legacy labels', () => {
    const state = sample();
    const old = { ...state.current, schemaVersion: undefined };
    const migrated = migrateLegacyState({ current: old, snapshots: [old], history: [] });
    expect(migrated.current?.legacy).toBe(true);
    expect(migrated.snapshots[0].legacy).toBe(true);
    expect(migrated.snapshots[0].sourceFile).toBe('sample-only.prsv');
  });

  it('rejects malformed and future data instead of silently importing it', () => {
    expect(() => normalizeLoadedState({ current: [], history: [], snapshots: [] })).toThrow();
    expect(() => parseBackup({ ...createBackupEnvelope(sample()), backupSchemaVersion: 900 })).toThrow(/newer/i);
    expect(() => parseStateEnvelope({ ...createStateEnvelope(sample()), schemaVersion: 900 })).toThrow(/newer/i);
    expect(() => parseBackup({ arbitrary: true })).toThrow(/not a recognized/i);
    expect(() => parseStateEnvelope({})).toThrow(/not a versioned/i);
  });

  it.each([
    ['incomplete snapshot', (b: any) => { b.state.current = { schemaVersion: 2 }; }],
    ['invalid snapshots', (b: any) => { b.state.snapshots = [null]; }],
    ['invalid history', (b: any) => { b.state.history = [17]; }],
    ['invalid latest changes', (b: any) => { b.state.current.latestChanges = [null]; }],
    ['invalid IV', (b: any) => { b.state.current.pokemon[0].ivHp = 32; }],
    ['nonfinite counter', (b: any) => { b.state.current.pokemon[0].candy = Infinity; }],
    ['wrong boolean', (b: any) => { b.state.current.pokemon[0].unlocked = 'true'; }],
    ['invalid source', (b: any) => { b.state.current.pokemon[0].source.caughtAttr = '-1'; }],
    ['invalid visual', (b: any) => { b.state.current.pokemon[0].visual.shinyTier = 4; }],
    ['missing metrics', (b: any) => { delete b.state.current.account.vouchers; }],
    ['invalid stats', (b: any) => { b.state.current.account.stats.battles = '123'; }],
    ['future snapshot', (b: any) => { b.state.current.schemaVersion = 900; }],
    ['duplicate species', (b: any) => { b.state.current.pokemon.push(b.state.current.pokemon[0]); }],
    ['missing state version', (b: any) => { delete b.stateSchemaVersion; }],
    ['negative state version', (b: any) => { b.stateSchemaVersion = -1; }],
    ['coerced version', (b: any) => { b.backupSchemaVersion = '1'; }],
    ['invalid metadata', (b: any) => { b.exportedAt = 'not-a-date'; }],
  ])('rejects %s without changing the existing account', (_name, corrupt) => {
    const original = sample(); const before = structuredClone(original);
    const backup = createBackupEnvelope(structuredClone(original)); corrupt(backup);
    let current = original;
    expect(() => { current = parseBackup(backup).state; }).toThrow();
    expect(current).toBe(original); expect(current).toEqual(before);
  });

  it('preserves older snapshots without fabricating missing source fields', () => {
    const state = sample(); const legacy = state.current!;
    delete legacy.schemaVersion;
    for (const row of legacy.pokemon) { delete (row as any).source; delete (row as any).visual; }
    const loaded = parseBackup(state).state;
    expect(loaded.current?.legacy).toBe(true);
    expect(loaded.current?.pokemon[0]).not.toHaveProperty('source');
  });
});
