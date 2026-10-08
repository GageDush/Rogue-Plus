import { ChevronRight, Database, History, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import type { Page } from '../../app/navigation';
import type { AppState } from '../../domain/types';
import type { PokeRogueData } from '../../domain/facade';
import { PokemonSprite } from '../../ui/components/PokemonSprite';
import { TeamMemberSprite } from '../../ui/components/TeamMemberSprite';
import { ChangeCard, Kpi, SaveMeta, SectionHeading } from '../../ui/components/AppWidgets';
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
  if (!data) {
    return legacyCurrent
      ? <LegacyStateNotice sourceFile={legacyCurrent.sourceFile} onImport={onImport} />
      : <EmptyState onImport={onImport} onDemo={onDemo} />;
  }
  const account = data.account;
  const changes = data.changes.slice(0, 5);
  const team = data.teams.find(candidate => candidate.id === 'complete-endless-spliced-5850-cheese') || data.teams[0];
  const readiness = data.teamReadiness.find(result => result.teamId === team.id);

  return (
    <>
      <section className='hero-grid'>
        <Kpi label='Starters' value={account.startersUnlocked + ' / ' + account.startersTotal} note='COLLECTION' tone='green' />
        <Kpi label='Passives' value={account.passivesUnlocked + ' / ' + account.passivesTotal} note={account.passivesTotal - account.passivesUnlocked + ' REMAIN'} tone='gold' />
        <Kpi label='Egg Moves' value={account.eggMovesUnlocked.toLocaleString() + ' / ' + account.eggMovesTotal.toLocaleString()} note={account.eggMovesTotal - account.eggMovesUnlocked + ' REMAIN'} tone='blue' />
        <Kpi label='Red Shiny' value={account.t3Shiny + ' T3'} note={account.allShinyTiers + ' ALL TIERS'} tone='purple' />
      </section>

      <section className='section'>
        <SectionHeading title='Next actions' action='Ranked list' onClick={() => onNavigate('goals')} />
        <div className='priority-list'>
          {data.priorities.slice(0, 3).map((pokemon, index) => (
            <button key={pokemon.id} className='priority-row' onClick={() => onPokemon(pokemon.id)}>
              <span className='rank'>{index + 1}</span>
              <PokemonSprite pokemon={pokemon} size={46} />
              <span className='priority-copy'><strong>{pokemon.name}</strong><small>{pokemon.nextAction}</small></span>
              <span className='score'>{pokemon.priorityScore}</span>
              <ChevronRight />
            </button>
          ))}
        </div>
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


