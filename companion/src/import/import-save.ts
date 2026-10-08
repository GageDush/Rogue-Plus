import { runAssetResolverStaticSelfTest } from '../domain/assets';
import { compareSnapshots } from '../domain/changes';
import { assertNormalizedSnapshot, runDomainSelfTest } from '../domain/regression';
import type { AppState, ChangeRecord, Snapshot } from '../domain/types';
import { decryptSaveText } from './decrypt';
import { normalizeRawSave } from './normalize';
import { parseRawSaveJson } from './raw-save-schema';
import { SELF_TEST_CIPHERTEXT } from './self-test-fixture';

function markLegacy(snapshot: Snapshot): Snapshot {
  return snapshot.schemaVersion === 2 ? snapshot : { ...snapshot, legacy: true };
}

export function importSaveText(encryptedText: string, sourceFile: string, state: AppState): AppState {
  if (!runDomainSelfTest() || !runAssetResolverStaticSelfTest()) {
    throw new Error('The local architecture self-test failed. Import was stopped before reading your save.');
  }

  const plain = decryptSaveText(encryptedText);
  const raw = parseRawSaveJson(plain);
  const snapshot = normalizeRawSave(raw, sourceFile);
  assertNormalizedSnapshot(snapshot);

  const previousV2 = state.current?.schemaVersion === 2 ? state.current : null;
  const changes = compareSnapshots(previousV2, snapshot);
  snapshot.latestChanges = changes;

  const baseline: ChangeRecord[] = previousV2
    ? []
    : [{
        timestamp: snapshot.saveTimestamp,
        importId: snapshot.importId,
        pokemon: '—',
        pokemonId: 0,
        category: 'Baseline',
        before: state.current ? 'Legacy snapshot preserved' : '—',
        after: 'Schema v2 baseline established',
        importance: 'Info',
        teamImpact: 'Future schema v2 imports compare against this snapshot',
        sourceFile,
      }];

  const preservedSnapshots = state.snapshots.map(markLegacy);
  return {
    current: snapshot,
    snapshots: [snapshot, ...preservedSnapshots].slice(0, 30),
    history: [...changes, ...baseline, ...state.history].slice(0, 5000),
  };
}

export function runImportSelfTest(): boolean {
  try {
    const plain = decryptSaveText(SELF_TEST_CIPHERTEXT);
    const raw = parseRawSaveJson(plain);
    return (
      raw.gameVersion === 'PWA-SELFTEST'
      && Boolean(raw.starterData['1'])
      && Number(raw.gameStats.battles) === 1
      && runDomainSelfTest()
      && runAssetResolverStaticSelfTest()
    );
  } catch {
    return false;
  }
}
