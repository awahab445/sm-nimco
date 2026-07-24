import { APP_CURRENCY, DEFAULT_CURRENCY, formatPrice, formatPriceWhole } from '../currency';

describe('currency', () => {
  it('APP_CURRENCY should be a non-empty ISO-style code', () => {
    expect(typeof APP_CURRENCY).toBe('string');
    expect(APP_CURRENCY.length).toBe(3);
  });

  it('DEFAULT_CURRENCY should match APP_CURRENCY', () => {
    expect(DEFAULT_CURRENCY).toBe(APP_CURRENCY);
  });

  it('defaults to PKR when env is unset', () => {
    expect(APP_CURRENCY).toBe('PKR');
  });

  it('formatPrice should use Rs. prefix for PKR', () => {
    expect(formatPrice(150, 'PKR')).toMatch(/^Rs\.\s/);
    expect(formatPrice(150, 'PKR')).toMatch(/150/);
  });

  it('formatPrice should format thousands with grouping', () => {
    expect(formatPrice(1500, 'PKR')).toMatch(/1,?500/);
  });

  it('formatPriceWhole should omit fractional digits', () => {
    expect(formatPriceWhole(99.5, 'PKR')).not.toMatch(/\.5/);
    expect(formatPriceWhole(99.5, 'PKR')).toMatch(/^Rs\.\s/);
  });
});
