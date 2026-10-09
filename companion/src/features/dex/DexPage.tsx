import { useLayoutEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { dexFilters, dexRanges, dexSorts, type DexQuery, type DexCondition, type DexRangeField, type DexSort } from '../../domain/dex-query';
import type { PokemonRecord } from '../../domain/types';
import { PokemonSprite } from '../../ui/components/PokemonSprite';

type RangeDraft = Record<DexRangeField, { min: string; max: string }>;
const rangeFields = Object.keys(dexRanges) as DexRangeField[];

export function DexPage({ pokemon, total, query, setQuery, view, setView, onPokemon, onMore }: {
  pokemon: PokemonRecord[]; total: number; query: DexQuery; setQuery: (query: DexQuery) => void;
  view: 'grid' | 'list'; setView: (view: 'grid' | 'list') => void; onPokemon: (id: number) => void; onMore: () => void;
}) {
  const [panel, setPanel] = useState<'Filters' | 'Sort' | 'Advanced' | null>(null);
  const [draft, setDraft] = useState(query);
  const [ranges, setRanges] = useState<RangeDraft>(() => Object.fromEntries(rangeFields.map(key => [key, { min: '', max: '' }])) as RangeDraft);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLButtonElement | null>(null);
  function open(kind: NonNullable<typeof panel>, trigger: HTMLButtonElement) {
    origin.current = trigger;
    setDraft({ ...query, conditions: [...query.conditions] });
    setRanges(Object.fromEntries(rangeFields.map(key => [key, { min: String(query.ranges[key]?.min ?? ''), max: String(query.ranges[key]?.max ?? '') }])) as RangeDraft);
    setError(''); setPanel(kind);
  }
  function close() { dialog.current?.close(); setPanel(null); origin.current?.focus({ preventScroll: true }); }
  useLayoutEffect(() => {
    if (!panel || !dialog.current) return;
    const element = dialog.current;
    const position = () => {
      if (window.matchMedia('(min-width: 980px)').matches && origin.current) {
        const rect = origin.current.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        element.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - box.width - 12))}px`;
        element.style.top = `${Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - box.height - 12))}px`;
      } else { element.style.removeProperty('left'); element.style.removeProperty('top'); }
    };
    element.showModal(); position(); window.addEventListener('resize', position);
    return () => window.removeEventListener('resize', position);
  }, [panel]);
  function apply() {
    const nextRanges: DexQuery['ranges'] = {};
    for (const key of rangeFields) {
      const min = ranges[key].min.trim(), max = ranges[key].max.trim();
      const low = min === '' ? undefined : Number(min), high = max === '' ? undefined : Number(max);
      const limit = key === 'perfectIvs' ? 6 : key === 'eggCount' ? 4 : Infinity;
      if ([low, high].some(value => value !== undefined && (!Number.isFinite(value) || value < 0 || value > limit || (key !== 'currentCost' && !Number.isInteger(value)))) || (low !== undefined && high !== undefined && low > high)) {
        setError(`Check ${dexRanges[key]}: use nonnegative ${key === 'currentCost' ? 'numbers' : 'whole numbers'}${limit < Infinity ? ` up to ${limit}` : ''}, with minimum no greater than maximum.`); return;
      }
      if (low !== undefined || high !== undefined) nextRanges[key] = { min: low, max: high };
    }
    setQuery({ ...draft, ranges: nextRanges }); close();
  }
  const removeRange = (key: DexRangeField) => { const next = { ...query.ranges }; delete next[key]; setQuery({ ...query, ranges: next }); };
  const hasConditions = Boolean(query.text || query.conditions.length || Object.keys(query.ranges).length);
  return <section className='dex-browser' aria-label='Pokédex browser'>
    <div className='search-box'><Search aria-hidden='true' /><input aria-label='Search Pokémon or collection gaps' value={query.text} onChange={event => setQuery({ ...query, text: event.target.value })} placeholder='Search Pokémon or gaps…' />{query.text && <button aria-label='Clear search' onClick={() => setQuery({ ...query, text: '' })}><X /></button>}</div>
    <div className='dex-toolbar'>
      <div role='group' aria-label='Dex scope'>{(['collected', 'all'] as const).map(scope => <button key={scope} aria-pressed={query.scope === scope} onClick={() => setQuery({ ...query, scope })}>{scope === 'collected' ? 'Collected' : 'All Pokémon'}</button>)}</div>
      <div role='group' aria-label='Dex layout'>{(['grid', 'list'] as const).map(value => <button key={value} aria-pressed={view === value} onClick={() => setView(value)}>{value === 'grid' ? 'Grid' : 'List'}</button>)}</div>
      <div role='group' aria-label='Query controls'>{(['Filters', 'Sort', 'Advanced'] as const).map(kind => <button key={kind} aria-haspopup='dialog' aria-expanded={panel === kind} onClick={event => open(kind, event.currentTarget)}>{kind}</button>)}</div>
    </div>
    <p className='dex-note'>{query.scope === 'collected' ? 'Collected means unlocked starters in this import.' : 'All Pokémon currently covers the bundled starter roots; evolutions and possible unlocks need expanded reference coverage.'} Search matches names and collection gaps as plain text.</p>
    <div className='dex-applied' aria-label='Applied conditions'>
      {query.text && <button aria-label={`Remove search ${query.text}`} onClick={() => setQuery({ ...query, text: '' })}>Search: {query.text} ×</button>}
      {query.conditions.map(condition => <button key={condition} aria-label={`Remove ${dexFilters[condition]}`} onClick={() => setQuery({ ...query, conditions: query.conditions.filter(value => value !== condition) })}>{dexFilters[condition]} ×</button>)}
      {rangeFields.filter(key => query.ranges[key]).map(key => <button key={key} aria-label={`Remove ${dexRanges[key]}`} onClick={() => removeRange(key)}>{dexRanges[key]}: {query.ranges[key]?.min ?? 'Any'}–{query.ranges[key]?.max ?? 'Any'} ×</button>)}
      {hasConditions && <button onClick={() => setQuery({ ...query, text: '', conditions: [], ranges: {} })}>Clear all</button>}
    </div>
    <div className='result-meta' aria-live='polite'><span>{total} {total === 1 ? 'starter' : 'starters'}</span><span>{dexSorts[query.sort]} · {query.direction === 'asc' ? 'Ascending' : 'Descending'}</span></div>
    <div className={`dex-results dex-${view}`}>{pokemon.map(entry => <PokemonCard key={entry.id} pokemon={entry} onClick={() => onPokemon(entry.id)} />)}</div>
    {pokemon.length < total && <button className='secondary load-more' onClick={onMore}>Show more</button>}
    {!total && <div className='empty-panel'><Search /><div><strong>No matches</strong><span>Try All Pokémon or remove a condition. Import an account to see your collection.</span></div></div>}
    {panel && <dialog ref={dialog} className='dex-panel' aria-labelledby='dex-panel-title' onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled)'));
      const first = controls[0], last = controls[controls.length - 1];
      if ((!event.shiftKey && document.activeElement === last) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault(); (event.shiftKey ? last : first)?.focus();
      }
    }} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } }}>
      <header><h2 id='dex-panel-title'>{panel}</h2><button aria-label={`Cancel ${panel}`} onClick={close}><X /></button></header>
      <div className='dex-panel-body'>
        {panel === 'Filters' && <><p>All selected conditions must match (AND). Missing values do not count as zero.</p>{(Object.keys(dexFilters) as DexCondition[]).map(key => <label className='dex-checkbox' key={key}><input type='checkbox' checked={draft.conditions.includes(key)} onChange={event => setDraft({ ...draft, conditions: event.target.checked ? [...draft.conditions, key] : draft.conditions.filter(value => value !== key) })} />{dexFilters[key]}</label>)}</>}
        {panel === 'Sort' && <><label>Sort by<select aria-label="Sort by" value={draft.sort} onChange={event => setDraft({ ...draft, sort: event.target.value as DexSort })}>{Object.entries(dexSorts).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Direction<select aria-label="Direction" value={draft.direction} onChange={event => setDraft({ ...draft, direction: event.target.value as DexQuery['direction'] })}><option value='asc'>Ascending</option><option value='desc'>Descending</option></select></label><p>Ties use Dex number. Unknown values sort last.</p></>}
        {panel === 'Advanced' && <><p>Inclusive ranges use imported fields. Leave a bound blank for any value. All ranges and filters combine with AND.</p>{rangeFields.map(key => <fieldset key={key}><legend>{dexRanges[key]}</legend><div className='dex-range'>{(['min', 'max'] as const).map(bound => <label key={bound}>{bound === 'min' ? 'Minimum' : 'Maximum'}<input aria-label={`${dexRanges[key]} ${bound === 'min' ? 'minimum' : 'maximum'}`} type='text' inputMode={key === 'currentCost' ? 'decimal' : 'numeric'} value={ranges[key][bound]} onChange={event => setRanges({ ...ranges, [key]: { ...ranges[key], [bound]: event.target.value } })} /></label>)}</div></fieldset>)}<p>Types, named moves/abilities, base stats, evolutions and expression syntax need verified reference coverage and the later search packet. IV slots count perfect imported IVs; egg slots count unlocked ownership bits, not named moves.</p></>}
        {error && <p role='alert'>{error}</p>}
      </div><footer><button className='secondary' onClick={close}>Cancel</button><button className='primary' onClick={apply}>Apply</button></footer>
    </dialog>}
  </section>;
}
function displayNumber(value: number, total?: number) { return Number.isFinite(value) ? `${value}${total ? `/${total}` : ''}` : 'Unknown'; }
function PokemonCard({ pokemon, onClick }: { pokemon: PokemonRecord; onClick: () => void }) {
  return <button className='pokemon-card' data-pokemon-id={pokemon.id} onClick={onClick}>
    <div className='sprite-wrap'><PokemonSprite pokemon={pokemon} size={57} />{pokemon.t3 && <span className='t3-badge red-shiny-star' aria-label='Red shiny'>★</span>}</div>
    <div className='pokemon-main'><strong>{pokemon.name || `Pokémon #${pokemon.id}`}</strong><span>IV {displayNumber(pokemon.perfectIvs, 6)} · Egg {displayNumber(pokemon.eggCount, 4)}</span><span>Luck {displayNumber(pokemon.luck)}</span><small>{pokemon.progressGaps === 'None' ? 'Core progress complete' : pokemon.progressGaps || 'Progress unavailable'}</small></div>
    <div className='pokemon-status'><span>{pokemon.unlocked === true ? 'Collected' : pokemon.unlocked === false ? 'Locked' : 'Ownership unknown'}</span><span>{pokemon.passiveUnlocked === true ? 'Passive unlocked' : pokemon.passiveUnlocked === false ? 'Passive not unlocked' : 'Passive unknown'}</span></div>
  </button>;
}
