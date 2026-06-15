import {
  fulfillmentStatusBadgeClass,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '../order-status-badges';

describe('order-status-badges', () => {
  it('returns theme token classes for known statuses', () => {
    expect(orderStatusBadgeClass('pending')).toContain('warning');
    expect(orderStatusBadgeClass('completed')).toContain('brand-secondary');
    expect(paymentStatusBadgeClass('paid')).toContain('brand-secondary');
    expect(fulfillmentStatusBadgeClass('shipped')).toContain('brand-secondary');
    expect(fulfillmentStatusBadgeClass('delivered')).toContain('brand-accent');
  });

  it('falls back to muted for unknown status', () => {
    expect(orderStatusBadgeClass('unknown')).toContain('brand-secondary');
  });
});
