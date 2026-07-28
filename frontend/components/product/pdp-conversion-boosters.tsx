'use client';

import { Leaf, ShieldCheck, Truck } from 'lucide-react';

const BADGES = [
  {
    icon: Leaf,
    title: '100% Fresh & Authentic',
    detail: 'Prepared with traditional recipes',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    detail: 'Dispatched quickly across Pakistan',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Checkout',
    detail: 'Encrypted payments you can trust',
  },
] as const;

/** Compact trust row shown under PDP Add to cart. */
export function PdpTrustReassurance() {
  return (
    <ul
      className="mt-4 grid grid-cols-1 gap-2.5 border-t border-border/50 pt-4 sm:grid-cols-3 sm:gap-3"
      aria-label="Shopping reassurance"
    >
      {BADGES.map(({ icon: Icon, title, detail }) => (
        <li
          key={title}
          className="flex items-start gap-2.5 rounded-sm bg-[color-mix(in_srgb,var(--brand-purple-dark,#1e1035)_4%,transparent)] px-2.5 py-2 sm:flex-col sm:items-center sm:px-2 sm:py-2.5 sm:text-center"
        >
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-purple-dark,#1e1035)] text-[var(--brand-gold-primary,#d4af37)] sm:mt-0">
            <Icon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--brand-purple-dark,#1e1035)]">{title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

type LowStockProps = {
  availableQty: number | undefined;
  /** Show urgency when stock is between 1 and this value (inclusive). */
  threshold?: number;
};

/** Urgency copy + thin meter when inventory is running low. */
export function PdpLowStockUrgency({ availableQty, threshold = 5 }: LowStockProps) {
  if (availableQty === undefined || availableQty <= 0 || availableQty > threshold) {
    return null;
  }

  const pct = Math.max(8, Math.round((availableQty / threshold) * 100));

  return (
    <div
      className="rounded-sm border border-[color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_45%,transparent)] bg-[color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_10%,transparent)] px-3 py-2.5"
      role="status"
    >
      <p className="text-xs font-semibold text-[var(--brand-purple-dark,#1e1035)]">
        Only {availableQty} left in stock — order soon!
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--brand-purple-dark,#1e1035)_12%,transparent)]"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-[var(--brand-gold-primary,#d4af37)] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
