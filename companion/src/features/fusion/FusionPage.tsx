import { useState } from 'react';
import { Info } from 'lucide-react';
import type { PokeRogueData } from '../../domain/facade';
import type { PokemonRecord } from '../../domain/types';
import { getFusionParticipant } from '../../domain/fusions';
import { PokemonSprite } from '../../ui/components/PokemonSprite';
import { EmptyInline } from '../../ui/components/AppWidgets';
import { fusionShortName } from '../../ui/view-models';

export function FusionPage({ data }: { data: PokeRogueData | null }) {
  const [index,setIndex] = useState(0);
  if (!data) return <EmptyInline />;
  const recipe = data.fusions[index] || data.fusions[0];
  const first = getFusionParticipant(recipe.first);
  const second = getFusionParticipant(recipe.second);
  const firstSource = data.pokemonByName.get(first.starterName);
  const secondSource = data.pokemonByName.get(second.starterName);

  return (
    <>
      <div className='team-tabs'>
        {data.fusions.map((candidate,i) => <button key={candidate.id} className={i===index?'active':''} onClick={() => setIndex(i)}>{fusionShortName(candidate)}</button>)}
      </div>
      <section className='fusion-stage'>
        <FusionHalf label='FIRST HALF' participant={first} source={firstSource} />
        <div className='fusion-plus'>+</div>
        <FusionHalf label='SECOND HALF' participant={second} source={secondSource} />
      </section>
      <section className='fusion-result'>
        <div className='eyebrow'>RECORDED STRATEGY RECIPE</div>
        <h2>{recipe.first} + {recipe.second}</h2>
        <p>{recipe.purpose}</p>
        <div className='tag-row'>
          <span>{recipe.confidence}</span>
          {(recipe.support || []).map(item => <span key={item}>{item}</span>)}
        </div>
      </section>
      <section className='section'><h2>Source notes</h2>
        <div className='steps'>
          <div><span>1</span><p>FIRST: {recipe.first}</p></div>
          <div><span>2</span><p>SECOND: {recipe.second}</p></div>
          <div><span>3</span><p>Purpose: {recipe.purpose}</p></div>
          {recipe.support?.map((item,i) => <div key={item}><span>{i+4}</span><p>{item}</p></div>)}
        </div>
      </section>
      {data.fusionInheritanceNeedsRecheck && (
        <section className='privacy-note'><Info /><p>Exact fusion inheritance is version-sensitive. Recheck current game behavior before a destructive in-run splice.</p></section>
      )}
    </>
  );
}

function FusionHalf({
  label,
  participant,
  source,
}: {
  label: string;
  participant: ReturnType<typeof getFusionParticipant>;
  source?: PokemonRecord;
}) {
  const tier = source?.visual.shinyTier ?? 0;
  return (
    <div className='fusion-half'>
      <div className='eyebrow'>{label}</div>
      {participant.displayId ? <PokemonSprite request={{ id:participant.displayId, name:participant.label, shinyTier:tier }} size={90} /> : null}
      <h3>{participant.label}</h3>
      <p>{participant.starterName === participant.label ? 'Starter source' : 'Source starter: ' + participant.starterName}</p>
      <span className={source?.unlocked ? 'status complete' : 'status missing'}>{source?.unlocked ? 'SOURCE OWNED' : 'SOURCE MISSING'}</span>
    </div>
  );
}

