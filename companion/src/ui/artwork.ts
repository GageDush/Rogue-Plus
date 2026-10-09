import type { ResolvedPokemonAsset } from '../domain/assets';

const images = new Map<string, Promise<{ width: number; height: number }>>();

/** Decode before presenting CSS atlas artwork as loaded. Failed requests can retry on remount. */
export async function loadPokemonArtwork(asset: ResolvedPokemonAsset): Promise<void> {
  let pending = images.get(asset.atlasImageUrl);
  if (!pending) {
    const image = new Image();
    image.src = asset.atlasImageUrl;
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Icon image request timed out.')), 15000);
    });
    pending = Promise.race([image.decode(), timeout])
      .then(() => ({ width: image.naturalWidth, height: image.naturalHeight }))
      .catch(error => { images.delete(asset.atlasImageUrl); throw error; })
      .finally(() => clearTimeout(timer));
    images.set(asset.atlasImageUrl, pending);
  }
  const size = await pending;
  if (size.width !== asset.atlasWidth || size.height !== asset.atlasHeight) {
    images.delete(asset.atlasImageUrl);
    throw new Error('Icon image dimensions differ from pinned atlas metadata.');
  }
}
