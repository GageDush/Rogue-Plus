import { ChevronRight, Database, History, Search, ShieldCheck, Sparkles, Upload, X } from 'lucide-react';
import { useState } from 'react';
import type { Page } from '../../app/navigation';
import type { AppState } from '../../domain/types';
import { getCandyActions, type EggSort, type PokeRogueData } from '../../domain/facade';
import { PokemonSprite } from '../../ui/components/PokemonSprite';
import { TeamMemberSprite } from '../../ui/components/TeamMemberSprite';
import { ChangeCard, CollectionProgress, SaveMeta, SectionHeading } from '../../ui/components/AppWidgets';
import { teamCostText, teamLuckText, teamModeLabel, teamShortName } from '../../ui/view-models';

function EmptyState({ onImport, onDemo }: { onImport: () => void; onDemo: () => void }) {
  return (
    <section className='onboarding'>
      <div className='onboarding-icon'><Database /></div>
      <div className='eyebrow'>LOCAL-FIRST • NO ACCOUNT REQUIRED</div>
      <h2>Import your PokéRogue system save.</h2>
      <p>Your .prsv is decrypted in this browser. Trainer ID, Secret ID, and the raw decrypted save are never stored.</p>
      <div className='button-row'>
        <button className='primary big' onClick={onImport}><Upload /> Choose .prsv</button>
        <button className='secondary big' onClick={onDemo}><Sparkles /> Try sample view</button>
      </div>
      <div className='privacy-strip'>
        <ShieldCheck />
        <span>On iPhone, use <strong>Choose File</strong> if the system chooser also offers camera or photo options.</span>
      </div>
    </section>
  );
}

function LegacyStateNotice({ sourceFile, onImport }: { sourceFile: string; onImport: () => void }) {
  return (
    <section className='onboarding'>
      <div className='onboarding-icon'><Database /></div>
      <div className='eyebrow'>LEGACY SNAPSHOT PRESERVED</div>
      <h2>One fresh save import is required.</h2>
      <p>The older local snapshot is still stored for rollback/history, but the rebuilt domain will not reinterpret it as schema-v2 data. Import your current .prsv once to establish the new canonical baseline.</p>
      <div className='button-row'><button className='primary big' onClick={onImport}><Upload /> Import current .prsv</button></div>
      <div className='privacy-strip'><ShieldCheck /><span>Preserved source: {sourceFile || 'legacy local snapshot'}</span></div>
    </section>
  );
}

