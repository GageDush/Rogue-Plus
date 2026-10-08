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
import type { AppState, Snapshot } from '../src/domain/types';

const sample = (): AppState => {
  const current = {
    schemaVersion: 2,
    id: 'synthetic-demo',
    importId: 'synthetic-import-001',
    sourceFile: 'sample-only.prsv',
    saveTimestamp: '2026-01-01T00:00:00.000Z',
    gameVersion: 'TEST',
    pokemon: [],
    account: { stats: {}, startersUnlocked: 0 },
    latestChanges: [],
  } as unknown as Snapshot;
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
});
