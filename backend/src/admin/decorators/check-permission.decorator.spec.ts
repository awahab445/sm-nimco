import { buildPermissionKey } from './check-permission.decorator';

describe('buildPermissionKey', () => {
  it('joins entity and action with a dot', () => {
    expect(buildPermissionKey('products', 'read')).toBe('products.read');
  });

  it('supports dotted entities', () => {
    expect(buildPermissionKey('admin.users', 'create')).toBe(
      'admin.users.create',
    );
  });
});
