import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStateEnvelope, emptyAppState } from '../src/storage/schema';
import { loadStateWithStatus } from '../src/store';
import { readStoredValues, writeStoredValue } from '../src/storage/indexeddb';

vi.mock('../src/storage/indexeddb', () => ({
  readStoredValues: vi.fn(),
  writeStoredValue: vi.fn(),
  clearStoredAccountState: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe('Startup rejects unsafe replacement', () => {
  it.each([{}, { ...createStateEnvelope(emptyAppState()), schemaVersion: 900 },
    { ...createStateEnvelope(emptyAppState()), state: { current: { schemaVersion: 2 }, snapshots: [], history: [] } }])(
    'never migrates valid legacy data over rejected current bytes', async current => {
      const before = structuredClone(current);
      vi.mocked(readStoredValues).mockResolvedValue({ backend: 'indexeddb', current, legacy: emptyAppState() });
      await expect(loadStateWithStatus()).rejects.toThrow();
      expect(writeStoredValue).not.toHaveBeenCalled();
      expect(current).toEqual(before);
    }
  );

  it('propagates read failure without enabling a replacement', async () => {
    vi.mocked(readStoredValues).mockRejectedValue(new Error('Read unavailable'));
    await expect(loadStateWithStatus()).rejects.toThrow('Read unavailable');
    expect(writeStoredValue).not.toHaveBeenCalled();
  });

  it('rejects malformed legacy data without migration writes', async () => {
    vi.mocked(readStoredValues).mockResolvedValue({ backend: 'indexeddb', current: undefined, legacy: { invalid: true } });
    await expect(loadStateWithStatus()).rejects.toThrow();
    expect(writeStoredValue).not.toHaveBeenCalled();
  });

  it('loads a current envelope without a migration write', async () => {
    const current = createStateEnvelope(emptyAppState());
    vi.mocked(readStoredValues).mockResolvedValue({ backend: 'indexeddb', current, legacy: emptyAppState() });
    const result = await loadStateWithStatus();
    expect(result.state).toEqual(current.state);
    expect(result.status.loadSource).toBe('schema-v2');
    expect(writeStoredValue).not.toHaveBeenCalled();
  });

  it('still migrates legacy data when no current value exists', async () => {
    vi.mocked(readStoredValues).mockResolvedValue({ backend: 'indexeddb', current: undefined, legacy: emptyAppState() });
    vi.mocked(writeStoredValue).mockResolvedValue('indexeddb');
    expect((await loadStateWithStatus()).status.loadSource).toBe('migrated-legacy');
    expect(writeStoredValue).toHaveBeenCalledOnce();
  });
});
