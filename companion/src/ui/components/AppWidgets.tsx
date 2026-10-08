import { ChevronRight, Database, Sparkles } from 'lucide-react';
import type { AppState } from '../../domain/types';

export function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <div className={'kpi tone-' + tone}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
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
        <span>{change.category} • {change.before} → {change.after}</span>
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
  return <div className='empty-panel'><Database /><div><strong>No account loaded</strong><span>Import a PokéRogue .prsv from the Import button.</span></div></div>;
}

export function fmt(value:unknown) {
  return typeof value==='number' ? value.toLocaleString() : Number(value||0).toLocaleString();
}

