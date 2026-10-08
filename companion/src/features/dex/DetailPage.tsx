import { Swords } from 'lucide-react';
import type { PokeRogueData } from '../../domain/facade';
import type { PokemonRecord } from '../../domain/types';
import { PokemonSprite } from '../../ui/components/PokemonSprite';
import { CollectionProgress, DataLine, EmptyInline, SectionHeading } from '../../ui/components/AppWidgets';
import { shinyLabel, teamShortName } from '../../ui/view-models';

export function DetailPage({ pokemon, data, onTeam }: { pokemon: PokemonRecord | null; data: PokeRogueData | null; onTeam: () => void }) {
  if (!pokemon || !data) return <EmptyInline />;
  const used = data.teams.filter(team => (team.members || []).some(member => member.starter === pokemon.name));
  const ivs = [['HP',pokemon.ivHp],['Atk',pokemon.ivAtk],['Def',pokemon.ivDef],['SpA',pokemon.ivSpa],['SpD',pokemon.ivSpd],['Spe',pokemon.ivSpe]] as const;

  return (
    <>
      <section className='pokemon-hero'>
        <div className='hero-sprite'>
          <PokemonSprite pokemon={pokemon} size={106} />
          {pokemon.t3 && <span className='big-shiny red-shiny-star'>★ Red shiny • Luck 3</span>}
        </div>
        <div className='hero-copy'>
          <div className='eyebrow'>STARTER #{pokemon.id}</div>
          <h2>{pokemon.name}</h2>
          <div className='tag-row'><span>Cost {pokemon.currentCost}</span><span>{pokemon.candy} Candy</span><span>{pokemon.classicWins} Classic wins</span></div>
        </div>
      </section>

      <section className='section'><h2>Account completion</h2>
        <div className='readiness-grid'>
          <CollectionProgress label='Perfect IVs' value={pokemon.perfectIvs} total={6} tone='green' />
          <CollectionProgress label='Egg moves' value={pokemon.eggCount} total={4} tone='green' />
          <CollectionProgress label='Natures' value={pokemon.natureCount} total={25} tone='green' />
          <CollectionProgress label='Cost reductions' value={pokemon.costReductions} total={2} tone='green' />
          <Readiness label='Passive' value={pokemon.passiveUnlocked ? 'Unlocked' : 'Missing'} complete={pokemon.passiveUnlocked} />
          <Readiness label='Hidden ability' value={pokemon.haUnlocked ? 'Unlocked' : 'Missing'} complete={pokemon.haUnlocked} />
        </div>
      </section>

      <section className='section'><h2>IVs</h2>
        <div className='iv-grid'>{ivs.map(([label,value]) => <div key={label}><span>{label}</span><strong className={value === 31 ? 'perfect' : ''}>{value}</strong></div>)}</div>
      </section>

      <section className='section'><h2>Collection</h2>
        <div className='collection-grid'>
          <DataLine label='Starter unlocked' value={pokemon.unlocked ? 'Yes' : 'No'} />
          <DataLine label='Shiny tiers' value={[pokemon.t1?'Yellow':'',pokemon.t2?'Blue':'',pokemon.t3?'Red':''].filter(Boolean).join(' • ') || 'None'} />
          <DataLine label='Seen / caught / hatched' value={pokemon.seen + ' / ' + pokemon.caught + ' / ' + pokemon.hatched} />
          <DataLine label='Progress gaps' value={pokemon.progressGaps} />
          <DataLine label='Collection gaps' value={shinyLabel(pokemon.collectionGaps)} />
          <DataLine label='Priority' value={pokemon.priorityScore + ' • ' + pokemon.nextAction} />
        </div>
      </section>

      {used.length > 0 && (
        <section className='section'>
          <SectionHeading title='Saved strategies' action='Open Build' onClick={onTeam} />
          <div className='team-usage'>
            {used.map(team => {
              const member = (team.members || []).find(candidate => candidate.starter === pokemon.name);
              return <div key={team.id}><Swords /><span><strong>{teamShortName(team)}</strong><small>{member?.role || 'Roster member'}</small></span></div>;
            })}
          </div>
        </section>
      )}
    </>
  );
}

function Readiness({ label, value, complete }: { label: string; value: string; complete: boolean }) {
  return <div className='readiness-card'><span>{label}</span><strong className={complete ? 'good' : 'warn'}>{value}</strong></div>;
}


