'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { lockBodyScroll } from '@/lib/body-scroll-lock';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    return el.offsetParent !== null || el === document.activeElement;
  });
}

export type UseOverlayA11yOptions = {
  open: boolean;
  onClose: () => void;
  /** Element that contains focusable controls (dialog / drawer panel). */
  containerRef: RefObject<HTMLElement | null>;
  /** Prefer focusing this node on open (e.g. search input). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Explicit restore target; defaults to the previously focused element. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Shared overlay behavior: Escape to close, refcounted body scroll lock,
 * focus trap, initial focus, and restore focus on close.
 */
export function useOverlayA11y({
  open,
  onClose,
  containerRef,
  initialFocusRef,
  returnFocusRef,
}: UseOverlayA11yOptions) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      returnFocusRef?.current ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);

    const unlock = lockBodyScroll();

    const focusTimer = window.setTimeout(() => {
      const container = containerRef.current;
      const preferred = initialFocusRef?.current;
      if (preferred) {
        preferred.focus();
        return;
      }
      if (!container) return;
      const focusables = getFocusable(container);
      (focusables[0] ?? container).focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusables = getFocusable(container);
      if (focusables.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    const restoreTarget =
      returnFocusRef?.current ?? previouslyFocusedRef.current;

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      unlock();
      if (restoreTarget && document.contains(restoreTarget)) {
        restoreTarget.focus();
      }
    };
  }, [open, containerRef, initialFocusRef, returnFocusRef]);
}
