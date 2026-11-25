import { buildPolicyPageDefault } from '@/lib/cms/policy-pages';
import { formatPhone } from '@/lib/store-facts';

describe('policy defaults', () => {
  const facts = {
    storeName: 'SM Nimco',
    phone: '923001234567',
    email: null,
    freeDeliveryThreshold: 2000,
    paymentMethods: ['Cash on Delivery'],
  };

  it('formats Pakistani numbers', () => {
    expect(formatPhone('923001234567')).toBe('+92 300 1234567');
  });

  it('shipping page states payment, free-delivery rule and contact', () => {
    const html = buildPolicyPageDefault('shipping-returns', facts).contentHtml;
    expect(html).toContain('Cash on Delivery');
    expect(html).toContain('2,000');
    expect(html).toContain('+92 300 1234567');
    expect(html).toContain('Change of mind');
  });
});
