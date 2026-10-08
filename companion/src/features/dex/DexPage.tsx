import { ChevronRight, Search, X } from 'lucide-react';
import type { DexFilter } from '../../app/navigation';
import type { PokemonRecord } from '../../domain/types';
import { PokemonSprite } from '../../ui/components/PokemonSprite';

export function DexPage({
  pokemon,
  total,
  search,
  setSearch,
  filter,
  setFilter,
  onPokemon,
  onMore,
}: {
  pokemon: PokemonRecord[];
  total: number;
  search: string;
  setSearch: (value: string) => void;
  filter: DexFilter;
  setFilter: (value: DexFilter) => void;
  onPokemon: (id: number) => void;
  onMore: () => void;
}) {
  return (
    <>
      <div className='search-box'>
        <Search />
        <input aria-label='Search Pokémon or collection gaps' value={search} onChange={event => setSearch(event.target.value)} placeholder='Search Pokémon or gaps…' />
        {search && <button aria-label='Clear search' onClick={() => setSearch('')}><X /></button>}
      </div>
      <div className='filter-row'>
        {([['all','All'],['missing','Missing'],['t3','T3'],['passive','Passive'],['team','Team'],['iv','IVs']] as Array<[DexFilter,string]>).map(([id,label]) => (
          <button key={id} aria-pressed={filter === id} className={filter === id ? 'filter active' : 'filter'} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>
      <div className='result-meta'><span>{total} starters</span><span>Tap a row for full detail</span></div>
      <div className='dex-grid'>{pokemon.map(entry => <PokemonCard key={entry.id} pokemon={entry} onClick={() => onPokemon(entry.id)} />)}</div>
      {pokemon.length < total && <button className='secondary load-more' onClick={onMore}>Show more</button>}
      {!total && <div className='empty-panel'><Search /><div><strong>No matches</strong><span>Try another search or filter.</span></div></div>}
    </>
  );
}

function PokemonCard({ pokemon, onClick }: { pokemon: PokemonRecord; onClick: () => void }) {
  return (
    <button className='pokemon-card' onClick={onClick}>
      <div className='sprite-wrap'>
        <PokemonSprite pokemon={pokemon} size={57} />
        {pokemon.t3 && <span className='t3-badge'>T3</span>}
      </div>
      <div className='pokemon-main'>
        <strong>{pokemon.name}</strong>
        <span>IV {pokemon.perfectIvs}/6 • Egg {pokemon.eggCount}/4 • Luck {pokemon.luck}</span>
        <small>{pokemon.progressGaps === 'None' ? 'Core progress complete' : pokemon.progressGaps}</small>
      </div>
      <div className='pokemon-status'>
        <span className={pokemon.passiveUnlocked ? 'status complete' : 'status missing'}>{pokemon.passiveUnlocked ? 'Passive unlocked' : 'Passive missing'}</span>
        <span className={pokemon.t3 ? 'status t3' : 'status subtle'}>{pokemon.t3 ? 'T3 shiny' : 'No T3 shiny'}</span>
      </div>
      <ChevronRight />
    </button>
  );
}


