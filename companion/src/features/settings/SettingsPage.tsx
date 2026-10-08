import { Download, FlaskConical, Info, ShieldCheck, Trash2, Upload } from 'lucide-react';
import type { AppState } from '../../domain/types';
import type { StorageStatus } from '../../store';
import { DataLine } from '../../ui/components/AppWidgets';

export function SettingsPage({
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

