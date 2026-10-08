import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Database,
  Download,
  FlaskConical,
  History,
  Home,
  Import,
  Info,
  Layers3,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import {
  buildDemoState,
  decryptAndNormalize,
  runDecryptSelfTest,
  type AppState,
  type PokemonRecord,
} from './pokerogue';
import { createPokeRogueData, type PokeRogueData } from './domain/facade';
import { CANONICAL_TEAM_IDS, type CanonicalTeamMember } from './domain/teams';
import { getFusionParticipant } from './domain/fusions';
import { STARTER_BY_NAME } from './reference';
import { PokemonSprite } from './ui/components/PokemonSprite';
import {
  fusionShortName,
  memberAssetFormKey,
  memberConfig,
  memberMeta,
  memberMoves,
  memberRunNotes,
  shinyTierNumber,
  teamCostText,
  teamLuckText,
  teamModeLabel,
  teamShortName,
  teamSummary,
} from './ui/view-models';
import {
  clearAccountStorage,
  createBackupText,
  emptyState,
  loadStateWithStatus,
  restoreBackupText,
  saveState,
  statusAfterRestore,
  type StorageStatus,
} from './store';

type Page =
  | 'home'
  | 'dex'
  | 'detail'
  | 'teams'
  | 'hunt'
  | 'fusion'
  | 'trainer'
  | 'changes'
  | 'more'
  | 'settings';

type DexFilter = 'all' | 'missing' | 't3' | 'passive' | 'team' | 'iv';

const pageTitles: Record<Page, string> = {
  home: 'Command Center',
  dex: 'Pokédex',
  detail: 'Pokémon Detail',
  teams: 'Party Builder',
  hunt: 'Hunt / Priorities',
  fusion: 'Fusion Lab',
  trainer: 'Trainer',
  changes: 'Change Log',
  more: 'More',
  settings: 'Import / Settings',
};

