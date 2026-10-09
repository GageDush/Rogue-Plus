/** Canonical user-facing navigation; route labels and availability are not hand-authored in screens. */
export type Page =
  | 'home' | 'dex' | 'detail' | 'build' | 'run' | 'goals'
  | 'fusion' | 'trainer' | 'changes' | 'modules' | 'more' | 'settings';

export type DexFilter = 'all' | 'missing' | 't3' | 'passive' | 'team' | 'iv';
export type NavIconId = 'home' | 'dex' | 'build' | 'run' | 'goals'
  | 'fusion' | 'trainer' | 'history' | 'modules' | 'more' | 'settings';
export type FeatureStatus = 'available' | 'preview' | 'planned';
export interface NavigationItem {
  id: Page;
  label: string;
  title: string;
  icon: NavIconId;
  group: 'primary' | 'secondary';
  status: FeatureStatus;
  description: string;
}

export const navigation: readonly NavigationItem[] = [
  { id: 'home', label: 'Home', title: 'Profile overview', icon: 'home', group: 'primary', status: 'available', description: 'Collection overview and recent changes' },
  { id: 'dex', label: 'Dex', title: 'Pokédex', icon: 'dex', group: 'primary', status: 'available', description: 'Starter collection and ownership details' },
  { id: 'build', label: 'Build', title: 'Build Library', icon: 'build', group: 'primary', status: 'preview', description: 'View strategy presets; editor coming later' },
  { id: 'run', label: 'Run', title: 'Runs', icon: 'run', group: 'primary', status: 'planned', description: 'Session import and tracking planned' },
  { id: 'goals', label: 'Goals', title: 'Collection Goals', icon: 'goals', group: 'primary', status: 'preview', description: 'Collection priorities; Build-aware goals planned' },
  { id: 'trainer', label: 'Trainer', title: 'Trainer', icon: 'trainer', group: 'secondary', status: 'available', description: 'Career stats, vouchers and completion' },
  { id: 'changes', label: 'History', title: 'Change History', icon: 'history', group: 'secondary', status: 'available', description: 'Imported progress and snapshot history' },
  { id: 'fusion', label: 'Fusion', title: 'Fusion Lab', icon: 'fusion', group: 'secondary', status: 'preview', description: 'Bundled versioned fusion recipes; editor planned' },
  { id: 'modules', label: 'Modules', title: 'Modules', icon: 'modules', group: 'secondary', status: 'planned', description: 'Optional modules and their compatibility status' },
  { id: 'settings', label: 'Import / Settings', title: 'Import / Settings', icon: 'settings', group: 'secondary', status: 'available', description: 'Local account import, backup and storage' },
] as const;

export const primaryNavigation = navigation.filter(item => item.group === 'primary');
export const secondaryNavigation = navigation.filter(item => item.group === 'secondary');
export const pageTitles: Record<Page, string> = {
  ...Object.fromEntries(navigation.map(item => [item.id, item.title])),
  detail: 'Pokémon Detail',
  more: 'More',
} as Record<Page, string>;
export function isNavigationActive(route: Page, item: Page): boolean {
  return route === item || (route === 'detail' && item === 'dex');
}

