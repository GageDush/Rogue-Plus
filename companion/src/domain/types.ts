export type ChangeImportance = 'Info' | 'Improvement' | 'Complete' | 'Major' | 'Team';

export interface PokemonSourceFields {
  seenAttr: string;
  caughtAttr: string;
  natureAttr: string;
  eggMoveMask: number;
  abilityMask: number;
  passiveMask: number;
}

export interface PokemonVisualIdentity {
  shinyTier: 0 | 1 | 2 | 3;
  shinyCaught: boolean;
  maleCaught: boolean;
  femaleCaught: boolean;
  defaultVariantCaught: boolean;
  variant2Caught: boolean;
  variant3Caught: boolean;
  defaultFormCaught: boolean;
}

export interface PokemonRecord {
  id: number;
  name: string;
  baseCost: number;
  currentCost: number;
  unlocked: boolean;
  candy: number;
  friendship: number;
  luck: number;
  shiny: boolean;
  t1: boolean;
  t2: boolean;
  t3: boolean;
  passiveUnlocked: boolean;
  passiveEnabled: boolean;
  a1Unlocked: boolean;
  a2Unlocked: boolean;
  haUnlocked: boolean;
  egg1: boolean;
  egg2: boolean;
  egg3: boolean;
  egg4: boolean;
  eggCount: number;
  ivHp: number;
  ivAtk: number;
  ivDef: number;
  ivSpa: number;
  ivSpd: number;
  ivSpe: number;
  perfectIvs: number;
  natureCount: number;
  costReductions: number;
  classicWins: number;
  seen: number;
  caught: number;
  hatched: number;
  nextAction: string;
  nextCost: number | null;
  affordable: boolean;
  priorityScore: number;
  progressGaps: string;
  collectionGaps: string;
  source: PokemonSourceFields;
  visual: PokemonVisualIdentity;
}

export interface AccountMetrics {
  startersUnlocked: number;
  startersTotal: number;
  passivesUnlocked: number;
  passivesTotal: number;
  eggMovesUnlocked: number;
  eggMovesTotal: number;
  perfectIvStarters: number;
  shinyStarters: number;
  t2Shiny: number;
  t3Shiny: number;
  allShinyTiers: number;
  fullCostReductions: number;
  noCostReductions: number;
  classicWinners: number;
  natureUnlocks: number;
  allNatures: number;
  achievements: number;
  achievementsTotal: number;
  voucherUnlocks: number;
  vouchers: { regular: number; plus: number; premium: number; golden: number };
  stats: Record<string, number>;
}

export interface ChangeRecord {
  timestamp: string;
  importId: string;
  pokemon: string;
  pokemonId: number;
  category: string;
  before: string;
  after: string;
  importance: ChangeImportance;
  teamImpact: string;
  sourceFile: string;
}

export interface Snapshot {
  schemaVersion?: number;
  referenceVersion?: string;
  legacy?: boolean;
  id: string;
  importId: string;
  sourceFile: string;
  saveTimestamp: string;
  gameVersion: string;
  pokemon: PokemonRecord[];
  account: AccountMetrics;
  latestChanges: ChangeRecord[];
  importWarnings?: string[];
  demo?: boolean;
}

export interface AppState {
  current: Snapshot | null;
  snapshots: Snapshot[];
  history: ChangeRecord[];
}

export interface TeamMemberReadiness {
  starter: string;
  starterId: number | null;
  unlocked: boolean;
  shinyTierTarget: string | null;
  shinyTierMet: boolean | null;
  accountChecks: string[];
  unverifiedInRunRequirements: string[];
  status: 'missing' | 'available' | 'partial';
}

export interface TeamReadiness {
  teamId: string;
  teamName: string;
  members: TeamMemberReadiness[];
  startersAvailable: number;
  starterCount: number;
  verifiableTargetsMet: number;
  verifiableTargetCount: number;
}