function App() {
  const [state, setState] = useState<AppState>(emptyState());
  const [loaded, setLoaded] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [page, setPage] = useState<Page>('home');
  const [selectedId, setSelectedId] = useState<number>(898);
  const [search, setSearch] = useState('');
  const [dexFilter, setDexFilter] = useState<DexFilter>('all');
  const [visibleCount, setVisibleCount] = useState(90);
  const [teamIndex, setTeamIndex] = useState(1);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [selfTest, setSelfTest] = useState<'idle' | 'pass' | 'fail'>('idle');
  const saveInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStateWithStatus()
      .then(result => {
        setState(result.state);
        setStorageStatus(result.status);
        setLoaded(true);
      })
      .catch(error => {
        setState(emptyState());
        setLoaded(true);
        showToast(error instanceof Error ? error.message : 'Could not load local app data.');
      });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveState(state)
      .then(status => setStorageStatus(status))
      .catch(() => showToast('Could not save local app data.'));
  }, [state, loaded]);

  useEffect(() => {
    setVisibleCount(90);
  }, [search, dexFilter]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 3600);
  }

  function navigate(next: Page) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSaveFile(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const next = decryptAndNormalize(text, file.name, state);
      setState(next);
      setPage('home');
      const count = next.current?.latestChanges.length || 0;
      showToast(
        count > 0
          ? 'Imported ' + file.name + ' • ' + count + ' improvements found.'
          : 'Imported ' + file.name + ' • schema-v2 baseline saved.'
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Save import failed.');
    } finally {
      setBusy(false);
      if (saveInput.current) saveInput.current.value = '';
    }
  }

  async function handleBackup(file?: File) {
    if (!file) return;
    try {
      const restored = restoreBackupText(await file.text());
      setState(restored.state);
      setStorageStatus(
        statusAfterRestore(
          restored.state,
          storageStatus?.backend || 'indexeddb',
          restored.warnings
        )
      );
      showToast(
        restored.warnings.length
          ? 'Backup restored with ' + restored.warnings.length + ' compatibility note.'
          : 'Backup restored.'
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Backup restore failed.');
    } finally {
      if (backupInput.current) backupInput.current.value = '';
    }
  }

  function exportBackup() {
    const blob = new Blob([createBackupText(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'rogue-plus-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function loadDemo() {
    setState(buildDemoState());
    setPage('home');
    showToast('Sample account loaded. Import a real .prsv whenever you are ready.');
  }

  async function clearData() {
    if (!window.confirm(
      'Clear every local snapshot, change, and imported account from this device? Cached Pokémon artwork will be kept.'
    )) return;
    try {
      const status = await clearAccountStorage();
      setStorageStatus(status);
      setState(emptyState());
      setPage('home');
      showToast('Local account data cleared. Cached Pokémon artwork was kept.');
    } catch {
      showToast('Could not clear local account data.');
    }
  }

  function openPokemon(id: number) {
    setSelectedId(id);
    navigate('detail');
  }

  const current = state.current;
  const legacyCurrent = Boolean(current && (current.schemaVersion !== 2 || current.legacy));
  const data = useMemo(
    () => current && !legacyCurrent ? createPokeRogueData(current, storageStatus) : null,
    [current, legacyCurrent, storageStatus]
  );
  const selected = data?.pokemonById.get(selectedId) || data?.pokemon[0] || null;

  const filteredPokemon = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.pokemon.filter(p => {
      if (
        term &&
        !p.name.toLowerCase().includes(term) &&
        !p.progressGaps.toLowerCase().includes(term) &&
        !p.collectionGaps.toLowerCase().includes(term)
      ) return false;
      if (dexFilter === 'missing' && p.progressGaps === 'None') return false;
      if (dexFilter === 't3' && !p.t3) return false;
      if (dexFilter === 'passive' && p.passiveUnlocked) return false;
      if (dexFilter === 'team' && !CANONICAL_TEAM_IDS.has(p.id)) return false;
      if (dexFilter === 'iv' && p.perfectIvs === 6) return false;
      return true;
    });
  }, [data, search, dexFilter]);

  if (!loaded) {
    return (
      <div className='loading-screen'>
        <div className='loader' />
        <strong>Loading Rogue+…</strong>
      </div>
    );
  }

  return (
    <div className='app-shell'>
      <input
        ref={saveInput}
        className='hidden-input'
        type='file'
        aria-label='Choose PokéRogue save file'
        onChange={event => handleSaveFile(event.target.files?.[0])}
      />
      <input
        ref={backupInput}
        className='hidden-input'
        type='file'
        accept='.json,application/json'
        onChange={event => handleBackup(event.target.files?.[0])}
      />

      <aside className='desktop-sidebar'>
        <Brand />
        <NavButton icon={<Home />} label='Home' active={page === 'home'} onClick={() => navigate('home')} />
        <NavButton icon={<Search />} label='Dex' active={page === 'dex' || page === 'detail'} onClick={() => navigate('dex')} />
        <NavButton icon={<Swords />} label='Teams' active={page === 'teams'} onClick={() => navigate('teams')} />
        <NavButton icon={<Target />} label='Hunt' active={page === 'hunt'} onClick={() => navigate('hunt')} />
        <NavButton
          icon={<Menu />}
          label='More'
          active={['more', 'fusion', 'trainer', 'changes', 'settings'].includes(page)}
          onClick={() => navigate('more')}
        />
      </aside>

      <main className='main'>
        <header className='topbar'>
          <div className='topbar-copy'>
            {page === 'detail' && (
              <button className='icon-button back' aria-label='Back to Pokédex' onClick={() => navigate('dex')}>
                <ArrowLeft />
              </button>
            )}
            <div>
              <div className='eyebrow'>ROGUE+ • LOCAL COMPANION</div>
              <h1>{pageTitles[page]}</h1>
            </div>
          </div>
          <button className='import-button' onClick={() => saveInput.current?.click()} disabled={busy}>
            {busy ? <RefreshCw className='spin' /> : <Import />}
            <span>{busy ? 'Importing' : 'Import'}</span>
          </button>
        </header>

        <div className='content'>
          {page === 'home' && <HomePage data={data} legacyCurrent={legacyCurrent ? current : null} onImport={() => saveInput.current?.click()} onDemo={loadDemo} onNavigate={navigate} onPokemon={openPokemon} />}
          {page === 'dex' && (
            <DexPage
              pokemon={filteredPokemon.slice(0, visibleCount)}
              total={filteredPokemon.length}
              search={search}
              setSearch={setSearch}
              filter={dexFilter}
              setFilter={setDexFilter}
              onPokemon={openPokemon}
              onMore={() => setVisibleCount(value => value + 90)}
            />
          )}
          {page === 'detail' && <DetailPage pokemon={selected} data={data} onTeam={() => navigate('teams')} />}
          {page === 'teams' && <TeamsPage data={data} teamIndex={teamIndex} setTeamIndex={setTeamIndex} onPokemon={openPokemon} />}
          {page === 'hunt' && <HuntPage data={data} onPokemon={openPokemon} />}
          {page === 'fusion' && <FusionPage data={data} />}
          {page === 'trainer' && <TrainerPage data={data} />}
          {page === 'changes' && <ChangesPage state={state} />}
          {page === 'more' && <MorePage navigate={navigate} />}
          {page === 'settings' && (
            <SettingsPage
              state={state}
              storageStatus={storageStatus}
              selfTest={selfTest}
              onImport={() => saveInput.current?.click()}
              onBackup={exportBackup}
              onRestore={() => backupInput.current?.click()}
              onClear={clearData}
              onSelfTest={() => {
                const ok = runDecryptSelfTest();
                setSelfTest(ok ? 'pass' : 'fail');
                showToast(ok ? 'Local architecture self-test passed.' : 'Local architecture self-test failed.');
              }}
            />
          )}
        </div>

        <nav className='bottom-nav'>
          <NavButton icon={<Home />} label='Home' active={page === 'home'} onClick={() => navigate('home')} />
          <NavButton icon={<Search />} label='Dex' active={page === 'dex' || page === 'detail'} onClick={() => navigate('dex')} />
          <NavButton icon={<Swords />} label='Teams' active={page === 'teams'} onClick={() => navigate('teams')} />
          <NavButton icon={<Target />} label='Hunt' active={page === 'hunt'} onClick={() => navigate('hunt')} />
          <NavButton icon={<Menu />} label='More' active={['more', 'fusion', 'trainer', 'changes', 'settings'].includes(page)} onClick={() => navigate('more')} />
        </nav>
      </main>

      {toast && <div className='toast'><Check /> {toast}</div>}
    </div>
  );
}

function Brand() {
  return (
    <div className='brand'>
      <div className='brand-mark'>R<span>+</span></div>
      <div className='brand-copy'>
        <strong>ROGUE<span className='brand-plus'>+</span></strong>
        <span>COMPANION FOR POKÉROGUE</span>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={'nav-button ' + (active ? 'active' : '')} onClick={onClick}>
      {icon}<span>{label}</span>
    </button>
  );
}

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

function HomePage({
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
        <SectionHeading title='New since last save' action={changes.length ? changes.length + ' changes' : 'Baseline'} onClick={() => onNavigate('changes')} />
        {changes.length ? (
          <div className='change-stack'>{changes.map((change, index) => <ChangeCard key={index} change={change} />)}</div>
        ) : (
          <div className='empty-panel'><History /><div><strong>Baseline established</strong><span>Import a newer schema-v2 save later and improvements will appear here automatically.</span></div></div>
        )}
      </section>

      <section className='section'>
        <SectionHeading title='Current run build' action='Open Teams' onClick={() => onNavigate('teams')} />
        <div className='team-banner'>
          <div>
            <div className='eyebrow'>{teamModeLabel(team)}</div>
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

      <section className='section'>
        <SectionHeading title='Next actions' action='Ranked list' onClick={() => onNavigate('hunt')} />
        <div className='priority-list'>
          {data.priorities.slice(0, 5).map((pokemon, index) => (
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

      <SaveMeta current={data.snapshot} />
    </>
  );
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <div className={'kpi tone-' + tone}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function SectionHeading({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) {
  return <div className='section-heading'><h2>{title}</h2>{action && <button onClick={onClick}>{action}<ChevronRight /></button>}</div>;
}

function ChangeCard({ change }: { change: AppState['history'][number] }) {
  const tone = change.importance === 'Major' ? 'gold' : change.importance === 'Team' ? 'purple' : change.importance === 'Complete' ? 'green' : 'blue';
  return (
    <div className='change-card'>
      <div className={'change-icon tone-' + tone}><Sparkles /></div>
      <div>
        <strong>{change.pokemon}</strong>
        <span>{change.category} • {change.before} → {change.after}</span>
        {change.teamImpact && <small>TEAM IMPACT • {change.teamImpact}</small>}
      </div>
    </div>
  );
}

function DexPage({
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
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder='Search Pokémon or collection gaps…' />
        {search && <button onClick={() => setSearch('')}><X /></button>}
      </div>
      <div className='filter-row'>
        {([['all','All'],['missing','Missing'],['t3','T3'],['passive','Passive'],['team','Team'],['iv','IVs']] as Array<[DexFilter,string]>).map(([id,label]) => (
          <button key={id} className={filter === id ? 'filter active' : 'filter'} onClick={() => setFilter(id)}>{label}</button>
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
        <span className={pokemon.passiveUnlocked ? 'status complete' : 'status missing'}>{pokemon.passiveUnlocked ? 'PASSIVE ✓' : 'PASSIVE'}</span>
        <span className={pokemon.t3 ? 'status t3' : 'status subtle'}>{pokemon.t3 ? 'RED SHINY' : 'T3 —'}</span>
      </div>
      <ChevronRight />
    </button>
  );
}

function DetailPage({ pokemon, data, onTeam }: { pokemon: PokemonRecord | null; data: PokeRogueData | null; onTeam: () => void }) {
  if (!pokemon || !data) return <EmptyInline />;
  const used = data.teams.filter(team => (team.members || []).some(member => member.starter === pokemon.name));
  const ivs = [['HP',pokemon.ivHp],['Atk',pokemon.ivAtk],['Def',pokemon.ivDef],['SpA',pokemon.ivSpa],['SpD',pokemon.ivSpd],['Spe',pokemon.ivSpe]] as const;

  return (
    <>
      <section className='pokemon-hero'>
        <div className='hero-sprite'>
          <PokemonSprite pokemon={pokemon} size={106} />
          {pokemon.t3 && <span className='big-shiny'>T3 • LUCK 3</span>}
        </div>
        <div className='hero-copy'>
          <div className='eyebrow'>STARTER #{pokemon.id}</div>
          <h2>{pokemon.name}</h2>
          <div className='tag-row'><span>Cost {pokemon.currentCost}</span><span>{pokemon.candy} Candy</span><span>{pokemon.classicWins} Classic wins</span></div>
        </div>
      </section>

      <section className='section'><h2>Account completion</h2>
        <div className='readiness-grid'>
          <Readiness label='Perfect IVs' value={pokemon.perfectIvs + ' / 6'} complete={pokemon.perfectIvs === 6} />
          <Readiness label='Egg moves' value={pokemon.eggCount + ' / 4'} complete={pokemon.eggCount === 4} />
          <Readiness label='Natures' value={pokemon.natureCount + ' / 25'} complete={pokemon.natureCount === 25} />
          <Readiness label='Cost reductions' value={pokemon.costReductions + ' / 2'} complete={pokemon.costReductions >= 2} />
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
          <DataLine label='Shiny tiers' value={[pokemon.t1?'T1':'',pokemon.t2?'T2':'',pokemon.t3?'T3':''].filter(Boolean).join(' • ') || 'None'} />
          <DataLine label='Seen / caught / hatched' value={pokemon.seen + ' / ' + pokemon.caught + ' / ' + pokemon.hatched} />
          <DataLine label='Progress gaps' value={pokemon.progressGaps} />
          <DataLine label='Collection gaps' value={pokemon.collectionGaps} />
          <DataLine label='Priority' value={pokemon.priorityScore + ' • ' + pokemon.nextAction} />
        </div>
      </section>

      {used.length > 0 && (
        <section className='section'>
          <SectionHeading title='Saved strategies' action='Open Teams' onClick={onTeam} />
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

function DataLine({ label, value }: { label: string; value: string | number }) {
  return <div className='data-line'><span>{label}</span><strong>{String(value)}</strong></div>;
}

function TeamsPage({
  data,
  teamIndex,
  setTeamIndex,
  onPokemon,
}: {
  data: PokeRogueData | null;
  teamIndex: number;
  setTeamIndex: (value: number) => void;
  onPokemon: (id: number) => void;
}) {
  if (!data) return <EmptyInline />;
  const team = data.teams[teamIndex] || data.teams[0];
  const readiness = data.teamReadiness.find(result => result.teamId === team.id);
  const members = team.members || [];

  return (
    <>
      <div className='team-tabs'>
        {data.teams.map((candidate,index) => (
          <button key={candidate.id} className={index === teamIndex ? 'active' : ''} onClick={() => setTeamIndex(index)}>{teamShortName(candidate)}</button>
        ))}
      </div>

      <section className='team-header-card'>
        <div>
          <div className='eyebrow'>{teamModeLabel(team)}</div>
          <h2>{teamShortName(team)}</h2>
          <p>{teamSummary(team)}</p>
        </div>
        <div className='team-kpis'>
          <span><strong>{teamCostText(team)}</strong>{team.cap ? ' / ' + String(team.cap) : ''}<small>POINTS</small></span>
          <span><strong>{teamLuckText(team)}</strong><small>LUCK</small></span>
          <span><strong>{readiness ? readiness.startersAvailable + '/' + readiness.starterCount : '—'}</strong><small>STARTERS</small></span>
        </div>
        {readiness?.verifiableTargetCount ? (
          <div className='tag-row'>
            <span>{readiness.verifiableTargetsMet}/{readiness.verifiableTargetCount} recorded shiny targets met</span>
            <span>In-run requirements tracked separately</span>
          </div>
        ) : null}
      </section>

      {members.length ? (
        <div className='party-grid'>
          {members.map((member,index) => {
            const pokemon = data.pokemonByName.get(member.starter);
            const memberReadiness = readiness?.members[index];
            const label = !memberReadiness?.unlocked
              ? 'MISSING'
              : memberReadiness.shinyTierMet === false
                ? 'TARGET GAP'
                : memberReadiness.unverifiedInRunRequirements.length
                  ? 'ACCOUNT OK'
                  : 'AVAILABLE';
            const missing = label === 'MISSING' || label === 'TARGET GAP';
            const starterId = STARTER_BY_NAME.get(member.starter)?.id;
            return (
              <button
                key={member.slot + '-' + member.starter}
                className='party-card'
                onClick={() => starterId && onPokemon(starterId)}
                disabled={!starterId}
              >
                <div className='party-number'>#{member.slot || index + 1}</div>
                <TeamMemberSprite member={member} pokemon={pokemon} size={78} />
                <div className='party-copy'><h3>{member.starter}</h3><span>{memberMeta(member)}</span><small>{member.role || 'Roster member'}</small></div>
                <div className={missing ? 'ready-badge missing' : 'ready-badge'}>{label}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className='empty-panel'><Layers3 /><div><strong>Strategy blueprint</strong><span>{teamSummary(team)}</span></div></div>
      )}

      {members.length > 0 && (
        <section className='section'>
          <h2>Source-backed build notes</h2>
          <div className='build-list'>
            {members.map((member,index) => {
              const pokemon = data.pokemonByName.get(member.starter);
              const moves = memberMoves(member);
              const notes = memberRunNotes(member);
              const memberReadiness = readiness?.members[index];
              return (
                <div key={member.slot + '-' + member.starter} className='build-row'>
                  <TeamMemberSprite member={member} pokemon={pokemon} size={44} />
                  <div className='build-name'><strong>{member.starter}</strong><span>{memberConfig(member)}</span></div>
                  <div className='build-detail'><strong>MOVES / ROLE</strong><span>{moves.length ? moves.join(' • ') : member.role || 'No move package recorded in source'}</span></div>
                  <div className='build-detail'><strong>RUN / FUSION</strong><span>{notes.length ? notes.join(' • ') : 'No additional in-run note recorded'}</span></div>
                  {memberReadiness && (
                    <div className='build-detail'>
                      <strong>ACCOUNT CHECK</strong>
                      <span>
                        {memberReadiness.accountChecks.length ? memberReadiness.accountChecks.join(' • ') : 'No positive account checks'}
                        {memberReadiness.unverifiedInRunRequirements.length ? ' | In-run: ' + memberReadiness.unverifiedInRunRequirements.join(', ') : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!team.exactRoster && team.architecture?.length ? (
        <section className='section'><h2>Run architecture</h2><div className='steps'>{team.architecture.map((step,index) => <div key={step}><span>{index+1}</span><p>{step}</p></div>)}</div></section>
      ) : null}

      {team.recordedFusionDirections?.length ? (
        <section className='section'><h2>Recorded fusion directions</h2><div className='steps'>{team.recordedFusionDirections.map((step,index) => <div key={step}><span>{index+1}</span><p>{step}</p></div>)}</div></section>
      ) : null}
    </>
  );
}

function TeamMemberSprite({ member, pokemon, size }: { member: CanonicalTeamMember; pokemon?: PokemonRecord; size: number }) {
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

function HuntPage({ data, onPokemon }: { data: PokeRogueData | null; onPokemon: (id: number) => void }) {
  if (!data) return <EmptyInline />;
  const account = data.account;
  return (
    <>
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

function FusionPage({ data }: { data: PokeRogueData | null }) {
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

function TrainerPage({ data }: { data: PokeRogueData | null }) {
  if (!data) return <EmptyInline />;
  const account = data.account;
  const stats = account.stats;
  return (
    <>
      <div className='hero-grid'>
        <Kpi label='Battles' value={fmt(stats.battles)} note={fmt(stats.trainersDefeated)+' TRAINERS'} tone='blue' />
        <Kpi label='Hatched' value={fmt(stats.pokemonHatched)} note={fmt(stats.shinyPokemonHatched)+' SHINY'} tone='green' />
        <Kpi label='Endless High' value={fmt(stats.highestEndlessWave)} note={'LEVEL '+fmt(stats.highestLevel)} tone='purple' />
        <Kpi label='Sessions Won' value={fmt(stats.sessionsWon)} note='CAREER' tone='gold' />
      </div>
      <section className='section'><h2>Collection completion</h2>
        <div className='progress-list'>
          <Progress label='Starters' value={account.startersUnlocked} total={account.startersTotal} tone='green' />
          <Progress label='Passives' value={account.passivesUnlocked} total={account.passivesTotal} tone='gold' />
          <Progress label='Egg moves' value={account.eggMovesUnlocked} total={account.eggMovesTotal} tone='blue' />
          <Progress label='Perfect IV' value={account.perfectIvStarters} total={account.startersTotal} tone='green' />
          <Progress label='Shiny' value={account.shinyStarters} total={account.startersTotal} tone='purple' />
          <Progress label='Classic wins' value={account.classicWinners} total={account.startersTotal} tone='orange' />
        </div>
      </section>
      <section className='section'><h2>Vouchers</h2>
        <div className='voucher-grid'>
          <Kpi label='Regular' value={String(account.vouchers.regular)} note='VOUCHERS' tone='blue' />
          <Kpi label='Plus' value={String(account.vouchers.plus)} note='VOUCHERS' tone='green' />
          <Kpi label='Premium' value={String(account.vouchers.premium)} note='VOUCHERS' tone='purple' />
          <Kpi label='Golden' value={String(account.vouchers.golden)} note='VOUCHERS' tone='gold' />
        </div>
      </section>
      <SaveMeta current={data.snapshot} />
    </>
  );
}

function Progress({ label, value, total, tone }: { label:string; value:number; total:number; tone:string }) {
  const pct = total ? Math.round(value/total*100) : 0;
  return <div className='progress-row'><div><strong>{label}</strong><span>{value.toLocaleString()} / {total.toLocaleString()}</span></div><div className='progress-track'><span className={'tone-'+tone} style={{width:pct+'%'}} /></div><strong>{pct}%</strong></div>;
}

function ChangesPage({ state }: { state: AppState }) {
  if (!state.current) return <EmptyInline />;
  return (
    <>
      <section className='section'><div className='change-summary'><Kpi label='Latest Changes' value={String(state.current.latestChanges.length)} note='LAST IMPORT' tone='green' /><Kpi label='History' value={String(state.history.length)} note='ALL IMPORTS' tone='purple' /></div></section>
      <section className='section'><h2>Permanent history</h2>
        <div className='change-stack'>
          {state.history.length ? state.history.map((change,index) => <ChangeCard key={index} change={change} />) : <div className='empty-panel'><History /><div><strong>No changes yet</strong><span>Import a second schema-v2 save to generate before/after history.</span></div></div>}
        </div>
      </section>
    </>
  );
}

function MorePage({ navigate }: { navigate: (page:Page)=>void }) {
  const links:Array<[Page,ReactNode,string,string]> = [
    ['fusion',<FlaskConical />,'Fusion Lab','Versioned fusion recipes and source notes'],
    ['trainer',<UserRound />,'Trainer','Career stats, vouchers and completion'],
    ['changes',<History />,'Change Log','Permanent before / after history'],
    ['settings',<Database />,'Import / Settings','Save import, backups and local storage'],
  ];
  return <div className='more-grid'>{links.map(([target,icon,title,note]) => <button key={target} className='more-card' onClick={() => navigate(target)}><div className='more-icon'>{icon}</div><div><h3>{title}</h3><p>{note}</p></div><ChevronRight /></button>)}</div>;
}

function SettingsPage({
  state,
  storageStatus,
  selfTest,
  onImport,
  onBackup,
  onRestore,
  onClear,
  onSelfTest,
}: {
  state:AppState;
  storageStatus:StorageStatus|null;
  selfTest:'idle'|'pass'|'fail';
  onImport:()=>void;
  onBackup:()=>void;
  onRestore:()=>void;
  onClear:()=>void;
  onSelfTest:()=>void;
}) {
  return (
    <>
      <section className='settings-hero'><ShieldCheck /><div><div className='eyebrow'>LOCAL-FIRST</div><h2>Your save stays on this device.</h2><p>Decryption, normalization, comparison, and snapshot storage happen in the browser. Trainer ID and Secret ID are discarded before normalized data is created.</p></div></section>
      <section className='section'><h2>Save import</h2><div className='settings-actions'>
        <button className='primary big' onClick={onImport}><Upload /> Import .prsv</button>
        <button className='secondary big' onClick={onSelfTest}><FlaskConical /> Local architecture self-test <span className={'self-test '+selfTest}>{selfTest==='pass'?'PASS':selfTest==='fail'?'FAIL':'RUN'}</span></button>
      </div><p className='settings-hint'>iPhone: if the system chooser offers photos or camera, select <strong>Choose File</strong> and pick the .prsv from Files.</p></section>
      <section className='section'><h2>Local data</h2><div className='settings-actions'>
        <button className='secondary big' onClick={onBackup} disabled={!state.current}><Download /> Export backup</button>
        <button className='secondary big' onClick={onRestore}><Upload /> Restore backup</button>
        <button className='danger big' onClick={onClear}><Trash2 /> Clear local data</button>
      </div></section>
      <section className='section'><h2>Storage</h2><div className='collection-grid'>
        <DataLine label='Snapshots saved' value={state.snapshots.length} />
        <DataLine label='Change records' value={state.history.length} />
        <DataLine label='Current source' value={state.current?.sourceFile || 'None'} />
        <DataLine label='Game version' value={state.current?.gameVersion || '—'} />
        <DataLine label='Storage backend' value={storageStatus?.backend==='indexeddb'?'IndexedDB':storageStatus?.backend==='localStorage'?'localStorage fallback':'—'} />
        <DataLine label='Storage schema' value={storageStatus?'DB v'+storageStatus.dbVersion+' • state v'+storageStatus.stateSchemaVersion:'—'} />
        <DataLine label='Current state' value={storageStatus?.currentState || 'none'} />
        <DataLine label='Legacy snapshots' value={storageStatus?.legacySnapshotCount ?? 0} />
        <DataLine label='Reference version' value={storageStatus?.referenceVersion || state.current?.referenceVersion || '—'} />
      </div></section>
      {storageStatus?.warnings.length ? <section className='privacy-note'><Info /><p>{storageStatus.warnings.join(' ')}</p></section> : null}
      <section className='privacy-note'><Info /><p>Account reset clears imported state, snapshots, and history. The independent pinned Pokémon artwork cache is kept. The raw or decrypted save is not uploaded by this app.</p></section>
    </>
  );
}

function SaveMeta({ current }: { current: NonNullable<AppState['current']> }) {
  return <div className='save-meta'><Database /><span><strong>{current.sourceFile}</strong><small>{new Date(current.saveTimestamp).toLocaleString()} • game {current.gameVersion} • schema {current.schemaVersion ?? 'legacy'}</small></span></div>;
}

function EmptyInline() {
  return <div className='empty-panel'><Database /><div><strong>No account loaded</strong><span>Import a PokéRogue .prsv from the Import button.</span></div></div>;
}

function fmt(value:unknown) {
  return typeof value==='number' ? value.toLocaleString() : Number(value||0).toLocaleString();
}

export default App;
