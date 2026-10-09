import { DEX_REFERENCE, DEX_REFERENCE_PACK, STARTER_BY_ID } from '../reference';
import type { BaseStats, DexSpeciesReference, ReferenceValue } from '../reference/dex-contract';
import type { PokemonRecord, Snapshot } from './types';
import { getStarterSelection, type StarterSelection } from './starter-selection';

export const referenceValue = <T>(fact: ReferenceValue<T> | undefined): T | undefined => fact?.status === 'known' ? fact.value : undefined;
export interface DexEntry {
  id: number;
  name: string;
  account: PokemonRecord | null;
  reference: DexSpeciesReference | null;
  starterIds: number[];
  starterNames: string[];
  relatedNames: string[];
  typeNames: string[];
  generation?: number;
  baseStats?: BaseStats;
  baseStatTotal?: number;
  selection: StarterSelection | null;
  matchReason?: string;
}

/** A projection only: reference-only species never become imported Pokémon records. */
export function createDexCatalog(snapshot: Snapshot | null): DexEntry[] {
  const account = new Map((snapshot?.pokemon ?? []).map(pokemon => [pokemon.id,pokemon]));
  const compatible = !snapshot || snapshot.referenceVersion === DEX_REFERENCE_PACK.referenceVersion && snapshot.schemaVersion === 2 && !snapshot.legacy;
  const names = new Map<number,string[]>();
  for (const species of DEX_REFERENCE_PACK.species) {
    const roots = referenceValue(species.starterRootIds) ?? [];
    const aliases = [species.name, STARTER_BY_ID.get(species.id)?.name ?? '', species.key.replace(/_/g,' '),
      ...(referenceValue(species.forms) ?? []).map(form=>`${species.name} ${form.name}`)];
    for (const root of roots) names.set(root,[...(names.get(root) ?? []),...aliases]);
  }
  const entries: DexEntry[] = DEX_REFERENCE_PACK.species.map(reference => {
    const record = account.get(reference.id) ?? null;
    const isStarter = referenceValue(reference.originalStarterCost) != null;
    const starterIds = isStarter ? [reference.id] : [...(referenceValue(reference.starterRootIds) ?? [])];
    const form = referenceValue(reference.forms)?.[0];
    return {
      id:reference.id,name:record?.name || STARTER_BY_ID.get(reference.id)?.name || reference.name,
      account:record,reference,starterIds,
      starterNames:starterIds.map(id=>STARTER_BY_ID.get(id)?.name ?? DEX_REFERENCE.species.get(id)?.name ?? `Starter #${id}`),
      relatedNames:names.get(reference.id) ?? [],
      typeNames:(referenceValue(form?.types) ?? []).map(id=>DEX_REFERENCE.types.get(id)?.name ?? 'Unknown'),
      generation:referenceValue(reference.generation),baseStats:referenceValue(form?.baseStats),baseStatTotal:referenceValue(form?.baseStatTotal),
      selection:isStarter ? getStarterSelection(reference,DEX_REFERENCE_PACK,record?.source,Boolean(compatible),DEX_REFERENCE) : null,
    } satisfies DexEntry;
  });
  // Preserve partial/synthetic imports outside coverage without manufacturing reference facts.
  for (const pokemon of account.values()) if (!DEX_REFERENCE.species.has(pokemon.id)) entries.push({
    id:pokemon.id,name:pokemon.name,account:pokemon,reference:null,starterIds:[pokemon.id],starterNames:[pokemon.name],
    relatedNames:[],typeNames:[],generation:undefined,baseStats:undefined,baseStatTotal:undefined,selection:null,
  });
  return entries;
}
