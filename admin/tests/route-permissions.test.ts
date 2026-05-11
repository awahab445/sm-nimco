import { describe, expect, it } from 'vitest';
import { getRouteRequirement } from '../lib/route-permissions';

describe('getRouteRequirement', () => {
  it('returns empty array for dashboard (open to any signed-in admin)', () => {
    expect(getRouteRequirement('/')).toEqual([]);
  });

  it('matches /products/new before /products', () => {
    expect(getRouteRequirement('/products/new')).toEqual(['products.create']);
    expect(getRouteRequirement('/products/new/step')).toEqual(['products.create']);
  });

  it('requires products.read or products.update for product list routes', () => {
    expect(getRouteRequirement('/products')).toEqual(['products.read', 'products.update']);
    expect(getRouteRequirement('/products/abc')).toEqual(['products.read', 'products.update']);
  });

  it('requires products.read for categories and product-options', () => {
    expect(getRouteRequirement('/categories')).toEqual(['products.read']);
    expect(getRouteRequirement('/product-options')).toEqual(['products.read']);
  });

  it('returns null for paths with no rule', () => {
    expect(getRouteRequirement('/unknown-module')).toBeNull();
  });

  it('staff routes use most-specific first', () => {
    expect(getRouteRequirement('/staff/users/new')).toEqual(['admin.users.create']);
    expect(getRouteRequirement('/staff/users')).toEqual([
      'admin.users.read',
      'admin.users.update',
      'admin.users.create',
    ]);
  });
});
