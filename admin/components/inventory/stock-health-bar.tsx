'use client';

export type StockHealthLevel = 'healthy' | 'low' | 'out';

export function resolveStockHealth(
  availableQuantity: number,
  lowStockThreshold?: number | null,
): StockHealthLevel {
  const available = Math.max(0, Number(availableQuantity) || 0);
  if (available <= 0) return 'out';
  const threshold =
    typeof lowStockThreshold === 'number' && Number.isFinite(lowStockThreshold)
      ? Math.max(0, lowStockThreshold)
      : 5;
  if (available <= threshold) return 'low';
  return 'healthy';
}

export function stockHealthFillPercent(
  availableQuantity: number,
  lowStockThreshold?: number | null,
): number {
  const available = Math.max(0, Number(availableQuantity) || 0);
  const threshold =
    typeof lowStockThreshold === 'number' &&
    Number.isFinite(lowStockThreshold) &&
    lowStockThreshold > 0
      ? lowStockThreshold
      : 5;
  // Visual capacity: ~3× threshold so healthy stock fills most of the bar.
  const capacity = Math.max(threshold * 3, 10);
  return Math.max(0, Math.min(100, Math.round((available / capacity) * 100)));
}

const LEVEL_STYLES: Record<
  StockHealthLevel,
  { bar: string; label: string; text: string }
> = {
  healthy: {
    bar: 'bg-emerald-500 dark:bg-emerald-400',
    label: 'Healthy',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  low: {
    bar: 'bg-amber-500 dark:bg-amber-400',
    label: 'Low',
    text: 'text-amber-700 dark:text-amber-300',
  },
  out: {
    bar: 'bg-red-500 dark:bg-red-400',
    label: 'Out of stock',
    text: 'text-red-700 dark:text-red-300',
  },
};

export function StockHealthBar({
  availableQuantity,
  lowStockThreshold,
  showLabel = true,
  className = '',
}: {
  availableQuantity: number;
  lowStockThreshold?: number | null;
  showLabel?: boolean;
  className?: string;
}) {
  const level = resolveStockHealth(availableQuantity, lowStockThreshold);
  const fill = stockHealthFillPercent(availableQuantity, lowStockThreshold);
  const styles = LEVEL_STYLES[level];

  return (
    <div className={`min-w-[7rem] max-w-[11rem] ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {availableQuantity}
        </span>
        {showLabel ? (
          <span className={`text-[10px] font-medium uppercase tracking-wide ${styles.text}`}>
            {styles.label}
          </span>
        ) : null}
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        role="meter"
        aria-valuenow={availableQuantity}
        aria-valuemin={0}
        aria-label={`Stock health: ${styles.label}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${styles.bar}`}
          style={{ width: `${level === 'out' ? 0 : Math.max(fill, 6)}%` }}
        />
      </div>
    </div>
  );
}
