import { APP_CURRENCY, DEFAULT_CURRENCY, formatPrice, formatPriceWhole } from '../currency';

describe('currency', () => {
  it('APP_CURRENCY should be a non-empty ISO-style code', () => {
    expect(typeof APP_CURRENCY).toBe('string');
    expect(APP_CURRENCY.length).toBe(3);
  });

  it('DEFAULT_CURRENCY should match APP_CURRENCY', () => {
    expect(DEFAULT_CURRENCY).toBe(APP_CURRENCY);
  });

  it('formatPrice should format numeric values', () => {
    expect(formatPrice(100, 'PKR')).toMatch(/100/);
  });

  it('formatPriceWhole should omit fractional digits', () => {
    expect(formatPriceWhole(99.5, 'PKR')).not.toMatch(/\.50/);
  });
});
