import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { NavigationItem, Page } from '../../app/navigation';
import { NavigationIcon } from './Navigation';

/** Nonmodal navigation: the current feature stays mounted underneath. */
export function MorePopover({ items, page, onNavigate, onClose }: {
  items: readonly NavigationItem[];
  page: Page;
  onNavigate: (page: Page) => void;
  onClose: (restoreFocus?: boolean) => void;
}) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    const pointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && !panel.current?.contains(target) && !target.closest('[data-more-toggle]')) onClose(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    };
    const focus = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof Element && !panel.current?.contains(target) && !target.closest('[data-more-toggle]')) onClose(false);
    };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', keyboard);
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', keyboard);
      document.removeEventListener('focusin', focus);
    };
  }, [onClose]);
  return <>
    <div className='more-backdrop' aria-hidden='true' />
    <nav id='more-popover' className='more-popover' aria-label='Library and settings' ref={panel}>
      <div className='more-popover-heading'><strong>More</strong><button className='icon-button' aria-label='Close More navigation' onClick={() => onClose()}><X aria-hidden='true' /></button></div>
      {items.map(item => <button key={item.id} className='more-popover-link' aria-current={page === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
        <NavigationIcon icon={item.icon} /><span>{item.label}{item.status !== 'available' && <small>{item.status === 'preview' ? 'Preview' : 'Planned'}</small>}</span>
      </button>)}
    </nav>
  </>;
}
