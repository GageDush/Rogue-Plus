import type { AppState } from '../domain/types';

export const STORAGE_DB_NAME = 'pokerogue-command-center';
export const STORAGE_DB_VERSION = 2;
export const STORAGE_OBJECT_STORE = 'state';
export const STORAGE_STATE_KEY = 'app-state-v2';
export const LEGACY_STORAGE_STATE_KEY = 'app-state';
export const STATE_ENVELOPE_SCHEMA_VERSION = 2;
export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_KIND = 'pokerogue-command-center-backup';

export type StorageBackend = 'indexeddb' | 'localStorage';
export type StorageLoadSource =
  | 'schema-v2'
  | 'migrated-legacy'
  | 'empty'
  | 'restored-backup';

export interface StoredStateEnvelope {
  kind: 'pokerogue-command-center-state';
  schemaVersion: 2;
  referenceVersion: string;
  savedAt: string;
  state: AppState;
}

export interface BackupEnvelope {
  kind: typeof BACKUP_KIND;
  backupSchemaVersion: 1;
  stateSchemaVersion: 2;
  referenceVersion: string;
  exportedAt: string;
  state: AppState;
}

export interface StorageStatus {
  backend: StorageBackend;
  dbVersion: number;
  stateSchemaVersion: number;
  referenceVersion: string;
  loadSource: StorageLoadSource;
  currentState: 'none' | 'legacy' | 'schema-v2';
  legacySnapshotCount: number;
  snapshotCount: number;
  historyCount: number;
  lastSavedAt: string | null;
  warnings: string[];
}

export interface StorageLoadResult {
  state: AppState;
  status: StorageStatus;
}

export interface BackupRestoreResult {
  state: AppState;
  source: 'schema-v1-backup' | 'legacy-raw-backup';
  warnings: string[];
}
