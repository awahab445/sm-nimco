'use client';

import { formatPrice } from '@/lib/currency';

type Props = {
  subtotal: number;
  currency: string;
  minimumOrderAmount: number;
  freeDeliveryThreshold: number;
  /** Compact single-line mode for the mobile mini-cart bar. */
  compact?: boolean;
};

/**
 * Progress toward minimum order and/or free delivery thresholds.
 */
export function CartThresholdProgress({
  subtotal,
  currency,
  minimumOrderAmount,
  freeDeliveryThreshold,
  compact = false,
}: Props) {
  const minGap = Math.max(0, minimumOrderAmount - subtotal);
  const freeGap =
    freeDeliveryThreshold > 0 ? Math.max(0, freeDeliveryThreshold - subtotal) : 0;
  const meetsMin = subtotal >= minimumOrderAmount;
  const qualifiesFree = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold;

  let target = minimumOrderAmount;
  let remaining = minGap;
  let message: string;
  let progressPct = 0;

  if (!meetsMin && minimumOrderAmount > 0) {
    target = minimumOrderAmount;
    remaining = minGap;
    progressPct = Math.min(100, Math.round((subtotal / minimumOrderAmount) * 100));
    message = `Add ${formatPrice(remaining, currency)} more to place your order`;
  } else if (freeDeliveryThreshold > 0 && !qualifiesFree) {
    target = freeDeliveryThreshold;
    remaining = freeGap;
    progressPct = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
    message = `Add ${formatPrice(remaining, currency)} more to unlock Free Shipping!`;
  } else if (qualifiesFree) {
    progressPct = 100;
    message = 'You have unlocked Free Shipping!';
  } else {
    progressPct = 100;
    message = 'Minimum order met — ready to checkout';
  }

  if (compact) {
    return (
      <div className="w-full" aria-live="polite">
        <div className="h-1 w-full overflow-hidden bg-black/25">
          <div
            className="h-full bg-[var(--brand-gold-primary,#d4af37)] transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="truncate px-3 pt-1 text-[10px] font-medium leading-tight text-[var(--brand-gold-primary,#d4af37)]/85">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-sm border border-[color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_30%,transparent)] bg-[color-mix(in_srgb,var(--brand-purple-dark,#1e1035)_4%,transparent)] px-3 py-2.5"
      aria-live="polite"
    >
      <p className="text-xs font-medium text-foreground">{message}</p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--brand-purple-dark,#1e1035)_12%,transparent)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(subtotal, target)}
        aria-label="Cart threshold progress"
      >
        <div
          className="h-full rounded-full bg-[var(--brand-gold-primary,#d4af37)] transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
