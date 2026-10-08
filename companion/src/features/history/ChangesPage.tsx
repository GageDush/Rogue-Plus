import { History } from 'lucide-react';
import type { AppState } from '../../domain/types';
import { ChangeCard, EmptyInline, Kpi } from '../../ui/components/AppWidgets';

export function ChangesPage({ state }: { state: AppState }) {
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

