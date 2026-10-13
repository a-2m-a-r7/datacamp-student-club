import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

type Props = React.ComponentProps<typeof motion.div> & { onClose: () => void };
export function Dialog({ onClose, children, onClick, ...props }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = root.current;
    const focusables = () => Array.from(node?.querySelectorAll<HTMLElement>(
      'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]') || [])
      .filter(element => element.getClientRects().length > 0);
    (focusables()[0] || node)?.focus();
    const keydown = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== node) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key === 'Tab') {
        const elements = focusables(); const first = elements[0]; const last = elements[elements.length - 1];
        if (!first) { event.preventDefault(); node?.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus(); };
  }, []);
  return createPortal(<motion.div {...props} ref={root} role="dialog" aria-modal="true" tabIndex={-1}
    aria-label={props['aria-label'] || 'Dialog'} onClick={event => {
      onClick?.(event); if (event.target === event.currentTarget) close.current();
    }}>{children}</motion.div>, document.body);
}
