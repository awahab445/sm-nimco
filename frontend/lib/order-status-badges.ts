/** Semantic badge styles for order / payment / fulfillment status (brand palette). */
const brandMuted =
  'bg-brand-secondary/25 text-brand-text/80 ring-1 ring-inset ring-brand-secondary/35';
const brandProgress =
  'bg-brand-secondary/50 text-brand-accent ring-1 ring-inset ring-brand-primary/20';
const brandComplete =
  'bg-brand-secondary/55 text-brand-accent ring-1 ring-inset ring-brand-secondary/60';
const warning = 'bg-warning/12 text-warning ring-1 ring-inset ring-warning/20';
const destructive = 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function formatOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: warning,
    processing: brandProgress,
    ready_for_pickup: brandProgress,
    completed: brandComplete,
    cancelled: destructive,
  };
  return map[status] ?? brandMuted;
}

export function paymentStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: warning,
    paid: brandComplete,
    failed: destructive,
    refunded: brandMuted,
  };
  return map[status] ?? brandMuted;
}

export function fulfillmentStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    unfulfilled: brandMuted,
    fulfilled: brandProgress,
    shipped: brandProgress,
    delivered: brandComplete,
    cancelled: destructive,
  };
  return map[status] ?? brandMuted;
}
