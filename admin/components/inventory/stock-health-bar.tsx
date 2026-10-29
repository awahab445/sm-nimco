'use client';

import { statusPillClass, stockHealthTone } from '@/lib/status-tones';

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
  const capacity = Math.max(threshold * 3, 10);
  return Math.max(0, Math.min(100, Math.round((available / capacity) * 100)));
}

const LEVEL_BAR: Record<StockHealthLevel, string> = {
  healthy: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  low: 'bg-brand-gradient',
  out: 'bg-gradient-to-r from-red-600 to-red-500',
};

const LEVEL_LABEL: Record<StockHealthLevel, string> = {
  healthy: 'Healthy',
  low: 'Low',
  out: 'Out of stock',
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

  return (
    <div className={`min-w-[7rem] max-w-[11rem] ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold tabular-nums text-foreground">
          {availableQuantity}
        </span>
        {showLabel ? (
          <span className={statusPillClass(stockHealthTone(level))}>
            {LEVEL_LABEL[level]}
          </span>
        ) : null}
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-200/80 dark:bg-stone-800"
        role="meter"
        aria-valuenow={availableQuantity}
        aria-valuemin={0}
        aria-label={`Stock health: ${LEVEL_LABEL[level]}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${LEVEL_BAR[level]}`}
          style={{ width: `${level === 'out' ? 0 : Math.max(fill, 6)}%` }}
        />
      </div>
    </div>
  );
}
