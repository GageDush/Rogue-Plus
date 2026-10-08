import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Home, Import, Menu, RefreshCw, Search, Swords, Target } from 'lucide-react';
import { buildDemoState, decryptAndNormalize, runDecryptSelfTest, type AppState } from './pokerogue';
import { createPokeRogueData } from './domain/facade';
import { CANONICAL_TEAM_IDS } from './domain/teams';
import { pageTitles, type Page, type DexFilter } from './app/navigation';
import { Brand, NavButton } from './ui/components/Navigation';
import { HomePage } from './features/home/HomePage';
import { DexPage } from './features/dex/DexPage';
import { DetailPage } from './features/dex/DetailPage';
import { TeamsPage } from './features/teams/TeamsPage';
import { HuntPage } from './features/hunt/HuntPage';
import { FusionPage } from './features/fusion/FusionPage';
import { TrainerPage } from './features/trainer/TrainerPage';
import { ChangesPage } from './features/history/ChangesPage';
import { MorePage } from './features/more/MorePage';
import { SettingsPage } from './features/settings/SettingsPage';
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


export default App;
