import { ChevronRight, Database, Sparkles } from 'lucide-react';
import { shinyLabel } from '../view-models';
import type { AppState } from '../../domain/types';

export function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <div className={'kpi tone-' + tone}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

export function CollectionProgress({ label, value, total, tone, note }: { label: string; value: number; total: number; tone: string; note?: string }) {
  const known = Number.isFinite(value) && Number.isFinite(total) && total > 0 && value >= 0;
  const percent = known ? Math.min(100, Math.max(0, value / total * 100)) : 0;
  return <div className={'kpi collection-progress tone-' + tone}>
    <span>{label}</span>
    <div className='progress-summary'><strong>{known ? (value >= total ? 100 : Math.min(99, Math.round(percent))) + '%' : '—'}</strong><small>{known ? value.toLocaleString() + ' / ' + total.toLocaleString() : 'Total unavailable'}</small></div>
    <div className='collection-track' role={known ? 'progressbar' : undefined} aria-label={label} aria-valuemin={known ? 0 : undefined} aria-valuemax={known ? total : undefined} aria-valuenow={known ? Math.min(value, total) : undefined} aria-valuetext={known ? value.toLocaleString() + ' of ' + total.toLocaleString() : undefined}><span style={{ width: percent + '%' }} /></div>
    {note && <small>{note}</small>}
  </div>;
}

export function SectionHeading({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) {
  return <div className='section-heading'><h2>{title}</h2>{action && <button onClick={onClick}>{action}<ChevronRight /></button>}</div>;
}

export function ChangeCard({ change }: { change: AppState['history'][number] }) {
  const tone = change.importance === 'Major' ? 'gold' : change.importance === 'Team' ? 'purple' : change.importance === 'Complete' ? 'green' : 'blue';
  return (
    <div className='change-card'>
      <div className={'change-icon tone-' + tone}><Sparkles /></div>
      <div>
        <strong>{change.pokemon}</strong>
        <span>{shinyLabel(change.category)} • {shinyLabel(change.before)} → {shinyLabel(change.after)}</span>
        {change.teamImpact && <small>TEAM IMPACT • {change.teamImpact}</small>}
      </div>
    </div>
  );
}


export function DataLine({ label, value }: { label: string; value: string | number }) {
  return <div className='data-line'><span>{label}</span><strong>{String(value)}</strong></div>;
}


export function SaveMeta({ current }: { current: NonNullable<AppState['current']> }) {
  return <div className='save-meta'><Database /><span><strong>{current.sourceFile}</strong><small>{new Date(current.saveTimestamp).toLocaleString()} • game {current.gameVersion} • schema {current.schemaVersion ?? 'legacy'}</small></span></div>;
}

export function EmptyInline() {
  return <div className='empty-panel'><Database /><div><strong>No account loaded</strong><span>Import a PokéRogue .prsv from Home or More → Import / Settings.</span></div></div>;
}

export function fmt(value:unknown) {
  return typeof value==='number' ? value.toLocaleString() : Number(value||0).toLocaleString();
}


