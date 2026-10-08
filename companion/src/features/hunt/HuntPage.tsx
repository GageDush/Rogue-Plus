import { ChevronRight } from 'lucide-react';
import type { PokeRogueData } from '../../domain/facade';
import { PokemonSprite } from '../../ui/components/PokemonSprite';
import { EmptyInline, Kpi } from '../../ui/components/AppWidgets';

export function HuntPage({ data, onPokemon }: { data: PokeRogueData | null; onPokemon: (id: number) => void }) {
  if (!data) return <EmptyInline />;
  const account = data.account;
  return (
    <>
      <div className='feature-intro'><span className='feature-kicker'>CURRENT COLLECTION PRIORITIES</span><p>These rankings use fixed collection rules and bundled strategy presets. Build-aware priorities and custom goals are planned.</p></div>
      <div className='hero-grid compact'>
        <Kpi label='Missing Passives' value={String(account.passivesTotal - account.passivesUnlocked)} note='ACCOUNT-WIDE' tone='gold' />
        <Kpi label='Egg Moves Left' value={String(account.eggMovesTotal - account.eggMovesUnlocked)} note='COLLECTION' tone='blue' />
        <Kpi label='Perfect IV Left' value={String(account.startersTotal - account.perfectIvStarters)} note='STARTERS' tone='green' />
        <Kpi label='Cost Not Maxed' value={String(account.startersTotal - account.fullCostReductions)} note='STARTERS' tone='orange' />
      </div>
      <section className='section'><h2>Ranked next targets</h2>
        <div className='hunt-list'>
          {data.priorities.slice(0,80).map((pokemon,index) => (
            <button key={pokemon.id} className='hunt-row' onClick={() => onPokemon(pokemon.id)}>
              <span className='rank'>{index+1}</span>
              <PokemonSprite pokemon={pokemon} size={46} />
              <div><strong>{pokemon.name}</strong><span>{pokemon.nextAction}</span><small>{pokemon.progressGaps}</small></div>
              <div className='hunt-score'><strong>{pokemon.priorityScore}</strong><span>score</span></div>
              <ChevronRight />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

