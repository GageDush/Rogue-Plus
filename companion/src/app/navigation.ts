export type Page =
  | 'home'
  | 'dex'
  | 'detail'
  | 'teams'
  | 'hunt'
  | 'fusion'
  | 'trainer'
  | 'changes'
  | 'more'
  | 'settings';

export type DexFilter = 'all' | 'missing' | 't3' | 'passive' | 'team' | 'iv';

export const pageTitles: Record<Page, string> = {
  home: 'Command Center',
  dex: 'Pokédex',
  detail: 'Pokémon Detail',
  teams: 'Party Builder',
  hunt: 'Hunt / Priorities',
  fusion: 'Fusion Lab',
  trainer: 'Trainer',
  changes: 'Change Log',
  more: 'More',
  settings: 'Import / Settings',
};
