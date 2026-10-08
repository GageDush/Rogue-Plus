import type { ReactNode } from 'react';
import { BookOpen, Boxes, Database, FlaskConical, History, House, Menu, Play, Puzzle, Target, UserRound } from 'lucide-react';
import type { NavIconId } from '../../app/navigation';

const icons = {
  home: House,
  dex: BookOpen,
  build: Boxes,
  run: Play,
  goals: Target,
  fusion: FlaskConical,
  trainer: UserRound,
  history: History,
  modules: Puzzle,
  more: Menu,
  settings: Database,
} satisfies Record<NavIconId, typeof House>;

export function NavigationIcon({ icon }: { icon: NavIconId }) {
  const IconComponent = icons[icon];
  return <IconComponent aria-hidden='true' />;
}

export function Brand() {
  return (
    <div className='brand'>
      <div className='brand-mark' aria-hidden='true'>R<span>+</span></div>
      <div className='brand-copy'>
        <strong>ROGUE<span className='brand-plus'>+</span></strong>
        <span>POKÉROGUE COMPANION</span>
      </div>
    </div>
  );
}

export function NavButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type='button' className={'nav-button ' + (active ? 'active' : '')} aria-current={active ? 'page' : undefined} onClick={onClick}>
      {icon}<span>{label}</span>
    </button>
  );
}
