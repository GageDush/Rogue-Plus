import type { ReactNode } from 'react';
import { ChevronRight, Database, FlaskConical, History, UserRound } from 'lucide-react';
import type { Page } from '../../app/navigation';

export function MorePage({ navigate }: { navigate: (page:Page)=>void }) {
  const links:Array<[Page,ReactNode,string,string]> = [
    ['fusion',<FlaskConical />,'Fusion Lab','Versioned fusion recipes and source notes'],
    ['trainer',<UserRound />,'Trainer','Career stats, vouchers and completion'],
    ['changes',<History />,'Change Log','Permanent before / after history'],
    ['settings',<Database />,'Import / Settings','Save import, backups and local storage'],
  ];
  return <div className='more-grid'>{links.map(([target,icon,title,note]) => <button key={target} className='more-card' onClick={() => navigate(target)}><div className='more-icon'>{icon}</div><div><h3>{title}</h3><p>{note}</p></div><ChevronRight /></button>)}</div>;
}

