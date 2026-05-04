import {
  fulfillmentStatusBadgeClass,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '../order-status-badges';

describe('order-status-badges', () => {
  it('returns theme token classes for known statuses', () => {
    expect(orderStatusBadgeClass('pending')).toContain('warning');
    expect(orderStatusBadgeClass('completed')).toContain('success');
    expect(paymentStatusBadgeClass('paid')).toContain('success');
    expect(fulfillmentStatusBadgeClass('shipped')).toContain('primary');
  });

  it('falls back to muted for unknown status', () => {
    expect(orderStatusBadgeClass('unknown')).toContain('muted');
  });
});
