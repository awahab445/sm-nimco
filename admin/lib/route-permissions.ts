/**
 * Central URL -> required permission keys map for the admin app.
 *
 * The `<RouteGuard>` in the `(app)` layout consults this for every navigation
 * and blocks the page render if the current user lacks every listed key
 * (OR-semantics: any one key satisfies the rule).
 *
 * Rules are evaluated **in order, first match wins**, so list more specific
 * patterns first (e.g. `/staff/users/new` before `/staff/users`).
 *
 * Return `null` from `getRouteRequirement` for routes that anyone signed in
 * may visit (currently just the dashboard).
 */

type RouteRule = {
  /** Returns true if this rule applies to the given pathname. */
  test: (pathname: string) => boolean;
  /** Permission keys; user needs at least one. */
  requirePermission: ReadonlyArray<string>;
};

function exact(path: string): (p: string) => boolean {
  return (p) => p === path;
}

function prefix(path: string): (p: string) => boolean {
  return (p) => p === path || p.startsWith(`${path}/`);
}

const RULES: RouteRule[] = [
  // ---- Staff (most specific first) -------------------------------------
  { test: prefix('/staff/users/new'), requirePermission: ['admin.users.create'] },
  {
    test: prefix('/staff/users'),
    requirePermission: ['admin.users.read', 'admin.users.update', 'admin.users.create'],
  },
  { test: prefix('/staff/roles/new'), requirePermission: ['admin.roles.manage'] },
  {
    test: prefix('/staff/roles'),
    requirePermission: ['admin.roles.read', 'admin.roles.manage'],
  },
  {
    test: prefix('/sessions'),
    requirePermission: ['admin.users.read', 'admin.users.update'],
  },

  // ---- Products (covers products, categories, product-options) ---------
  // The `<entity>.manage` wildcard in hasPermission() means a role holding
  // `products.manage` automatically satisfies any specific `products.<action>`
  // check, so we only need to list the granular keys here.
  {
    test: prefix('/products/new'),
    requirePermission: ['products.create'],
  },
  {
    test: prefix('/products'),
    requirePermission: ['products.read', 'products.update'],
  },
  {
    test: prefix('/product-options'),
    requirePermission: ['products.read'],
  },
  {
    test: prefix('/categories'),
    requirePermission: ['products.read'],
  },

  // ---- Inventory -------------------------------------------------------
  {
    test: prefix('/inventory'),
    requirePermission: ['inventory.read', 'inventory.manage'],
  },

  // ---- Customers -------------------------------------------------------
  {
    test: prefix('/customers/new'),
    requirePermission: ['customers.create', 'customers.manage'],
  },
  {
    test: prefix('/customers'),
    requirePermission: ['customers.read', 'customers.update', 'customers.manage'],
  },
  {
    test: prefix('/customer-groups'),
    requirePermission: ['customers.read', 'customers.manage'],
  },

  // ---- Orders ----------------------------------------------------------
  {
    test: prefix('/orders'),
    requirePermission: ['orders.read', 'orders.update', 'orders.manage'],
  },

  // ---- Promotions ------------------------------------------------------
  { test: prefix('/promotions'), requirePermission: ['promotions.manage'] },

  { test: prefix('/bundle-deals'), requirePermission: ['deals.manage'] },

  // ---- Shipping --------------------------------------------------------
  { test: prefix('/shipping'), requirePermission: ['shipping.manage'] },

  // ---- Tax -------------------------------------------------------------
  { test: prefix('/tax'), requirePermission: ['tax.manage'] },

  // ---- Payments --------------------------------------------------------
  { test: prefix('/payments'), requirePermission: ['payments.manage'] },

  // ---- CMS -------------------------------------------------------------
  { test: prefix('/cms'), requirePermission: ['cms.manage'] },
  { test: prefix('/settings/policy-pages'), requirePermission: ['cms.manage'] },

  { test: prefix('/store-navigation'), requirePermission: ['products.read'] },

  { test: prefix('/store-filters'), requirePermission: ['products.read'] },

  { test: prefix('/analytics'), requirePermission: ['analytics.manage', 'settings.manage'] },

  { test: prefix('/mail'), requirePermission: ['mail.manage', 'settings.manage'] },

  // ---- Subscription (email list) ----------------------------------------
  { test: prefix('/subscriptions'), requirePermission: ['subscriptions.manage'] },

  // ---- Dashboard -------------------------------------------------------
  // Explicit no-op rule so we don't accidentally block the dashboard with a
  // future generic rule. Returns an empty array which the guard treats as
  // "any signed-in admin allowed".
  { test: exact('/'), requirePermission: [] },
];

/**
 * Get the permission requirement for a given pathname.
 *
 * Returns:
 *  - `null`              if no rule matches (route is unrestricted)
 *  - `[]`                if the route is explicitly open to any signed-in admin
 *  - `string[]`          one of which the user must have (OR-semantics)
 */
export function getRouteRequirement(pathname: string): ReadonlyArray<string> | null {
  for (const rule of RULES) {
    if (rule.test(pathname)) return rule.requirePermission;
  }
  return null;
}
