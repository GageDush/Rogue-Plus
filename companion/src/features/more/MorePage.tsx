import { ChevronRight } from 'lucide-react';
import { secondaryNavigation, type Page } from '../../app/navigation';
import { NavigationIcon } from '../../ui/components/Navigation';

export function MorePage({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <>
      <div className='feature-intro'><span className='feature-kicker'>ROGUE+ LIBRARY</span><p>Tools, progress history, and local data management. Experimental tools are clearly labeled.</p></div>
      <div className='more-grid'>
        {secondaryNavigation.map(item => (
          <button key={item.id} type='button' className='more-card' onClick={() => navigate(item.id)}>
            <div className='more-icon'><NavigationIcon icon={item.icon} /></div>
            <div>
              <h3>{item.label} {item.status !== 'available' ? <small className='feature-status'>{item.status === 'preview' ? 'Preview' : 'Planned'}</small> : null}</h3>
              <p>{item.description}</p>
            </div>
            <ChevronRight aria-hidden='true' />
          </button>
        ))}
      </div>
    </>
  );
}
