import type { AppState, Snapshot } from '../domain/types';
import { REFERENCE_VERSION } from '../reference';
import { timestamp, validateState } from './validate-state';
import {
  BACKUP_KIND,
  BACKUP_SCHEMA_VERSION,
  STATE_ENVELOPE_SCHEMA_VERSION,
  type BackupEnvelope,
  type BackupRestoreResult,
  type StoredStateEnvelope,
} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAppStateLike(value: unknown): value is AppState {
  if (!isRecord(value)) return false;
  return (
    (value.current === null || isRecord(value.current))
    && Array.isArray(value.snapshots)
    && Array.isArray(value.history)
  );
}

function markSnapshotLegacy(snapshot: Snapshot): Snapshot {
  return snapshot.schemaVersion === 2 ? snapshot : { ...snapshot, legacy: true };
}

export function emptyAppState(): AppState {
  return { current: null, snapshots: [], history: [] };
}

export function normalizeLoadedState(value: unknown): AppState {
  if (!isAppStateLike(value)) {
    throw new Error('Stored Command Center data had an invalid state shape.');
  }
  validateState(value);
  return {
    current: value.current ? markSnapshotLegacy(value.current as Snapshot) : null,
    snapshots: (value.snapshots as Snapshot[]).map(markSnapshotLegacy),
    history: [...value.history],
  };
}

export function createStateEnvelope(state: AppState, savedAt = new Date().toISOString()): StoredStateEnvelope {
  return {
    kind: 'pokerogue-command-center-state',
    schemaVersion: STATE_ENVELOPE_SCHEMA_VERSION,
    referenceVersion: REFERENCE_VERSION,
    savedAt,
    state: normalizeLoadedState(state),
  };
}

export function parseStateEnvelope(value: unknown): StoredStateEnvelope {
  if (!isRecord(value) || value.kind !== 'pokerogue-command-center-state') {
    throw new Error('Stored data was not a versioned Command Center state envelope.');
  }
  const version = value.schemaVersion;
  if (typeof version === 'number' && version > STATE_ENVELOPE_SCHEMA_VERSION) {
    throw new Error(
      'This local state was created by a newer Command Center storage schema (' + String(version) + ').'
    );
  }
  if (version !== STATE_ENVELOPE_SCHEMA_VERSION) {
    throw new Error('Unsupported Command Center state schema ' + String(version) + '.');
  }
  if (typeof value.referenceVersion !== 'string' || typeof value.savedAt !== 'string') {
    throw new Error('Stored Command Center state metadata was incomplete.');
  }
  timestamp(value.savedAt, 'savedAt');
  return {
    kind: 'pokerogue-command-center-state',
    schemaVersion: STATE_ENVELOPE_SCHEMA_VERSION,
    referenceVersion: value.referenceVersion,
    savedAt: value.savedAt,
    state: normalizeLoadedState(value.state),
  };
}

export function migrateLegacyState(value: unknown): AppState {
  return normalizeLoadedState(value);
}

export function createBackupEnvelope(state: AppState, exportedAt = new Date().toISOString()): BackupEnvelope {
  return {
    kind: BACKUP_KIND,
    backupSchemaVersion: BACKUP_SCHEMA_VERSION,
    stateSchemaVersion: STATE_ENVELOPE_SCHEMA_VERSION,
    referenceVersion: REFERENCE_VERSION,
    exportedAt,
    state: normalizeLoadedState(state),
  };
}

export function parseBackup(value: unknown): BackupRestoreResult {
  if (isRecord(value) && value.kind === BACKUP_KIND) {
    const backupVersion = value.backupSchemaVersion;
    if (typeof backupVersion === 'number' && backupVersion > BACKUP_SCHEMA_VERSION) {
      throw new Error(
        'This backup was created by a newer Command Center backup format (' + String(backupVersion) + ').'
      );
    }
    if (backupVersion !== BACKUP_SCHEMA_VERSION) {
      throw new Error('Unsupported Command Center backup format ' + String(backupVersion) + '.');
    }
    const stateSchemaVersion = value.stateSchemaVersion;
    if (typeof stateSchemaVersion === 'number' && stateSchemaVersion > STATE_ENVELOPE_SCHEMA_VERSION) {
      throw new Error(
        'This backup contains a newer state schema (' + String(stateSchemaVersion) + ').'
      );
    }
    if (stateSchemaVersion !== STATE_ENVELOPE_SCHEMA_VERSION) throw new Error('Unsupported or missing backup state schema.');
    if (typeof value.referenceVersion !== 'string' || !value.referenceVersion.trim()) throw new Error('Backup reference metadata was incomplete.');
    timestamp(value.exportedAt, 'exportedAt');
    const warnings: string[] = [];
    if (typeof value.referenceVersion === 'string' && value.referenceVersion !== REFERENCE_VERSION) {
      warnings.push(
        'Backup reference version ' + value.referenceVersion + ' differs from this build (' + REFERENCE_VERSION + ').'
      );
    }
    return {
      state: normalizeLoadedState(value.state),
      source: 'schema-v1-backup',
      warnings,
    };
  }

  if (isAppStateLike(value)) {
    return {
      state: migrateLegacyState(value),
      source: 'legacy-raw-backup',
      warnings: [
        'Legacy unversioned backup restored. Older snapshots were preserved and marked legacy where needed.',
      ],
    };
  }

  throw new Error('That file is not a recognized Command Center backup.');
}

export function runStorageSchemaSelfTest(): boolean {
  try {
    const legacy = {
      current: null,
      snapshots: [],
      history: [],
    };
    const migrated = migrateLegacyState(legacy);
    if (migrated.current !== null) return false;

    const envelope = createStateEnvelope(emptyAppState(), '2026-01-01T00:00:00.000Z');
    if (parseStateEnvelope(envelope).schemaVersion !== 2) return false;

    const backup = createBackupEnvelope(emptyAppState(), '2026-01-01T00:00:00.000Z');
    const restored = parseBackup(backup);
    if (restored.source !== 'schema-v1-backup') return false;

    const rawRestored = parseBackup(emptyAppState());
    if (rawRestored.source !== 'legacy-raw-backup') return false;

    return true;
  } catch {
    return false;
  }
}
