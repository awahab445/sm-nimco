/**
 * Admin permission keys (resource-oriented, dot-separated).
 * Seeded in DB; guards check these strings. Super-admin role bypasses via slug.
 *
 * Two key families coexist:
 *   - Granular CRUD: `<entity>.{create|read|update|delete}` — preferred for new
 *     routes using `@CheckPermission(entity, action)`.
 *   - Coarse domain: `<entity>.manage` / `<entity>.read` — kept for backward
 *     compatibility with existing controllers using `@RequirePermissions(...)`.
 */

export const ADMIN_PERMISSION_SEED: { key: string; description: string }[] = [
  {
    key: 'admin.access.full',
    description: 'Full administrative access (implies all permissions).',
  },

  // Staff (admin) user management — strict CRUD
  { key: 'admin.users.create', description: 'Create staff admin users' },
  { key: 'admin.users.read', description: 'View admin users' },
  { key: 'admin.users.update', description: 'Update admin users' },
  { key: 'admin.users.delete', description: 'Deactivate or remove admin users' },

  // Roles
  { key: 'admin.roles.read', description: 'View roles and permission assignments' },
  { key: 'admin.roles.manage', description: 'Create or update roles and permissions' },

  // Products — strict CRUD (used by `@CheckPermission('products', ...)`)
  { key: 'products.create', description: 'Create products' },
  { key: 'products.read', description: 'Read products' },
  { key: 'products.update', description: 'Update products and their sub-resources (variants, images, categories)' },
  { key: 'products.delete', description: 'Delete products' },

  // Orders — strict CRUD
  { key: 'orders.create', description: 'Create orders (admin-side)' },
  { key: 'orders.read', description: 'Read orders' },
  { key: 'orders.update', description: 'Update orders, status, fulfillment' },
  { key: 'orders.delete', description: 'Delete orders' },

  // Customers (storefront users) — strict CRUD
  { key: 'customers.create', description: 'Create customers' },
  { key: 'customers.read', description: 'Read customers' },
  { key: 'customers.update', description: 'Update customers' },
  { key: 'customers.delete', description: 'Delete customers' },

  // Coarse, domain-level keys. The `<entity>.manage` keys also act as
  // wildcards: holding e.g. `products.manage` satisfies any `products.<action>`
  // check via the convention applied in AdminRbacService.userHasPermission /
  // frontend hasPermission().
  //
  // Historical note: `catalog.read` / `catalog.manage` were the original
  // coarse keys for the products + categories + product-options surface.
  // They were collapsed into `products.read` / `products.manage` for
  // consistency with the rest of the API; the seed migration in
  // `ensureAdminRbacSeeded` promotes any existing grants on the legacy keys
  // before deleting their rows.
  { key: 'products.manage', description: 'Manage products, categories, and product options (implies all products.* actions)' },
  { key: 'inventory.read', description: 'Read inventory' },
  { key: 'inventory.manage', description: 'Manage inventory and stock' },
  { key: 'orders.manage', description: 'Manage orders (implies all orders.* actions)' },
  { key: 'customers.manage', description: 'Manage customers and groups (implies all customers.* actions)' },
  { key: 'promotions.manage', description: 'Manage promotions' },
  { key: 'deals.manage', description: 'Manage bundle deals' },
  { key: 'shipping.manage', description: 'Manage shipping zones and methods' },
  { key: 'tax.manage', description: 'Manage tax classes and rates' },
  { key: 'payments.manage', description: 'Manage payment configuration' },
  { key: 'cms.manage', description: 'Manage CMS pages, blocks, and sliders' },
  { key: 'subscriptions.manage', description: 'View storefront email subscriptions (subscriber list)' },
  { key: 'reports.read', description: 'Access reports and exports' },
  { key: 'settings.manage', description: 'Platform settings and mail server configuration' },
  { key: 'mail.manage', description: 'Manage SMTP mailboxes and test connections' },
  { key: 'analytics.manage', description: 'Manage GA4 analytics and ecommerce tracking' },
];

export const SUPER_ADMIN_ROLE_SLUG = 'super-admin';
export const MANAGER_ROLE_SLUG = 'manager';
export const SUPPORT_ROLE_SLUG = 'support';

/**
 * Operational manager: full commerce ops on products/orders/customers, but no
 * staff user mutation or role administration.
 */
export const MANAGER_PERMISSION_KEYS: string[] = [
  // Visibility into staff/roles
  'admin.users.read',
  'admin.roles.read',

  // Products / catalog: full CRUD plus the coarse `products.manage` wildcard
  'products.create',
  'products.read',
  'products.update',
  'products.delete',
  'products.manage',

  // Orders: full CRUD
  'orders.create',
  'orders.read',
  'orders.update',
  'orders.delete',
  'orders.manage',

  // Customers: full CRUD
  'customers.create',
  'customers.read',
  'customers.update',
  'customers.delete',
  'customers.manage',

  // Other domains (coarse)
  'inventory.read',
  'inventory.manage',
  'promotions.manage',
  'deals.manage',
  'shipping.manage',
  'tax.manage',
  'payments.manage',
  'cms.manage',
  'subscriptions.manage',
  'reports.read',
  'settings.manage',
  'mail.manage',
  'analytics.manage',
];

/** Read-only support: orders, customers, products. */
export const SUPPORT_PERMISSION_KEYS: string[] = [
  'admin.roles.read',

  'products.read',

  'orders.read',

  'customers.read',

  'inventory.read',
  'reports.read',
];
