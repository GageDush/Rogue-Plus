import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStoredValues, clearStoredAccountState } from '../src/storage/indexeddb';
import { STORAGE_STATE_KEY, LEGACY_STORAGE_STATE_KEY } from '../src/storage/types';

let bytes: Map<string, string>;
beforeEach(() => {
  bytes = new Map();
  vi.stubGlobal('indexedDB', undefined);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => bytes.get(key) ?? null,
    removeItem: (key: string) => bytes.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('Raw local data remains recoverable', () => {
  it.each(['{broken-json', ''])('rejects malformed raw JSON without changing bytes', async raw => {
    bytes.set(STORAGE_STATE_KEY, raw);
    await expect(readStoredValues()).rejects.toThrow(/invalid JSON/);
    expect(bytes.get(STORAGE_STATE_KEY)).toBe(raw);
  });

  it('rejects malformed legacy raw JSON', async () => {
    bytes.set(LEGACY_STORAGE_STATE_KEY, 'not-json');
    await expect(readStoredValues()).rejects.toThrow(/invalid JSON/);
    expect(bytes.get(LEGACY_STORAGE_STATE_KEY)).toBe('not-json');
  });

  it('supports truly absent storage when IndexedDB is unavailable', async () => {
    expect(await readStoredValues()).toEqual({ backend: 'localStorage', current: undefined, legacy: undefined });
  });

  it('does not treat an IndexedDB failure as an empty local account or successful reset', async () => {
    bytes.set(STORAGE_STATE_KEY, 'preserve-me');
    vi.stubGlobal('indexedDB', { open: () => {
      const request = { error: new Error('DB unavailable'), onerror: null as null | (() => void) };
      queueMicrotask(() => request.onerror?.());
      return request;
    } });
    await expect(readStoredValues()).rejects.toThrow('DB unavailable');
    await expect(clearStoredAccountState()).rejects.toThrow('DB unavailable');
    expect(bytes.get(STORAGE_STATE_KEY)).toBe('preserve-me');
  });
});
