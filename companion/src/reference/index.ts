import starterRootsJson from './generated/starter-roots.v1.json';
import mechanicsJson from './mechanics.v1.json';

export interface StarterReference {
  id: number;
  name: string;
  starterCost: number;
}

interface StarterRootFile {
  referenceVersion: string;
  starters: StarterReference[];
}

export const STARTER_REFERENCE = starterRootsJson as StarterRootFile;
export const STARTER_ROOTS = STARTER_REFERENCE.starters;
export const REFERENCE_VERSION = STARTER_REFERENCE.referenceVersion;
export const STARTER_BY_ID = new Map(STARTER_ROOTS.map(starter => [starter.id, starter]));
export const STARTER_BY_NAME = new Map(STARTER_ROOTS.map(starter => [starter.name, starter]));
export const MECHANICS = mechanicsJson;
