import { APP_CURRENCY, DEFAULT_CURRENCY } from '../currency';

describe('config', () => {
  it('DEFAULT_CURRENCY should be a non-empty string', () => {
    expect(typeof DEFAULT_CURRENCY).toBe('string');
    expect(DEFAULT_CURRENCY.length).toBeGreaterThan(0);
  });

  it('DEFAULT_CURRENCY should match APP_CURRENCY', () => {
    expect(DEFAULT_CURRENCY).toBe(APP_CURRENCY);
  });

  it('APP_CURRENCY should be USD or PKR in typical envs', () => {
    expect(['USD', 'PKR']).toContain(APP_CURRENCY);
  });
});
