import {
  LEGACY_STORAGE_STATE_KEY,
  STORAGE_DB_NAME,
  STORAGE_DB_VERSION,
  STORAGE_OBJECT_STORE,
  STORAGE_STATE_KEY,
  type StorageBackend,
} from './types';

export interface StorageReadPair {
  backend: StorageBackend;
  current: unknown;
  legacy: unknown;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORAGE_OBJECT_STORE)) {
        db.createObjectStore(STORAGE_OBJECT_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB upgrade was blocked by another open tab.'));
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORAGE_OBJECT_STORE, 'readonly');
    const request = tx.objectStore(STORAGE_OBJECT_STORE).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readStoredValues(): Promise<StorageReadPair> {
  try {
    const db = await openDb();
    const [current, legacy] = await Promise.all([
      idbGet(db, STORAGE_STATE_KEY),
      idbGet(db, LEGACY_STORAGE_STATE_KEY),
    ]);
    db.close();
    return { backend: 'indexeddb', current, legacy };
  } catch {
    return {
      backend: 'localStorage',
      current: readLocal(STORAGE_STATE_KEY),
      legacy: readLocal(LEGACY_STORAGE_STATE_KEY),
    };
  }
}

function readLocal(key: string): unknown {
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export async function writeStoredValue(value: unknown): Promise<StorageBackend> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORAGE_OBJECT_STORE, 'readwrite');
      tx.objectStore(STORAGE_OBJECT_STORE).put(value, STORAGE_STATE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
    localStorage.removeItem(STORAGE_STATE_KEY);
    return 'indexeddb';
  } catch {
    localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(value));
    return 'localStorage';
  }
}

export async function clearStoredAccountState(): Promise<StorageBackend> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORAGE_OBJECT_STORE, 'readwrite');
      const store = tx.objectStore(STORAGE_OBJECT_STORE);
      store.delete(STORAGE_STATE_KEY);
      store.delete(LEGACY_STORAGE_STATE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
    localStorage.removeItem(STORAGE_STATE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_STATE_KEY);
    return 'indexeddb';
  } catch {
    localStorage.removeItem(STORAGE_STATE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_STATE_KEY);
    return 'localStorage';
  }
}
