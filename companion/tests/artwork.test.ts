import { afterEach, beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => vi.resetModules());
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const atlas = () => ({ textures: [{ size: { w: 80, h: 60 }, frames: [{ filename: '25', rotated: false, frame: { x: 0, y: 0, w: 40, h: 30 }, sourceSize: { w: 40, h: 30 }, spriteSourceSize: { x: 0, y: 0, w: 40, h: 30 } }] }] });
async function asset() { return (await import('../src/domain/assets')).resolvePokemonAsset({ id: 25 }); }
function fetchAtlas(data = atlas()) { return vi.fn(async () => ({ ok: true, json: async () => data })); }

it('deduplicates concurrent atlas requests and resolves the exact pinned frame', async () => {
  const fetch = fetchAtlas(); vi.stubGlobal('fetch', fetch);
  const [a, b] = await Promise.all([asset(), asset()]);
  expect(fetch).toHaveBeenCalledTimes(1); expect(a).toEqual(b);
  expect(a.atlasJsonUrl).toContain('056a1f408f26a3be4fef243f7462cb43608c7928');
  expect(a.frameKey).toBe('25'); expect(a.fallbackFromTier).toBeNull();
});
it('retries a transient atlas failure on a later request', async () => {
  const fetch = fetchAtlas().mockRejectedValueOnce(new Error('offline')); vi.stubGlobal('fetch', fetch);
  await expect(asset()).rejects.toThrow('offline'); await expect(asset()).resolves.toMatchObject({ frameKey: '25' });
  expect(fetch).toHaveBeenCalledTimes(2);
});
it('rejects missing, rotated and out-of-bounds frames', async () => {
  for (const patch of [{ filename: '999' }, { rotated: true }, { frame: { x: 79, y: 0, w: 40, h: 30 } }]) {
    vi.resetModules(); const data = atlas(); Object.assign(data.textures[0].frames[0], patch);
    vi.stubGlobal('fetch', fetchAtlas(data)); await expect(asset()).rejects.toThrow();
  }
});
it('labels a variant fallback without claiming the requested tier', async () => {
  vi.stubGlobal('fetch', fetchAtlas());
  const resolved = await (await import('../src/domain/assets')).resolvePokemonAsset({ id: 25, shinyTier: 3 });
  expect(resolved.shinyTier).toBe(0); expect(resolved.fallbackFromTier).toBe(3);
});
it('deduplicates image decode, checks real dimensions, and retries failures', async () => {
  vi.stubGlobal('fetch', fetchAtlas()); const resolved = await asset();
  const decode = vi.fn().mockRejectedValueOnce(new Error('PNG unavailable')).mockResolvedValue(undefined);
  vi.stubGlobal('Image', class { src = ''; naturalWidth = 80; naturalHeight = 60; decode = decode; });
  const { loadPokemonArtwork } = await import('../src/ui/artwork');
  await expect(loadPokemonArtwork(resolved)).rejects.toThrow('PNG unavailable');
  await Promise.all([loadPokemonArtwork(resolved), loadPokemonArtwork(resolved)]);
  expect(decode).toHaveBeenCalledTimes(2);
  await expect(loadPokemonArtwork({ ...resolved, atlasWidth: 81 })).rejects.toThrow('dimensions');
});
it('bounds an unresponsive PNG request', async () => {
  vi.stubGlobal('fetch', fetchAtlas()); const resolved = await asset();
  vi.useFakeTimers();
  vi.stubGlobal('Image', class { src = ''; decode() { return new Promise(() => {}); } });
  const { loadPokemonArtwork } = await import('../src/ui/artwork');
  const result = expect(loadPokemonArtwork(resolved)).rejects.toThrow('timed out');
  await vi.advanceTimersByTimeAsync(15000); await result;
});
