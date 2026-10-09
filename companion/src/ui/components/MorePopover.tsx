import { useEffect, useLayoutEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { NavigationItem, Page } from '../../app/navigation';
import { NavigationIcon } from './Navigation';

/** Nonmodal navigation: the current feature stays mounted underneath. */
export function MorePopover({ anchor, items, page, onNavigate, onClose }: {
  anchor: HTMLElement | null;
  items: readonly NavigationItem[];
  page: Page;
  onNavigate: (page: Page) => void;
  onClose: (restoreFocus?: boolean) => void;
}) {
  const panel = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const position = () => {
      const element = panel.current;
      if (!element || !anchor) return;
      if (!anchor.getClientRects().length) { onClose(false); return; }
      if (window.matchMedia('(min-width: 980px)').matches) {
        const trigger = anchor.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        element.style.left = `${Math.min(trigger.right + 12, window.innerWidth - box.width - 16)}px`;
        element.style.right = 'auto';
        element.style.top = `${Math.max(16, Math.min(trigger.top, window.innerHeight - box.height - 16))}px`;
      } else {
        element.style.removeProperty('left');
        element.style.removeProperty('right');
        element.style.removeProperty('top');
      }
    };
    position();
    window.addEventListener('resize', position);
    return () => window.removeEventListener('resize', position);
  }, [anchor, onClose]);
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
