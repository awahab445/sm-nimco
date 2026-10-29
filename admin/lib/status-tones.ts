/**
 * Shared pill badge tones for orders, products, and inventory health.
 */

export type StatusTone = 'neutral' | 'pending' | 'dispatched' | 'success' | 'danger' | 'info';

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral:
    'bg-stone-200/80 text-stone-800 ring-1 ring-inset ring-stone-300/60 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-600',
  pending:
    'bg-amber-100 text-amber-950 ring-1 ring-inset ring-amber-300/70 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-700/50',
  dispatched:
    'bg-orange-100 text-orange-950 ring-1 ring-inset ring-orange-300/70 dark:bg-orange-950/45 dark:text-orange-200 dark:ring-orange-700/50',
  success:
    'bg-emerald-100 text-emerald-950 ring-1 ring-inset ring-emerald-300/70 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-700/50',
  danger:
    'bg-red-100 text-red-950 ring-1 ring-inset ring-red-300/70 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-800/50',
  info:
    'bg-sky-100 text-sky-950 ring-1 ring-inset ring-sky-300/70 dark:bg-sky-950/45 dark:text-sky-200 dark:ring-sky-700/50',
};

export function statusPillClass(tone: StatusTone): string {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${TONE_CLASSES[tone]}`;
}

/** Map order status → visual tone (Pending / Dispatched / Delivered / Cancelled). */
export function orderStatusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'delivered') return 'success';
  if (s === 'cancelled') return 'danger';
  if (
    s === 'processing' ||
    s === 'ready_for_pickup' ||
    s === 'shipped' ||
    s === 'dispatched'
  ) {
    return 'dispatched';
  }
  if (s === 'pending') return 'pending';
  return 'neutral';
}

export function paymentStatusTone(
  status: string | null | undefined,
): StatusTone {
  if (status === 'paid') return 'success';
  if (status === 'failed' || status === 'refunded') return 'danger';
  if (status === 'pending') return 'pending';
  return 'neutral';
}

export function productStatusTone(status: string): StatusTone {
  if (status === 'active') return 'success';
  if (status === 'draft') return 'pending';
  return 'neutral';
}

export function stockHealthTone(
  level: 'healthy' | 'low' | 'out',
): StatusTone {
  if (level === 'healthy') return 'success';
  if (level === 'low') return 'pending';
  return 'danger';
}
