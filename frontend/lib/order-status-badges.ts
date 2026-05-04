/** Semantic badge styles for order / payment / fulfillment status (theme tokens). */
const muted = 'bg-muted text-muted-foreground ring-1 ring-inset ring-border';
const warning = 'bg-warning/15 text-warning ring-1 ring-inset ring-warning/25';
const primary = 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20';
const success = 'bg-success/15 text-success ring-1 ring-inset ring-success/25';
const destructive = 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20';

export function orderStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: warning,
    processing: primary,
    completed: success,
    cancelled: destructive,
  };
  return map[status] ?? muted;
}

export function paymentStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: warning,
    paid: success,
    failed: destructive,
    refunded: muted,
  };
  return map[status] ?? muted;
}

export function fulfillmentStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    unfulfilled: muted,
    fulfilled: success,
    shipped: primary,
    delivered: success,
    cancelled: destructive,
  };
  return map[status] ?? muted;
}
