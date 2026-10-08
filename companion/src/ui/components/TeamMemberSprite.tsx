import { STARTER_BY_NAME } from '../../reference';
import type { CanonicalTeamMember } from '../../domain/teams';
import type { PokemonRecord } from '../../domain/types';
import { memberAssetFormKey, shinyTierNumber } from '../view-models';
import { PokemonSprite } from './PokemonSprite';

export function TeamMemberSprite({ member, pokemon, size }: { member: CanonicalTeamMember; pokemon?: PokemonRecord; size: number }) {
  const reference = STARTER_BY_NAME.get(member.starter);
  if (!reference) return <span className='pokemon-sprite-component' style={{ width:size,height:size,display:'inline-grid',placeItems:'center' }}>?</span>;
  return (
    <PokemonSprite
      request={{
        id: reference.id,
        name: member.starter,
        shinyTier: pokemon ? pokemon.visual.shinyTier : shinyTierNumber(member.shinyTier),
        formKey: memberAssetFormKey(member),
      }}
      size={size}
    />
  );
}

