'use client';

import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import {
  useRevealOnScroll,
  type RevealVariant,
  type UseRevealOnScrollOptions,
} from '@/lib/use-reveal-on-scroll';

export type RevealProps = Omit<HTMLAttributes<HTMLElement>, 'children'> &
  UseRevealOnScrollOptions & {
    as?: ElementType;
    children: ReactNode;
    variant?: RevealVariant;
  };

function mergeClassNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Scroll-triggered reveal wrapper (Kalles-style slide-in / fade-in).
 * Visual effect is CSS-scoped to `html[data-store-theme='essa_chemicals']`.
 */
export function Reveal({
  as: Tag = 'div',
  children,
  className,
  style,
  variant = 'slide-in',
  timeline = false,
  order = 0,
  rootMargin,
  enabled,
  ...rest
}: RevealProps) {
  const { ref } = useRevealOnScroll({
    variant,
    timeline,
    order,
    rootMargin,
    enabled,
  });

  const mergedStyle: CSSProperties = { ...style };
  if (timeline) {
    (mergedStyle as Record<string, string | number | undefined>)['--reveal-order'] = order;
  }

  return (
    <Tag
      {...rest}
      ref={ref}
      className={mergeClassNames('store-reveal', className)}
      style={mergedStyle}
      data-reveal={variant}
      {...(timeline ? { 'data-reveal-timeline': '' } : {})}
    >
      {children}
    </Tag>
  );
}
