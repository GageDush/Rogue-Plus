import teamsJson from '../presets/teams.v1.json';
import { STARTER_BY_NAME } from '../reference';
import type { PokemonRecord, TeamMemberReadiness, TeamReadiness } from './types';

export interface CanonicalTeamMember {
  slot: number;
  starter: string;
  shinyTier?: 'T1' | 'T2' | 'T3' | null;
  cost?: number;
  luck?: number;
  role?: string;
  gender?: string;
  form?: string;
  startingMoveIdea?: string[];
  tera?: string;
  recordedTera?: string;
  passive?: string;
  fusion?: string;
  ability?: string;
  keyMove?: string;
  inRunTarget?: string;
  moveConcept?: string[];
  instruction?: string;
  [key: string]: unknown;
}

export interface CanonicalTeam {
  id: string;
  name: string;
  mode: string;
  exactRoster: boolean;
  recordedTotalCost?: number | null;
  recordedLuck?: number | null;
  cap?: number;
  targetLuck?: number;
  targetShinyCharms?: number;
  members?: CanonicalTeamMember[];
  recordedFusionDirections?: string[];
  runArchitecture?: {
    early?: string;
    midgame?: string;
    late?: string;
    recordedTransitionWindow?: string;
  };
  coreFusion?: {
    first?: string;
    second?: string;
    finalConcept?: string[];
  };
  purpose?: string[];
  architecture?: string[];
  [key: string]: unknown;
}

interface TeamFile {
  schemaVersion: number;
  strategyVersion: string;
  source: string;
  teams: CanonicalTeam[];
}

export const CANONICAL_TEAM_FILE = teamsJson as TeamFile;
export const CANONICAL_TEAMS = CANONICAL_TEAM_FILE.teams;

export const CANONICAL_TEAM_IDS = new Set(
  CANONICAL_TEAMS.flatMap(team =>
    (team.members || [])
      .map(member => STARTER_BY_NAME.get(member.starter)?.id)
      .filter((id): id is number => typeof id === 'number')
  )
);

export function getTeamImpactForPokemonName(name: string): string {
  return CANONICAL_TEAMS
    .filter(team => (team.members || []).some(member => member.starter === name))
    .map(team => team.name)
    .join(', ');
}

function shinyTierMet(target: string | null | undefined, pokemon: PokemonRecord): boolean | null {
  if (!target) return null;
  if (target === 'T1') return pokemon.t1;
  if (target === 'T2') return pokemon.t2;
  if (target === 'T3') return pokemon.t3;
  return null;
}

export function getTeamReadiness(teamId: string, pokemonByName: Map<string, PokemonRecord>): TeamReadiness | null {
  const team = CANONICAL_TEAMS.find(candidate => candidate.id === teamId);
  if (!team || !team.exactRoster || !team.members) return null;

  const members: TeamMemberReadiness[] = team.members.map(member => {
    const reference = STARTER_BY_NAME.get(member.starter);
    const pokemon = pokemonByName.get(member.starter);
    const accountChecks: string[] = [];
    const unverifiedInRunRequirements: string[] = [];
    const tierMet = pokemon ? shinyTierMet(member.shinyTier, pokemon) : null;

    if (pokemon?.unlocked) accountChecks.push('starter unlocked');
    if (member.shinyTier && tierMet) accountChecks.push(member.shinyTier + ' shiny available');
    if (member.passive) {
      if (pokemon?.passiveUnlocked) accountChecks.push('species passive unlocked');
      else unverifiedInRunRequirements.push('required passive is not unlocked');
    }
    if (member.ability) unverifiedInRunRequirements.push('named ability selection');
    if (member.keyMove) unverifiedInRunRequirements.push('named move availability');
    if (member.startingMoveIdea?.length || member.moveConcept?.length) unverifiedInRunRequirements.push('named move package');
    if (member.fusion || member.inRunTarget) unverifiedInRunRequirements.push('fusion acquisition/order');
    if (member.tera || member.recordedTera) unverifiedInRunRequirements.push('in-run Tera requirement');
    if (member.instruction) unverifiedInRunRequirements.push('in-run timing/instruction');

    const unlocked = Boolean(pokemon?.unlocked);
    const status = !unlocked
      ? 'missing'
      : tierMet === false
        ? 'partial'
        : unverifiedInRunRequirements.length > 0
          ? 'partial'
          : 'available';

    return {
      starter: member.starter,
      starterId: reference?.id ?? null,
      unlocked,
      shinyTierTarget: member.shinyTier ?? null,
      shinyTierMet: tierMet,
      accountChecks,
      unverifiedInRunRequirements,
      status,
    };
  });

  const verifiable = members.filter(member => member.shinyTierMet !== null);
  return {
    teamId: team.id,
    teamName: team.name,
    members,
    startersAvailable: members.filter(member => member.unlocked).length,
    starterCount: members.length,
    verifiableTargetsMet: verifiable.filter(member => member.shinyTierMet).length,
    verifiableTargetCount: verifiable.length,
  };
}
