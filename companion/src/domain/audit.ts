import { runAssetResolverStaticSelfTest } from './assets';
import { CANONICAL_FUSIONS } from './fusions';
import { CANONICAL_TEAMS } from './teams';
import { STARTER_BY_NAME, STARTER_ROOTS } from '../reference';
import { runStorageSchemaSelfTest } from '../store';

export interface ArchitectureAuditResult {
  ok: boolean;
  checks: Record<string, boolean>;
  failures: string[];
}

export function runStaticArchitectureAudit(): ArchitectureAuditResult {
  const cheese = CANONICAL_TEAMS.find(team => team.id === 'complete-endless-spliced-5850-cheese');
  const cheeseMembers = cheese?.members || [];
  const cheeseNames = cheeseMembers.map(member => member.starter);
  const cheeseExpected = ['Eternatus', 'Drifloon', 'Scatterbug', 'Skitty', 'Burmy', 'Nincada'];
  const cheeseCost = cheeseMembers.reduce((sum, member) => sum + (typeof member.cost === 'number' ? member.cost : 0), 0);
  const cheeseLuck = cheeseMembers.reduce((sum, member) => sum + (typeof member.luck === 'number' ? member.luck : 0), 0);

  const exactTeamMembersResolve = CANONICAL_TEAMS
    .filter(team => team.exactRoster)
    .flatMap(team => team.members || [])
    .every(member => STARTER_BY_NAME.has(member.starter));

  const checks: Record<string, boolean> = {
    starterRootCount572: STARTER_ROOTS.length === 572,
    canonicalTeamMembersResolve: exactTeamMembersResolve,
    cheeseRosterCorrect: JSON.stringify(cheeseNames) === JSON.stringify(cheeseExpected),
    cheeseCostCorrect: cheeseCost === 12.75,
    cheeseLuckCorrect: cheeseLuck === 13,
    fusionSourcePresent: CANONICAL_FUSIONS.length === 7,
    assetResolver: runAssetResolverStaticSelfTest(),
    storageSchema: runStorageSchemaSelfTest(),
  };

  const failures = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return { ok: failures.length === 0, checks, failures };
}
