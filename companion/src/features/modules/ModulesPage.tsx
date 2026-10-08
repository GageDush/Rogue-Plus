import { FlaskConical, Puzzle, ShieldCheck } from 'lucide-react';
import { runtimeConfig } from '../../app/config';

export function ModulesPage() {
  return (
    <section className='feature-hero feature-hero--modules'>
      <span className='feature-kicker'>MODULE REGISTRY · PLANNED</span>
      <h2>Make Rogue+ yours.</h2>
      <p>Optional modules will eventually have explicit enable/disable controls, compatibility requirements and limited capabilities. Module management is not enabled in this build.</p>
      <div className='module-preview'>
        <div className='module-preview-icon'><FlaskConical aria-hidden='true' /></div>
        <div>
          <strong>Damage Preview <small className='feature-status'>Experimental</small></strong>
          <p>Available only in the isolated Guest-mode PokéRogue preview.</p>
          <a href={runtimeConfig.playPreviewUrl} target='_blank' rel='noreferrer noopener'>Open Play preview</a>
        </div>
      </div>
      <div className='feature-disclaimer'><ShieldCheck aria-hidden='true' /> Only reviewed, bundled modules will be supported initially. No remote scripts or access to your private saves.</div>
      <div className='feature-illustration' aria-hidden='true'><Puzzle /></div>
    </section>
  );
}
