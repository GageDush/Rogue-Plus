import fusionsJson from '../presets/fusions.v1.json';
import { STARTER_BY_NAME } from '../reference';

export interface CanonicalFusionRecipe {
  id: string;
  first: string;
  second: string;
  purpose: string;
  confidence: string;
  support?: string[];
}

interface FusionFile {
  schemaVersion: number;
  strategyVersion: string;
  source: string;
  exactInheritanceNeedsLiveRecheck: boolean;
  recipes: CanonicalFusionRecipe[];
}

export interface FusionParticipant {
  label: string;
  displayId: number;
  starterName: string;
  starterId: number | null;
}

export const CANONICAL_FUSION_FILE = fusionsJson as FusionFile;
export const CANONICAL_FUSIONS = CANONICAL_FUSION_FILE.recipes;
export const FUSION_INHERITANCE_NEEDS_RECHECK = CANONICAL_FUSION_FILE.exactInheritanceNeedsLiveRecheck;

const PARTICIPANTS: Record<string, { displayId: number; starterName: string }> = {
  Calyrex: { displayId: 898, starterName: 'Calyrex' },
  Spectrier: { displayId: 897, starterName: 'Spectrier' },
  Deino: { displayId: 633, starterName: 'Deino' },
  Smeargle: { displayId: 235, starterName: 'Smeargle' },
  Hydreigon: { displayId: 635, starterName: 'Deino' },
  Raticate: { displayId: 20, starterName: 'Rattata' },
  Burmy: { displayId: 412, starterName: 'Burmy' },
  'Naclstack/Garganacl': { displayId: 934, starterName: 'Nacli' },
  Drifloon: { displayId: 425, starterName: 'Drifloon' },
  Nincada: { displayId: 290, starterName: 'Nincada' },
  Scatterbug: { displayId: 664, starterName: 'Scatterbug' },
  Skitty: { displayId: 300, starterName: 'Skitty' },
  Ambipom: { displayId: 424, starterName: 'Aipom' },
  Toucannon: { displayId: 733, starterName: 'Pikipek' },
};

export function getFusionParticipant(label: string): FusionParticipant {
  const mapped = PARTICIPANTS[label];
  if (mapped) {
    return {
      label,
      displayId: mapped.displayId,
      starterName: mapped.starterName,
      starterId: STARTER_BY_NAME.get(mapped.starterName)?.id ?? null,
    };
  }
  const starter = STARTER_BY_NAME.get(label);
  return {
    label,
    displayId: starter?.id ?? 0,
    starterName: label,
    starterId: starter?.id ?? null,
  };
}
