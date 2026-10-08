export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

// Independent UI preference; never part of account envelopes/backups/reset.
// Keep the early index.html bootstrap key and normalization in sync.
export const THEME_KEY = 'rogue-plus-appearance-v1';
export const THEME_QUERY = '(prefers-color-scheme: dark)';
export function normalizePreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}
export function resolveTheme(preference: ThemePreference, systemDark: boolean): Theme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}
let preference: ThemePreference = 'system';
let media: MediaQueryList | undefined;
let started = false;
const listeners = new Set<() => void>();
function readPreference(): ThemePreference {
  try { return normalizePreference(window.localStorage.getItem(THEME_KEY)); }
  catch { return 'system'; }
}
function applyTheme() {
  const theme = resolveTheme(preference, media?.matches ?? false);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#090D12' : '#FBF8F2');
  listeners.forEach(listener => listener());
}
export function startAppearance() {
  if (started) return;
  started = true;
  preference = readPreference();
  media = window.matchMedia(THEME_QUERY);
  if (media.addEventListener) media.addEventListener('change', applyTheme);
  else media.addListener(applyTheme);
  window.addEventListener('storage', event => {
    try {
      if ((event.key === THEME_KEY || event.key === null) && event.storageArea === window.localStorage) {
        preference = readPreference();
        applyTheme();
      }
    } catch { /* Access may have been revoked after startup. */ }
  });
  applyTheme();
}
export function setThemePreference(next: ThemePreference) {
  preference = normalizePreference(next);
  try { window.localStorage.setItem(THEME_KEY, preference); }
  catch { /* Restricted storage: still switch for this session. */ }
  applyTheme();
}
export const getThemePreference = () => preference;
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
