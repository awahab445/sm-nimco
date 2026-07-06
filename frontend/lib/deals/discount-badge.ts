function normalizePercent(percent: number): number {
  return Math.round(Number(percent) * 100) / 100;
}

/**
 * Same source as the green "Save … (7.32%)" line:
 * API savingsPercent, or (savingsAmount / compareAtTotal) * 100.
 */
export function getBundleDiscountPercent(deal: {
  savingsAmount: number;
  savingsPercent: number | null;
  compareAtTotal: number;
}): number | null {
  if (deal.savingsAmount <= 0) return null;

  const percent =
    deal.savingsPercent != null
      ? Number(deal.savingsPercent)
      : deal.compareAtTotal > 0
        ? (deal.savingsAmount / deal.compareAtTotal) * 100
        : 0;

  return percent > 0 ? normalizePercent(percent) : null;
}

/** Circle headline — rounded integer, e.g. 7.32 → "7%". */
export function formatBundleDiscountBadgePercentLine(percent: number): string {
  return `${Math.round(normalizePercent(percent))}%`;
}

/** Accessible label, e.g. "7% off". */
export function getBundleDiscountAriaLabel(percent: number): string {
  return `${formatBundleDiscountBadgePercentLine(percent)} off`;
}
