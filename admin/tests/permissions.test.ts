import { describe, expect, it } from 'vitest';
import {
  buildPermissionKey,
  hasAll,
  hasAny,
  hasPermission,
} from '../lib/permissions';

describe('permissions (client RBAC helpers)', () => {
  describe('buildPermissionKey', () => {
    it('builds dotted keys', () => {
      expect(buildPermissionKey('products', 'read')).toBe('products.read');
    });
  });

  describe('hasPermission', () => {
    it('returns false for empty keys', () => {
      expect(hasPermission([], 'products.read')).toBe(false);
      expect(hasPermission(undefined, 'products.read')).toBe(false);
    });

    it('matches exact key', () => {
      expect(hasPermission(['products.read'], 'products.read')).toBe(true);
    });

    it('treats admin.access.full as wildcard', () => {
      expect(hasPermission(['admin.access.full'], 'orders.read')).toBe(true);
    });

    it('treats * as wildcard', () => {
      expect(hasPermission(['*'], 'anything')).toBe(true);
    });

    it('products.manage implies products.read and products.update', () => {
      const keys = ['products.manage'];
      expect(hasPermission(keys, 'products.read')).toBe(true);
      expect(hasPermission(keys, 'products.update')).toBe(true);
      expect(hasPermission(keys, 'products.delete')).toBe(true);
      expect(hasPermission(keys, 'products.manage')).toBe(true);
    });

    it('products.manage does not imply orders.read', () => {
      expect(hasPermission(['products.manage'], 'orders.read')).toBe(false);
    });
  });

  describe('hasAny / hasAll', () => {
    it('hasAny is OR', () => {
      expect(hasAny(['a'], ['x', 'a'])).toBe(true);
      expect(hasAny(['a'], ['x', 'y'])).toBe(false);
    });

    it('hasAll is AND', () => {
      expect(hasAll(['a', 'b'], ['a', 'b'])).toBe(true);
      expect(hasAll(['a'], ['a', 'b'])).toBe(false);
    });

    it('hasAny respects manage wildcard', () => {
      expect(hasAny(['products.manage'], ['products.read', 'orders.read'])).toBe(true);
    });
  });
});