export function HomePage({
  data,
  legacyCurrent,
  onImport,
  onDemo,
  onNavigate,
  onPokemon,
}: {
  data: PokeRogueData | null;
  legacyCurrent: AppState['current'];
  onImport: () => void;
  onDemo: () => void;
  onNavigate: (page: Page) => void;
  onPokemon: (id: number) => void;
}) {
  const [eggSort, setEggSort] = useState<EggSort>('most-eggs');
  const [showAll, setShowAll] = useState(false);
  const [candySearch, setCandySearch] = useState('');
  const [actionKind, setActionKind] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  if (!data) {
    return legacyCurrent
      ? <LegacyStateNotice sourceFile={legacyCurrent.sourceFile} onImport={onImport} />
      : <EmptyState onImport={onImport} onDemo={onDemo} />;
  }
  const account = data.account;
  const candyActions = getCandyActions(data.pokemon, eggSort);
  const filteredActions = candyActions.filter(action =>
    (!showAll || actionKind === 'all' || action.kind === actionKind) &&
    (!showAll || action.pokemon.name.toLocaleLowerCase().includes(candySearch.trim().toLocaleLowerCase())));
  const visibleActions = filteredActions.slice(0, showAll ? visibleCount : 3);
  const visibleEggs = visibleActions.some(action => action.kind === 'eggs');
  const changes = data.changes.slice(0, 5);
  const team = data.teams.find(candidate => candidate.id === 'complete-endless-spliced-5850-cheese') || data.teams[0];
  const readiness = data.teamReadiness.find(result => result.teamId === team.id);

  return (
    <>
      <section className='hero-grid'>
        <CollectionProgress label='Starters' value={account.startersUnlocked} total={account.startersTotal} tone='green' />
        <CollectionProgress label='Passives' value={account.passivesUnlocked} total={account.passivesTotal} tone='gold' />
        <CollectionProgress label='Egg moves' value={account.eggMovesUnlocked} total={account.eggMovesTotal} tone='blue' />
        <CollectionProgress label='★ Red shiny' value={account.t3Shiny} total={account.startersTotal} tone='red' />
      </section>

      <section className='section'>
        <SectionHeading title='Candy priorities' action={candyActions.length > 3 ? showAll ? 'Show fewer' : 'Browse all (' + candyActions.length + ')' : undefined} onClick={() => { setShowAll(!showAll); setCandySearch(''); setActionKind('all'); setVisibleCount(20); }} />
        <p className='candy-explainer'>Affordable passives first, then cost reductions, then eggs. Based on your last import.</p>
        {showAll && <div className='candy-browser'>
          <div className='search-box'><Search /><input aria-label='Search candy priorities' placeholder='Search Pokémon…' value={candySearch} onChange={event => { setCandySearch(event.target.value); setVisibleCount(20); }} />{candySearch && <button aria-label='Clear candy search' onClick={() => { setCandySearch(''); setVisibleCount(20); }}><X /></button>}</div>
          <label className='egg-sort'>Action <select aria-label='Candy action type' value={actionKind} onChange={event => { setActionKind(event.target.value); setVisibleCount(20); }}><option value='all'>All actions</option><option value='passive'>Passives</option><option value='reduction'>Cost reductions</option><option value='eggs'>Egg purchases</option></select></label>
          <p className='result-meta' role='status'>{filteredActions.length} matching priorities · showing {visibleActions.length}</p>
        </div>}
        {(visibleEggs || (showAll && actionKind === 'eggs')) && <label className='egg-sort'>Egg order <select value={eggSort} onChange={event => { setEggSort(event.target.value as EggSort); setVisibleCount(20); }}><option value='most-eggs'>Most eggs affordable</option><option value='least-progress'>Least collection progress</option></select></label>}
        <div className='priority-list'>
          {visibleActions.map(({ pokemon, label, cost, eggBudget, kind }, index) => (
            <button key={pokemon.id} className='priority-row' onClick={() => onPokemon(pokemon.id)}>
              <span className='rank'>{index + 1}</span>
              <PokemonSprite pokemon={pokemon} size={46} />
              <span className='priority-copy'><strong>{pokemon.name}</strong><small>{label}{kind === 'eggs' ? ' · up to ' + eggBudget + ' affordable' : ''}</small><small>{cost} candy{kind === 'eggs' ? ' each' : ''} · {pokemon.candy.toLocaleString()} available</small></span>
              <ChevronRight />
            </button>
          ))}
        </div>
        {showAll && visibleActions.length < filteredActions.length && <button className='secondary load-more' onClick={() => setVisibleCount(count => count + 20)}>Show 20 more</button>}
        {showAll && !filteredActions.length && candyActions.length > 0 && <div className='empty-panel'><Search /><div><strong>No matching candy priorities</strong><span>Try another Pokémon or action type.</span></div></div>}
        {!candyActions.length && <div className='empty-panel'><Database /><div><strong>No affordable candy actions</strong><span>Earn more candy or import a newer save to refresh availability.</span></div></div>}
        {visibleEggs && <details className='candy-notes'><summary>How egg budgets work</summary><p className='candy-explainer'>Eggs may improve moves, IVs, natures, hidden abilities or shinies; no unlock is guaranteed. Budgets use current hatch-based prices and exclude your game's egg-slot limit. One recommendation per Pokémon; nothing is purchased here.</p></details>}
        <p className='candy-explainer'>Use candy in PokéRogue. Nothing is purchased here.</p>
      </section>

      <section className='section'>
        <SectionHeading title='New since last save' action={changes.length ? changes.length + ' changes' : 'Baseline'} onClick={() => onNavigate('changes')} />
        {changes.length ? (
          <div className='change-stack'>{changes.map((change, index) => <ChangeCard key={index} change={change} />)}</div>
        ) : (
          <div className='empty-panel'><History /><div><strong>Baseline established</strong><span>Import a newer schema-v2 save later and improvements will appear here automatically.</span></div></div>
        )}
      </section>

      <section className='section'>
        <SectionHeading title='Strategy preset' action='View build' onClick={() => onNavigate('build')} />
        <div className='team-banner'>
          <div>
            <div className='eyebrow'>Bundled preset · {teamModeLabel(team)}</div>
            <h3>{teamShortName(team)}</h3>
            <p>
              {teamCostText(team)} / {team.cap ?? 15} points • {teamLuckText(team)} Luck
              {readiness ? ' • ' + readiness.startersAvailable + '/' + readiness.starterCount + ' starters available' : ''}
            </p>
          </div>
          <div className='mini-party'>
            {(team.members || []).map(member => (
              <TeamMemberSprite key={member.slot + '-' + member.starter} member={member} pokemon={data.pokemonByName.get(member.starter)} size={52} />
            ))}
          </div>
        </div>
      </section>

      <SaveMeta current={data.snapshot} />
    </>
  );
}


