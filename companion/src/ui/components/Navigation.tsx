import type { ReactNode } from 'react';

export function Brand() {
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

export function NavButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={'nav-button ' + (active ? 'active' : '')} onClick={onClick}>
      {icon}<span>{label}</span>
    </button>
  );
}

