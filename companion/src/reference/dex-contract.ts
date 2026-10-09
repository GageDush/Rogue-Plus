/** Bundled public facts only. Imported ownership, selection results and local preferences live elsewhere. */
export type ReferenceValue<T> =
  | { readonly status: 'known'; readonly value: T }
  | { readonly status: 'unavailable'; readonly reason: string };

export const known = <T>(value: T): ReferenceValue<T> => ({ status: 'known', value });
export const unavailable = <T>(reason: string): ReferenceValue<T> => ({ status: 'unavailable', reason });

export interface ReferenceProvenance {
  readonly repository: string;
  readonly commit: string;
  readonly paths: readonly string[];
}
export interface NamedReference {
  readonly id: number;
  readonly key: string;
  readonly name: string;
}
export interface BaseStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
}
export interface AbilitySlots {
  readonly first: number;
  /** Declared NONE is null; game alias/selection rules are derived separately. */
  readonly second: number | null;
  readonly hidden: number | null;
}
export interface LevelMove {
  /** Preserve game sentinel levels; not an assertion of starter availability. */
  readonly level: number;
  readonly moveId: number;
}
export interface DexFormReference {
  readonly index: number;
  readonly key: string;
  readonly name: string;
  readonly types: ReferenceValue<readonly number[]>;
  readonly baseStats: ReferenceValue<BaseStats>;
  readonly baseStatTotal: ReferenceValue<number>;
  readonly abilities: ReferenceValue<AbilitySlots>;
  readonly starterSelectable: ReferenceValue<boolean>;
  readonly obtainable: ReferenceValue<boolean>;
  readonly levelMoves: ReferenceValue<readonly LevelMove[]>;
}
export interface DexSpeciesReference extends NamedReference {
  readonly generation: ReferenceValue<number>;
  /** Known null means this species is not a priced starter; unavailable does not. */
  readonly originalStarterCost: ReferenceValue<number | null>;
  readonly forms: ReferenceValue<readonly DexFormReference[]>;
  /** Explicit official starter associations, not a name/ID heuristic. */
  readonly starterRootIds: ReferenceValue<readonly number[]>;
  readonly evolutionIds: ReferenceValue<readonly number[]>;
  readonly passiveAbilityId: ReferenceValue<number | null>;
  /** Preserve official slot order. Ownership and unlocks are account facts. */
  readonly eggMoveIds: ReferenceValue<readonly number[]>;
}
export interface DexMoveReference extends NamedReference {
  readonly typeId: ReferenceValue<number>;
  readonly category: ReferenceValue<string>;
  /** Official move base power, distinct from damage, IVs and species base stats. */
  readonly basePower: ReferenceValue<number>;
}
export interface ReferenceCoverage {
  readonly status: 'complete' | 'partial' | 'unavailable';
  /** Exact represented records; completeness always names its source boundary. */
  readonly count: number;
  readonly boundary: string;
}
export interface DexReferencePack {
  readonly schemaVersion: 1;
  readonly referenceVersion: string;
  readonly provenance: ReferenceProvenance;
  readonly coverage: Readonly<Record<'species' | 'roots' | 'abilities' | 'moves' | 'selection', ReferenceCoverage>>;
  readonly species: readonly DexSpeciesReference[];
  readonly types: readonly NamedReference[];
  readonly abilities: readonly NamedReference[];
  readonly moves: readonly DexMoveReference[];
}

/** Index a build-generated, typed pack. Runtime downloaded-pack validation is a later task. */
export function createDexReferenceIndex(pack: DexReferencePack) {
  if (pack.schemaVersion !== 1 || !/^[0-9a-f]{40}$/.test(pack.provenance.commit)
    || !pack.provenance.repository || pack.provenance.paths.length === 0) {
    throw new Error('Dex reference requires versioned pinned provenance.');
  }
  function index<T extends NamedReference>(records: readonly T[]): ReadonlyMap<number, T> {
    const map = new Map<number, T>();
    for (const record of records) {
      if (!Number.isInteger(record.id) || record.id < 0 || !record.key || !record.name || map.has(record.id)) {
        throw new Error('Invalid or duplicate reference identity.');
      }
      map.set(record.id, record);
    }
    return map;
  }
  const species = index(pack.species);
  const types = index(pack.types);
  const abilities = index(pack.abilities);
  const moves = index(pack.moves);
  return {
    referenceVersion: pack.referenceVersion,
    provenance: pack.provenance,
    coverage: pack.coverage,
    species, types, abilities, moves,
    speciesFact(id: number): ReferenceValue<DexSpeciesReference> {
      const record = species.get(id);
      return record ? known(record) : unavailable('Species is outside the bundled reference coverage.');
    },
  };
}
