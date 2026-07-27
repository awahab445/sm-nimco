'use client';

import { useState, type MouseEvent } from 'react';
import { useWishlistStore } from '@/lib/wishlist.store';
import { showStorefrontToast } from '@/lib/storefront-toast';

function HeartIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

type Variant = 'icon' | 'card' | 'pdp' | 'quick';

const variantClass: Record<Variant, string> = {
  icon: '',
  card: 'product-card__action-btn pointer-events-auto',
  pdp: 'inline-flex h-10 w-10 shrink-0 items-center justify-center border border-foreground text-foreground transition-colors hover:border-[var(--navbar-link-hover,var(--primary-hover))] hover:text-[var(--navbar-link-hover,var(--primary-hover))]',
  quick:
    'product-quick-view__icon-btn inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-background text-foreground transition-colors hover:border-[var(--navbar-link-hover,var(--primary-hover))] hover:text-[var(--navbar-link-hover,var(--primary-hover))] disabled:cursor-not-allowed disabled:opacity-50',
};

type Props = {
  productId: string;
  variant?: Variant;
  className?: string;
  iconClassName?: string;
  /** Stop click from bubbling (product cards / links). */
  stopPropagation?: boolean;
};

/**
 * Toggle heart — works for guests (localStorage) and authenticated users (API).
 * Filled state uses theme accent (--navbar-link-hover / --btn-accent).
 */
export function WishlistToggleButton({
  productId,
  variant = 'icon',
  className = '',
  iconClassName = 'h-5 w-5',
  stopPropagation = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const inWishlist = useWishlistStore((s) => s.productIds.includes(productId));
  const toggle = useWishlistStore((s) => s.toggle);

  const handleClick = async (e: MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!productId || busy) return;
    setBusy(true);
    try {
      await toggle(productId);
      showStorefrontToast(
        inWishlist ? 'Removed from wishlist' : 'Added to wishlist',
        'success',
      );
    } catch {
      showStorefrontToast('Could not update wishlist', 'error');
    } finally {
      setBusy(false);
    }
  };

  const base = variantClass[variant];
  const activeColor = inWishlist
    ? 'text-[var(--navbar-link-hover,var(--primary-hover))] border-[var(--navbar-link-hover,var(--primary-hover))]'
    : '';

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={handleClick}
      disabled={busy}
      className={`${base} ${activeColor} ${className}`.trim()}
      style={
        variant === 'pdp'
          ? { borderRadius: 'var(--radius-button, var(--radius-md, 0.375rem))' }
          : undefined
      }
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inWishlist}
      title={inWishlist ? 'Remove from wishlist' : 'Wishlist'}
    >
      <HeartIcon className={iconClassName} filled={inWishlist} />
    </button>
  );
}
