import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Import, Menu, RefreshCw } from 'lucide-react';
import { buildDemoState, decryptAndNormalize, runDecryptSelfTest, type AppState } from './pokerogue';
import { createPokeRogueData } from './domain/facade';
import { CANONICAL_TEAM_IDS } from './domain/teams';
import { isNavigationActive, pageTitles, primaryNavigation, secondaryNavigation, type Page, type DexFilter } from './app/navigation';
import { Brand, NavButton, NavigationIcon } from './ui/components/Navigation';
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
import { RunPage } from './features/runs/RunPage';
import { ModulesPage } from './features/modules/ModulesPage';
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
  const [loadPhase, setLoadPhase] = useState<'loading' | 'ready' | 'blocked'>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState('');
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
    let cancelled = false;
    loadStateWithStatus()
      .then(result => {
        if (cancelled) return;
        setState(result.state);
        setStorageStatus(result.status);
        setLoadError('');
        setLoadPhase('ready');
      })
      .catch(error => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : 'Could not load local app data.');
        setLoadPhase('blocked');
      });
    return () => { cancelled = true; };
  }, [loadAttempt]);

  useEffect(() => {
    if (loadPhase !== 'ready') return;
    saveState(state)
      .then(status => setStorageStatus(status))
      .catch(() => showToast('Could not save local app data.'));
  }, [state, loadPhase]);

  function retryLoad() {
    setLoadPhase('loading');
    setLoadAttempt(attempt => attempt + 1);
  }

  async function resetForRecovery() {
    if (!window.confirm('Permanently delete all locally stored Rogue+ account snapshots and history on this device? This cannot be undone. Keep your existing files or backups before resetting.')) return;
    setBusy(true);
    try {
      const status = await clearAccountStorage();
      setState(emptyState());
      setStorageStatus(status);
      setLoadError('');
      setLoadPhase('ready');
    } catch {
      setLoadError('Reset could not finish. Automatic saving is still paused. Close other Rogue+ tabs and retry loading before resetting again.');
    } finally {
      setBusy(false);
    }
  }

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

  if (loadPhase === 'blocked') {
    return (
      <main className='loading-screen recovery-screen'>
        <section className='recovery-panel' aria-labelledby='recovery-title'>
          <h1 id='recovery-title'>Local data needs recovery</h1>
          <p role='alert'>{loadError}</p>
          <p>Automatic saving is paused. Rogue+ has not replaced your stored data with an empty account.</p>
          <p>Close other Rogue+ tabs and retry. If this data came from a newer version, open the matching version. Reset only if you have a backup or deliberately want to discard the local account.</p>
          <div className='recovery-actions'>
            <button className='import-button' onClick={retryLoad} disabled={busy}>Retry loading</button>
            <button onClick={resetForRecovery} disabled={busy}>Reset local account…</button>
          </div>
        </section>
      </main>
    );
  }

  if (loadPhase === 'loading') {
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

      <aside className='desktop-sidebar' aria-label='Primary and secondary navigation'>
        <Brand />
        <div className='navigation-section-label'>WORKSPACE</div>
        {primaryNavigation.map(item => (
          <NavButton key={item.id} icon={<NavigationIcon icon={item.icon} />} label={item.label}
            active={isNavigationActive(page, item.id)} onClick={() => navigate(item.id)} />
        ))}
        <div className='navigation-section-label secondary-label'>LIBRARY & SETTINGS</div>
        {secondaryNavigation.map(item => (
          <NavButton key={item.id} icon={<NavigationIcon icon={item.icon} />} label={item.label}
            active={isNavigationActive(page, item.id)} onClick={() => navigate(item.id)} />
        ))}
        <NavButton icon={<Menu />} label='More' active={page === 'more'} onClick={() => navigate('more')} />
        <div className='navigation-footer'>LOCAL-FIRST · ALPHA</div>
      </aside>

      <main className='main'>
        <header className={page === 'detail' ? 'topbar topbar-detail' : 'topbar'}>
          <div className='topbar-copy'>
            <Brand compact />
            {page === 'detail' && (
              <button className='icon-button back' aria-label='Back to Pokédex' onClick={() => navigate('dex')}>
                <ArrowLeft />
              </button>
            )}
          </div>
          <div className='topbar-actions'>
            <button type='button' className='more-nav-trigger' aria-label='More navigation' onClick={() => navigate('more')}>
              <Menu aria-hidden='true' /> <span>More</span>
            </button>
          <button className='import-button' onClick={() => saveInput.current?.click()} disabled={busy}>
            {busy ? <RefreshCw className='spin' /> : <Import />}
            <span>{busy ? 'Importing' : 'Import'}</span>
          </button>
          </div>
        </header>

        <div className='content'>
          <div className='page-heading'>
            <h1>{pageTitles[page]}</h1>
            <p>{current?.demo ? 'Sample collection · Local only' : 'Local companion · On this device'}</p>
          </div>
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
          {page === 'detail' && <DetailPage pokemon={selected} data={data} onTeam={() => navigate('build')} />}
          {page === 'build' && <TeamsPage data={data} teamIndex={teamIndex} setTeamIndex={setTeamIndex} onPokemon={openPokemon} />}
          {page === 'goals' && <HuntPage data={data} onPokemon={openPokemon} />}
          {page === 'fusion' && <FusionPage data={data} />}
          {page === 'trainer' && <TrainerPage data={data} />}
          {page === 'run' && <RunPage state={state} />}
          {page === 'modules' && <ModulesPage />}
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

        <nav className='bottom-nav' aria-label='Primary navigation'>
          {primaryNavigation.map(item => (
            <NavButton key={item.id} icon={<NavigationIcon icon={item.icon} />} label={item.label}
              active={isNavigationActive(page, item.id)} onClick={() => navigate(item.id)} />
          ))}
        </nav>
      </main>

      {toast && <div className='toast'><Check /> {toast}</div>}
    </div>
  );
}


export default App;

