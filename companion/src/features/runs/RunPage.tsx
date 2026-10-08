import { CalendarClock, ExternalLink, Info } from 'lucide-react';
import type { AppState } from '../../domain/types';
import { runtimeConfig } from '../../app/config';

export function RunPage({ state }: { state: AppState }) {
  const snapshot = state.current;
  return (
    <div className='feature-hero feature-hero--game'>
      <span className='feature-kicker'>RUNS · PLANNED</span>
      <h2>Your runs, in one place.</h2>
      <p>Session-file import, wave history, active teams and run analysis are not connected yet. Your imported SYSTEM save remains separate from individual run progress.</p>
      <div className='run-facts'>
        <div><small>LAST ACCOUNT IMPORT</small><strong>{snapshot ? new Date(snapshot.saveTimestamp).toLocaleDateString() : 'No account imported'}</strong></div>
        <div><small>ACCOUNT GAME VERSION</small><strong>{snapshot?.gameVersion || '—'}</strong></div>
      </div>
      <a className='secondary big feature-external-link' href={runtimeConfig.playPreviewUrl} target='_blank' rel='noreferrer noopener'>
        <ExternalLink aria-hidden='true' /> Open experimental Guest-mode Play
      </a>
      <div className='feature-disclaimer'><Info aria-hidden='true' /> Guest-mode Play uses a separate browser save, not your official PokéRogue account.</div>
      <div className='feature-illustration' aria-hidden='true'><CalendarClock /></div>
    </div>
  );
}
