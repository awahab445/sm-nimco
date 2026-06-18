import { getOrderShippingFee, normalizeOrderTotals, parseOrderAmount } from '../order-totals';

describe('order-totals', () => {
  it('reads shipping from shippingTotal, shippingFee, or shippingPrice', () => {
    expect(getOrderShippingFee({ shippingTotal: 99 })).toBe(99);
    expect(getOrderShippingFee({ shippingFee: '150' })).toBe(150);
    expect(getOrderShippingFee({ shippingPrice: '200.5' })).toBe(200.5);
  });

  it('computes grand total when missing from API', () => {
    const totals = normalizeOrderTotals({
      subtotal: '1000',
      discountTotal: '100',
      shippingTotal: '99',
      taxTotal: '0',
      grandTotal: '0',
    });
    expect(totals.shippingTotal).toBe(99);
    expect(totals.grandTotal).toBe(999);
  });

  it('parses decimal strings from Prisma', () => {
    expect(parseOrderAmount('32.87')).toBe(32.87);
  });
});
