import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

let stored: string | null;
let denied: boolean;
let media: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; addListener: ReturnType<typeof vi.fn> };
let root: { dataset: Record<string, string>; style: Record<string, string> };
let meta: ReturnType<typeof vi.fn>;
let storageEvent: (event: unknown) => void;
let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> };
beforeEach(() => {
  vi.resetModules(); stored = null; denied = false;
  media = { matches: false, addEventListener: vi.fn(), addListener: vi.fn() };
  root = { dataset: {}, style: {} }; meta = vi.fn();
  storage = { getItem: vi.fn(() => { if (denied) throw new Error('blocked'); return stored; }), setItem: vi.fn((_key, value) => { if (denied) throw new Error('blocked'); stored = value; }) };
  vi.stubGlobal('window', { localStorage: storage, matchMedia: () => media, addEventListener: (_: string, callback: typeof storageEvent) => { storageEvent = callback; } });
  vi.stubGlobal('document', { documentElement: root, querySelector: () => ({ setAttribute: meta }) });
});
async function start() { const theme = await import('../src/ui/theme'); theme.startAppearance(); return theme; }

describe('Independent appearance lifecycle', () => {
  it('follows live system changes and updates browser chrome', async () => {
    await start(); expect(root.dataset.theme).toBe('light');
    media.matches = true; media.addEventListener.mock.calls[0][1]();
    expect(root.dataset.theme).toBe('dark'); expect(meta).toHaveBeenLastCalledWith('content', '#090D12');
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('explicit preference wins over system and survives restart', async () => {
    stored = 'light'; media.matches = true;
    const theme = await start(); expect(root.dataset.theme).toBe('light');
    theme.setThemePreference('dark'); expect(stored).toBe('dark');
    media.matches = false; media.addEventListener.mock.calls[0][1]();
    expect(root.dataset.theme).toBe('dark');
    vi.resetModules(); await start(); expect(root.dataset.theme).toBe('dark');
    expect(storage.setItem).toHaveBeenCalledWith('rogue-plus-appearance-v1', 'dark');
  });
  it('invalid values default to system and storage denial still permits session switching', async () => {
    stored = 'unsupported'; media.matches = true; const theme = await start();
    expect(theme.getThemePreference()).toBe('system'); expect(root.dataset.theme).toBe('dark');
    denied = true; expect(() => theme.setThemePreference('light')).not.toThrow(); expect(root.dataset.theme).toBe('light');
  });
  it('denied reads do not block startup', async () => {
    denied = true; media.matches = true; await start(); expect(root.dataset.theme).toBe('dark');
  });
  it('syncs appearance changes from another tab, ignoring account writes', async () => {
    const theme = await start(); stored = 'dark';
    storageEvent({ key: 'app-state-v2', storageArea: storage }); expect(root.dataset.theme).toBe('light');
    storageEvent({ key: theme.THEME_KEY, storageArea: storage }); expect(root.dataset.theme).toBe('dark');
    stored = null; storageEvent({ key: null, storageArea: storage }); expect(root.dataset.theme).toBe('light');
  });
  it('registers once and supports legacy Safari listeners', async () => {
    delete (media as Partial<typeof media>).addEventListener;
    const theme = await start(); theme.startAppearance(); expect(media.addListener).toHaveBeenCalledTimes(1);
    const notify = vi.fn(); const unsubscribe = theme.subscribeTheme(notify);
    theme.setThemePreference('dark'); expect(notify).toHaveBeenCalledTimes(1);
    unsubscribe(); theme.setThemePreference('light'); expect(notify).toHaveBeenCalledTimes(1);
  });
  it.each(['light', 'dark', null, 'invalid'])('early bootstrap agrees with runtime for %s', async value => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];
    stored = value; media.matches = true;
    runInNewContext(script, { localStorage: storage, matchMedia: () => media, document });
    const early = root.dataset.theme; await start(); expect(root.dataset.theme).toBe(early);
  });
});
