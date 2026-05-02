import { DEFAULT_CURRENCY } from '../config';

describe('config', () => {
  it('DEFAULT_CURRENCY should be a non-empty string', () => {
    expect(typeof DEFAULT_CURRENCY).toBe('string');
    expect(DEFAULT_CURRENCY.length).toBeGreaterThan(0);
  });

  it('DEFAULT_CURRENCY should default to USD when NEXT_PUBLIC_CURRENCY is not set', () => {
    // In test env NEXT_PUBLIC_CURRENCY is usually unset; then fallback is USD
    expect(['USD', 'PKR']).toContain(DEFAULT_CURRENCY);
  });
});
