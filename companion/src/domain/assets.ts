import assetReferenceJson from '../reference/assets.v1.json';
import type { PokemonRecord } from './types';

type ShinyTier = 0 | 1 | 2 | 3;

interface AtlasFrameJson {
  filename: string;
  rotated: boolean;
  trimmed: boolean;
  sourceSize: { w: number; h: number };
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  frame: { x: number; y: number; w: number; h: number };
}

interface AtlasJson {
  textures: Array<{
    image: string;
    size: { w: number; h: number };
    frames: AtlasFrameJson[];
  }>;
}

interface AssetReference {
  assetRevision: string;
  baseUrl: string;
  canonicalStarterFormOverrides: Record<string, string>;
}

export interface PokemonAssetRequest {
  id: number;
  name?: string;
  shinyTier?: ShinyTier;
  formKey?: string | null;
}

export interface PokemonAssetDescriptor {
  id: number;
  generation: number;
  shinyTier: ShinyTier;
  formKey: string | null;
  atlasKey: string;
  frameKey: string;
  atlasJsonUrl: string;
  atlasImageUrl: string;
}

export interface ResolvedPokemonAsset extends PokemonAssetDescriptor {
  atlasWidth: number;
  atlasHeight: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceX: number;
  sourceY: number;
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
  fallbackFromTier: ShinyTier | null;
}

const ASSETS = assetReferenceJson as AssetReference;
const atlasCache = new Map<string, Promise<AtlasJson>>();

export const POKEROGUE_ASSET_REVISION = ASSETS.assetRevision;

export function generationForPokemonId(id: number): number {
  if (id === 2670) return 6;
  if (id >= 8000 && id <= 9999) return 9;
  if (id >= 6000 && id <= 7999) return 8;
  if (id >= 4000 && id <= 5999) return 8;
  if (id >= 2000 && id <= 3999) return 7;
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}

export function canonicalStarterFormKey(id: number): string | null {
  return ASSETS.canonicalStarterFormOverrides[String(id)] ?? null;
}

function frameKeyFor(id: number, tier: ShinyTier, formKey: string | null): string {
  const suffix = formKey ? '-' + formKey : '';
  if (tier === 1) return String(id) + 's' + suffix;
  if (tier === 2 || tier === 3) return String(id) + suffix + '_' + String(tier);
  return String(id) + suffix;
}

export function describePokemonAsset(request: PokemonAssetRequest): PokemonAssetDescriptor {
  const generation = generationForPokemonId(request.id);
  const shinyTier = request.shinyTier ?? 0;
  const formKey = request.formKey === undefined ? canonicalStarterFormKey(request.id) : request.formKey;
  const isVariantAtlas = shinyTier >= 2;
  const atlasKey = 'pokemon_icons_' + String(generation) + (isVariantAtlas ? 'v' : '');
  const frameKey = frameKeyFor(request.id, shinyTier, formKey ?? null);
  return {
    id: request.id,
    generation,
    shinyTier,
    formKey: formKey ?? null,
    atlasKey,
    frameKey,
    atlasJsonUrl: ASSETS.baseUrl + '/' + atlasKey + '.json',
    atlasImageUrl: ASSETS.baseUrl + '/' + atlasKey + '.png',
  };
}

function loadAtlas(descriptor: PokemonAssetDescriptor): Promise<AtlasJson> {
  const existing = atlasCache.get(descriptor.atlasKey);
  if (existing) return existing;
  const promise = fetch(descriptor.atlasJsonUrl, { mode: 'cors', cache: 'force-cache', signal: AbortSignal.timeout(15000) })
    .then(response => {
      if (!response.ok) throw new Error('Could not load ' + descriptor.atlasKey + '.');
      return response.json() as Promise<AtlasJson>;
    }).catch(error => {
      // A transient failure must not poison later mounts for this session.
      atlasCache.delete(descriptor.atlasKey);
      throw error;
    });
  atlasCache.set(descriptor.atlasKey, promise);
  return promise;
}

function fallbackTiers(requested: ShinyTier): ShinyTier[] {
  if (requested === 3) return [3, 2, 1, 0];
  if (requested === 2) return [2, 1, 0];
  if (requested === 1) return [1, 0];
  return [0];
}

export async function resolvePokemonAsset(request: PokemonAssetRequest): Promise<ResolvedPokemonAsset> {
  const requestedTier = request.shinyTier ?? 0;
  let lastError: unknown = null;

  for (const tier of fallbackTiers(requestedTier)) {
    const descriptor = describePokemonAsset({ ...request, shinyTier: tier });
    try {
      const atlas = await loadAtlas(descriptor);
      const texture = atlas.textures?.[0];
      if (!texture) throw new Error('Atlas had no texture metadata.');
      const frame = texture.frames.find(candidate => candidate.filename === descriptor.frameKey);
      if (!frame) {
        lastError = new Error('Frame ' + descriptor.frameKey + ' was not found in ' + descriptor.atlasKey + '.');
        continue;
      }
      if (frame.rotated) throw new Error('Rotated icon frames are not supported.');
      const dimensions = [texture.size.w, texture.size.h, frame.sourceSize.w, frame.sourceSize.h, frame.frame.w, frame.frame.h];
      const offsets = [frame.frame.x, frame.frame.y, frame.spriteSourceSize.x, frame.spriteSourceSize.y];
      if (dimensions.some(value => !Number.isInteger(value) || value <= 0)
        || offsets.some(value => !Number.isInteger(value) || value < 0)
        || frame.frame.x + frame.frame.w > texture.size.w
        || frame.frame.y + frame.frame.h > texture.size.h
        || frame.spriteSourceSize.x + frame.frame.w > frame.sourceSize.w
        || frame.spriteSourceSize.y + frame.frame.h > frame.sourceSize.h) {
        throw new Error('Invalid icon frame bounds.');
      }
      return {
        ...descriptor,
        atlasWidth: texture.size.w,
        atlasHeight: texture.size.h,
        sourceWidth: frame.sourceSize.w,
        sourceHeight: frame.sourceSize.h,
        sourceX: frame.spriteSourceSize.x,
        sourceY: frame.spriteSourceSize.y,
        frameX: frame.frame.x,
        frameY: frame.frame.y,
        frameWidth: frame.frame.w,
        frameHeight: frame.frame.h,
        fallbackFromTier: tier === requestedTier ? null : requestedTier,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No icon asset could be resolved for Pokémon #' + String(request.id) + '.');
}

export function assetRequestFromPokemon(pokemon: Pick<PokemonRecord, 'id' | 'name' | 'visual'>): PokemonAssetRequest {
  return {
    id: pokemon.id,
    name: pokemon.name,
    shinyTier: pokemon.visual.shinyTier,
  };
}

export function runAssetResolverStaticSelfTest(): boolean {
  const pikachu = describePokemonAsset({ id: 25, shinyTier: 3 });
  const thundurus = describePokemonAsset({ id: 642, shinyTier: 0 });
  const galarArticuno = describePokemonAsset({ id: 4144, shinyTier: 2 });
  const bloodmoon = describePokemonAsset({ id: 8901, shinyTier: 1 });
  return (
    pikachu.atlasKey === 'pokemon_icons_1v'
    && pikachu.frameKey === '25_3'
    && thundurus.atlasKey === 'pokemon_icons_5'
    && thundurus.frameKey === '642-incarnate'
    && galarArticuno.atlasKey === 'pokemon_icons_8v'
    && galarArticuno.frameKey === '4144_2'
    && bloodmoon.atlasKey === 'pokemon_icons_9'
    && bloodmoon.frameKey === '8901s'
  );
}
