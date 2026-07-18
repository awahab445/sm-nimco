'use client';

import { useLayoutEffect, useRef } from 'react';

export type RevealVariant = 'slide-in' | 'fade-in';

export type UseRevealOnScrollOptions = {
  variant?: RevealVariant;
  /** When true, stagger via `--reveal-order` (Kalles `timeline`). */
  timeline?: boolean;
  /** Stagger index; delay = order * 75ms. */
  order?: number;
  rootMargin?: string;
  /** Force on/off; default enables only for essa_chemicals. */
  enabled?: boolean;
};

const ENABLE_CLASS = 'store-reveal-enabled';
const DEFAULT_ROOT_MARGIN = '0px 0px -50px 0px';

function shouldEnableReveal(explicit?: boolean): boolean {
  if (explicit === false) return false;
  if (explicit === true) return true;
  return document.documentElement.getAttribute('data-store-theme') === 'essa_chemicals';
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function markRevealed(el: HTMLElement) {
  el.classList.add('is-in-view');
  el.setAttribute('data-reveal-done', '');
}

/**
 * Kalles-equivalent scroll reveal:
 * IntersectionObserver → `.is-in-view` → CSS keyframes → `animationend` sets `data-reveal-done`.
 * DOM attributes/classes are updated imperatively (no React state) to avoid flash cascades.
 */
export function useRevealOnScroll(options: UseRevealOnScrollOptions = {}) {
  const {
    timeline = false,
    order = 0,
    rootMargin = DEFAULT_ROOT_MARGIN,
    enabled: enabledOption,
  } = options;

  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!shouldEnableReveal(enabledOption)) {
      markRevealed(el);
      return;
    }

    document.documentElement.classList.add(ENABLE_CLASS);

    if (prefersReducedMotion()) {
      markRevealed(el);
      return;
    }

    if (timeline) {
      el.style.setProperty('--reveal-order', String(order));
    }

    const onEnd = (event: AnimationEvent) => {
      if (event.target !== el) return;
      el.setAttribute('data-reveal-done', '');
      el.removeEventListener('animationend', onEnd);
    };
    el.addEventListener('animationend', onEnd);

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          if (timeline && !target.style.getPropertyValue('--reveal-order')) {
            target.style.setProperty('--reveal-order', String(index));
          }
          target.classList.add('is-in-view');
          obs.unobserve(target);
        });
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener('animationend', onEnd);
    };
  }, [timeline, order, rootMargin, enabledOption]);

  return { ref };
}
