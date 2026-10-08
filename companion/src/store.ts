import type { AppState, Snapshot } from './domain/types';
import { REFERENCE_VERSION } from './reference';
import {
  createBackupEnvelope,
  createStateEnvelope,
  emptyAppState,
  migrateLegacyState,
  parseBackup,
  parseStateEnvelope,
  runStorageSchemaSelfTest,
} from './storage/schema';
import {
  clearStoredAccountState,
  readStoredValues,
  writeStoredValue,
} from './storage/indexeddb';
import {
  STATE_ENVELOPE_SCHEMA_VERSION,
  STORAGE_DB_VERSION,
  type BackupRestoreResult,
  type StorageBackend,
  type StorageLoadResult,
  type StorageLoadSource,
  type StorageStatus,
} from './storage/types';

export type { StorageStatus } from './storage/types';

export function emptyState(): AppState {
  return emptyAppState();
}

function currentStateKind(current: Snapshot | null): StorageStatus['currentState'] {
  if (!current) return 'none';
  return current.schemaVersion === 2 && !current.legacy ? 'schema-v2' : 'legacy';
}

function makeStatus(
  state: AppState,
  backend: StorageBackend,
  loadSource: StorageLoadSource,
  lastSavedAt: string | null,
  warnings: string[] = [],
  referenceVersion = REFERENCE_VERSION
): StorageStatus {
  return {
    backend,
    dbVersion: STORAGE_DB_VERSION,
    stateSchemaVersion: STATE_ENVELOPE_SCHEMA_VERSION,
    referenceVersion,
    loadSource,
    currentState: currentStateKind(state.current),
    legacySnapshotCount: state.snapshots.filter(snapshot => snapshot.schemaVersion !== 2 || snapshot.legacy).length,
    snapshotCount: state.snapshots.length,
    historyCount: state.history.length,
    lastSavedAt,
    warnings,
  };
}

export async function loadStateWithStatus(): Promise<StorageLoadResult> {
  const stored = await readStoredValues();

  if (stored.current !== undefined) {
    try {
      const envelope = parseStateEnvelope(stored.current);
      return {
        state: envelope.state,
        status: makeStatus(
          envelope.state,
          stored.backend,
          'schema-v2',
          envelope.savedAt,
          [],
          envelope.referenceVersion
        ),
      };
    } catch (error) {
      if (stored.legacy === undefined) throw error;
    }
  }

  if (stored.legacy !== undefined) {
    const state = migrateLegacyState(stored.legacy);
    const envelope = createStateEnvelope(state);
    const backend = await writeStoredValue(envelope);
    return {
      state,
      status: makeStatus(
        state,
        backend,
        'migrated-legacy',
        envelope.savedAt,
        ['Legacy local state was preserved and migrated into the versioned storage envelope.']
      ),
    };
  }

  const state = emptyAppState();
  return {
    state,
    status: makeStatus(state, stored.backend, 'empty', null),
  };
}

export async function saveState(state: AppState): Promise<StorageStatus> {
  const envelope = createStateEnvelope(state);
  const backend = await writeStoredValue(envelope);
  return makeStatus(state, backend, 'schema-v2', envelope.savedAt);
}

export function createBackupText(state: AppState): string {
  return JSON.stringify(createBackupEnvelope(state), null, 2);
}

export function restoreBackupText(text: string): BackupRestoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Backup file was not valid JSON.');
  }
  return parseBackup(parsed);
}

export async function clearAccountStorage(): Promise<StorageStatus> {
  const backend = await clearStoredAccountState();
  const state = emptyAppState();
  return makeStatus(state, backend, 'empty', null);
}

export function statusAfterRestore(
  state: AppState,
  backend: StorageBackend,
  warnings: string[] = []
): StorageStatus {
  return makeStatus(state, backend, 'restored-backup', null, warnings);
}

export { runStorageSchemaSelfTest };
