import type { CanonicalTeam, CanonicalTeamMember } from '../domain/teams';
import type { CanonicalFusionRecipe } from '../domain/fusions';

export function teamShortName(team: CanonicalTeam): string {
  switch (team.id) {
    case 'initial-endless-spliced-fusion-utility': return 'Fusion Utility';
    case 'complete-endless-spliced-5850-cheese': return '5850 Cheese';
    case 'high-luck-skill-link-grip-claw': return 'Skill Link Farm';
    case 'regular-endless-blueprint': return 'Regular Endless';
    default: return team.name.split('—').pop()?.trim() || team.name;
  }
}

export function teamModeLabel(team: CanonicalTeam): string {
  return team.mode.replace(/_/g, ' ');
}

export function teamSummary(team: CanonicalTeam): string {
  if (team.purpose?.length) return team.purpose.join(' • ');
  if (team.runArchitecture) {
    return [team.runArchitecture.early, team.runArchitecture.midgame, team.runArchitecture.late]
      .filter((value): value is string => Boolean(value))
      .join(' → ');
  }
  if (team.architecture?.length) return team.architecture.join(' → ');
  if (team.recordedFusionDirections?.length) {
    return 'Recorded six-starter utility roster with ' + String(team.recordedFusionDirections.length) + ' source-backed fusion directions.';
  }
  return 'Versioned strategy source.';
}

export function teamCostText(team: CanonicalTeam): string {
  if (typeof team.recordedTotalCost !== 'number') return '—';
  return String(team.recordedTotalCost);
}

export function teamLuckText(team: CanonicalTeam): string {
  if (typeof team.recordedLuck === 'number') return String(team.recordedLuck);
  if (typeof team.targetLuck === 'number') return String(team.targetLuck) + ' target';
  return '—';
}

export function shinyTierNumber(tier?: string | null): 0 | 1 | 2 | 3 {
  if (tier === 'T1') return 1;
  if (tier === 'T2') return 2;
  if (tier === 'T3') return 3;
  return 0;
}

export function memberAssetFormKey(member: CanonicalTeamMember): string | undefined {
  if (!member.form) return undefined;
  const normalized = member.form.toLowerCase().trim();
  if (normalized === 'trash cloak') return 'trash';
  if (normalized === 'sandy cloak') return 'sandy';
  if (normalized === 'plant cloak') return 'plant';
  return undefined;
}

export function memberMeta(member: CanonicalTeamMember): string {
  const parts: string[] = [];
  if (typeof member.cost === 'number') parts.push(String(member.cost) + ' pts');
  if (typeof member.luck === 'number') parts.push('Luck ' + String(member.luck));
  if (member.shinyTier) parts.push(member.shinyTier);
  return parts.length ? parts.join(' • ') : 'Source roster member';
}

export function memberConfig(member: CanonicalTeamMember): string {
  return [
    member.gender,
    member.form,
    member.ability,
    member.passive,
    member.tera || member.recordedTera,
  ].filter((value): value is string => Boolean(value)).join(' • ') || 'No additional account-side configuration recorded';
}

export function memberMoves(member: CanonicalTeamMember): string[] {
  if (member.startingMoveIdea?.length) return member.startingMoveIdea;
  if (member.moveConcept?.length) return member.moveConcept;
  if (member.keyMove) return [member.keyMove];
  return [];
}

export function memberRunNotes(member: CanonicalTeamMember): string[] {
  return [member.fusion, member.inRunTarget, member.instruction]
    .filter((value): value is string => Boolean(value));
}

export function fusionShortName(recipe: CanonicalFusionRecipe): string {
  switch (recipe.id) {
    case 'calyrex-spectrier': return 'Calyrex/Spectrier';
    case 'deino-smeargle-temp': return 'Dark Void';
    case 'hydreigon-raticate': return 'Run Away';
    case 'burmy-nacl-line': return 'Sturdy/Salt';
    case 'drifloon-nincada': return 'Wonder Guard';
    case 'scatterbug-skitty': return 'Normalize';
    case 'ambipom-toucannon': return 'Skill Link';
    default: return recipe.purpose;
  }
}
