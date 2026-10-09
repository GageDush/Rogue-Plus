import { useEffect, useMemo, useState } from 'react';
import {
  assetRequestFromPokemon,
  POKEROGUE_ASSET_REVISION,
  resolvePokemonAsset,
  type PokemonAssetRequest,
  type ResolvedPokemonAsset,
} from '../../domain/assets';
import type { PokemonRecord } from '../../domain/types';
import { loadPokemonArtwork } from '../artwork';

type SpritePokemon = Pick<PokemonRecord, 'id' | 'name' | 'visual'>;

interface PokemonSpriteProps {
  pokemon?: SpritePokemon;
  request?: PokemonAssetRequest;
  size?: number;
  className?: string;
  title?: string;
}

export function PokemonSprite({
  pokemon,
  request,
  size = 48,
  className = '',
  title,
}: PokemonSpriteProps) {
  const effectiveRequest = useMemo<PokemonAssetRequest | null>(() => {
    if (request) return request;
    if (pokemon) return assetRequestFromPokemon(pokemon);
    return null;
  }, [pokemon, request]);

  const [asset, setAsset] = useState<ResolvedPokemonAsset | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAsset(null);
    setFailed(false);
    if (!effectiveRequest) {
      setFailed(true);
      return () => { cancelled = true; };
    }
    resolvePokemonAsset(effectiveRequest)
      .then(async resolved => {
        await loadPokemonArtwork(resolved);
        if (!cancelled) setAsset(resolved);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => { cancelled = true; };
  }, [effectiveRequest]);

  const label = title || pokemon?.name || effectiveRequest?.name || (effectiveRequest ? 'Pokémon #' + String(effectiveRequest.id) : 'Pokémon');

  if (!asset) {
    return (
      <span
        className={'pokemon-sprite-component ' + className}
        role='img'
        aria-label={failed ? label + ' icon unavailable' : label + ' icon loading'}
        title={label}
        style={{
          width: size,
          height: size,
          display: 'inline-grid',
          placeItems: 'center',
          color: 'var(--muted)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: Math.max(7, Math.round(size * 0.16)),
          lineHeight: 1,
          overflow: 'hidden',
        }}
      >
        {failed ? '#' + String(effectiveRequest?.id ?? '?') : '·'}
      </span>
    );
  }

  const scale = size / Math.max(asset.sourceWidth, asset.sourceHeight);
  const logicalWidth = asset.sourceWidth * scale;
  const logicalHeight = asset.sourceHeight * scale;

  return (
    <span
      className={'pokemon-sprite-component ' + className}
      role='img'
      aria-label={label}
      title={label}
      data-asset-revision={POKEROGUE_ASSET_REVISION}
      data-atlas-key={asset.atlasKey}
      data-shiny-tier={asset.shinyTier}
      data-fallback-from-tier={asset.fallbackFromTier ?? undefined}
      style={{
        width: size,
        height: size,
        display: 'inline-grid',
        placeItems: 'center',
        overflow: 'hidden',
        flex: '0 0 auto',
      }}
    >
      <span
        aria-hidden='true'
        style={{
          position: 'relative',
          width: logicalWidth,
          height: logicalHeight,
          display: 'block',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: asset.sourceX * scale,
            top: asset.sourceY * scale,
            width: asset.frameWidth * scale,
            height: asset.frameHeight * scale,
            backgroundImage: 'url("' + asset.atlasImageUrl + '")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: (asset.atlasWidth * scale) + 'px ' + (asset.atlasHeight * scale) + 'px',
            backgroundPosition: (-asset.frameX * scale) + 'px ' + (-asset.frameY * scale) + 'px',
            imageRendering: 'pixelated',
          }}
        />
      </span>
    </span>
  );
}
