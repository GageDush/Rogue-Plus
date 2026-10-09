import { expect, it } from 'vitest';
import { createDexReferenceIndex, known, unavailable, type DexReferencePack, type DexSpeciesReference } from '../src/reference/dex-contract';

const species: DexSpeciesReference = {
  id: 1, key: 'SYNTHETIC', name: 'Synthetic Species', generation: known(1),
  originalStarterCost: known(null), forms: known([]), starterRootIds: unavailable('Not extracted yet'),
  evolutionIds: known([]), evolutionLinks: known([]), formChangeLinks: known([]), passiveAbilityId: known(null), eggMoveIds: unavailable('Not extracted yet'), eggMoveSourceId: unavailable('Not extracted yet'),
};
const coverage = { status: 'unavailable', count: 0, boundary: 'Synthetic test only' } as const;
function fixture(): DexReferencePack {
  return { schemaVersion: 1, referenceVersion: 'synthetic-v1', provenance: { repository: 'synthetic/source', commit: 'a'.repeat(40), paths: ['fixture.ts'] },
    coverage: { species: { ...coverage, status: 'partial', count: 1 }, roots: coverage, abilities: coverage, moves: coverage, selection: coverage },
    species: [species], types: [], abilities: [], moves: [] };
}
it('separates unavailable coverage from known absence and a zero reference fact', () => {
  const ref = createDexReferenceIndex(fixture());
  expect(ref.speciesFact(1)).toEqual(known(species));
  expect(ref.speciesFact(999)).toMatchObject({ status: 'unavailable' });
  expect(species.originalStarterCost).toEqual(known(null));
  expect(species.evolutionIds).toEqual(known([]));
  expect(species.starterRootIds.status).toBe('unavailable');
  expect(known(0)).toEqual({ status: 'known', value: 0 });
});
it('rejects duplicate identities in every fact table instead of overwriting', () => {
  for (const table of ['species', 'types', 'abilities', 'moves'] as const) {
    const pack = fixture();
    expect(() => createDexReferenceIndex({ ...pack, [table]: [species, species] })).toThrow('duplicate');
  }
});
it('requires a pinned revision and source boundary', () => {
  const pack = fixture();
  for (const provenance of [{ ...pack.provenance, commit: 'beta' }, { ...pack.provenance, paths: [] }]) {
    expect(() => createDexReferenceIndex({ ...pack, provenance })).toThrow('pinned provenance');
  }
});
it('indexes a partial pack without inventing uncovered named references or mutating facts', () => {
  const pack = Object.freeze(fixture()); const ref = createDexReferenceIndex(pack);
  expect(ref.abilities.get(100)).toBeUndefined(); expect(ref.moves.size).toBe(0);
  expect(ref.coverage.selection.status).toBe('unavailable'); expect(ref.species.get(1)).toBe(species);
  expect(pack.species).toEqual([species]);
});
