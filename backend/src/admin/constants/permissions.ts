/**
 * Admin permission keys (resource-oriented, dot-separated).
 * Seeded in DB; guards check these strings. Super-admin role bypasses via slug.
 */

export const ADMIN_PERMISSION_SEED: { key: string; description: string }[] = [
  {
    key: 'admin.access.full',
    description: 'Full administrative access (implies all permissions).',
  },
  { key: 'admin.users.create', description: 'Create staff admin users' },
  { key: 'admin.users.read', description: 'View admin users' },
  { key: 'admin.users.update', description: 'Update admin users' },
  { key: 'admin.users.delete', description: 'Deactivate or remove admin users' },
  { key: 'admin.roles.read', description: 'View roles and permission assignments' },
  { key: 'admin.roles.manage', description: 'Create or update roles and permissions' },
  { key: 'catalog.read', description: 'Read catalog (categories, products)' },
  { key: 'catalog.manage', description: 'Manage catalog' },
  { key: 'inventory.read', description: 'Read inventory' },
  { key: 'inventory.manage', description: 'Manage inventory and stock' },
  { key: 'orders.read', description: 'Read orders' },
  { key: 'orders.manage', description: 'Update orders, status, fulfillment' },
  { key: 'customers.read', description: 'Read customers' },
  { key: 'customers.manage', description: 'Manage customers and groups' },
  { key: 'promotions.manage', description: 'Manage promotions' },
  { key: 'shipping.manage', description: 'Manage shipping zones and methods' },
  { key: 'tax.manage', description: 'Manage tax classes and rates' },
  { key: 'payments.manage', description: 'Manage payment configuration' },
  { key: 'cms.manage', description: 'Manage CMS pages, blocks, and sliders' },
  { key: 'subscriptions.manage', description: 'Manage subscription plans and lifecycle' },
  { key: 'reports.read', description: 'Access reports and exports' },
  { key: 'settings.manage', description: 'Platform settings' },
];

export const SUPER_ADMIN_ROLE_SLUG = 'super-admin';
export const MANAGER_ROLE_SLUG = 'manager';
export const SUPPORT_ROLE_SLUG = 'support';

/** Operational manager: no deleting admins or changing roles. */
export const MANAGER_PERMISSION_KEYS: string[] = [
  'admin.users.read',
  'admin.roles.read',
  'catalog.read',
  'catalog.manage',
  'inventory.read',
  'inventory.manage',
  'orders.read',
  'orders.manage',
  'customers.read',
  'customers.manage',
  'promotions.manage',
  'shipping.manage',
  'tax.manage',
  'payments.manage',
  'cms.manage',
  'subscriptions.manage',
  'reports.read',
];

/** Read-only support: orders and customers. */
export const SUPPORT_PERMISSION_KEYS: string[] = [
  'admin.roles.read',
  'catalog.read',
  'inventory.read',
  'orders.read',
  'customers.read',
  'reports.read',
];
