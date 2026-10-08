import { CANONICAL_FUSIONS, FUSION_INHERITANCE_NEEDS_RECHECK } from './fusions';
import { CANONICAL_TEAMS, getTeamReadiness } from './teams';
import type { PokemonRecord, Snapshot, TeamReadiness } from './types';
import type { StorageStatus } from '../storage/types';

export interface PokeRogueData {
  snapshot: Snapshot;
  account: Snapshot['account'];
  pokemon: PokemonRecord[];
  pokemonById: Map<number, PokemonRecord>;
  pokemonByName: Map<string, PokemonRecord>;
  priorities: PokemonRecord[];
  teams: typeof CANONICAL_TEAMS;
  teamReadiness: TeamReadiness[];
  fusions: typeof CANONICAL_FUSIONS;
  fusionInheritanceNeedsRecheck: boolean;
  changes: Snapshot['latestChanges'];
  storage: StorageStatus | null;
}

export function createPokeRogueData(
  snapshot: Snapshot,
  storage: StorageStatus | null = null
): PokeRogueData {
  if (snapshot.schemaVersion !== 2 || snapshot.legacy) {
    throw new Error('Legacy snapshots must be preserved but not interpreted through the schema-v2 domain facade. Import a fresh .prsv first.');
  }
  const pokemonById = new Map(snapshot.pokemon.map(pokemon => [pokemon.id, pokemon]));
  const pokemonByName = new Map(snapshot.pokemon.map(pokemon => [pokemon.name, pokemon]));
  const teamReadiness = CANONICAL_TEAMS
    .map(team => getTeamReadiness(team.id, pokemonByName))
    .filter((result): result is TeamReadiness => result !== null);

  return {
    snapshot,
    account: snapshot.account,
    pokemon: snapshot.pokemon,
    pokemonById,
    pokemonByName,
    priorities: [...snapshot.pokemon]
      .filter(pokemon => pokemon.progressGaps !== 'None')
      .sort((a, b) => b.priorityScore - a.priorityScore),
    teams: CANONICAL_TEAMS,
    teamReadiness,
    fusions: CANONICAL_FUSIONS,
    fusionInheritanceNeedsRecheck: FUSION_INHERITANCE_NEEDS_RECHECK,
    changes: snapshot.latestChanges,
    storage,
  };
}
