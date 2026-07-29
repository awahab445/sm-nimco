/**
 * Main sidebar navigation — aligned with MASTER_PROMPT_ADMIN_NEXTJS module phases C–L.
 *
 * `requirePermission` lists permission keys; if the current user lacks **any** of
 * the listed keys, the item is hidden from the sidebar (super-admin sees all).
 */

export type NavItem = {
  href: string;
  label: string;
  description: string;
  /** Master prompt phase id for stub pages */
  phase: string;
  /** Permission keys required to see this item (OR-semantics). */
  requirePermission?: string[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        href: '/',
        label: 'Dashboard',
        description: 'Home and quick links',
        phase: 'B',
      },
    ],
  },
  {
    title: 'Products',
    items: [
      {
        href: '/categories',
        label: 'Categories',
        description: 'Category tree and merchandising',
        phase: 'C',
        requirePermission: ['products.read'],
      },
      {
        href: '/products',
        label: 'Products',
        description: 'Catalog, variants, images',
        phase: 'D',
        requirePermission: ['products.read'],
      },
      {
        href: '/product-options',
        label: 'Product options',
        description: 'Options and values catalog',
        phase: 'D',
        requirePermission: ['products.read'],
      },
      {
        href: '/inventory',
        label: 'Inventory',
        description: 'Stock levels and adjustments',
        phase: 'E',
        requirePermission: ['inventory.read', 'inventory.manage'],
      },
    ],
  },
  {
    title: 'Customers',
    items: [
      {
        href: '/customer-groups',
        label: 'Customer groups',
        description: 'Segments and default group',
        phase: 'F',
        requirePermission: ['customers.read', 'customers.manage'],
      },
      {
        href: '/customers',
        label: 'Customers',
        description: 'Profiles and group assignment',
        phase: 'G',
        requirePermission: ['customers.read', 'customers.manage'],
      },
    ],
  },
  {
    title: 'Commerce',
    items: [
      {
        href: '/orders',
        label: 'Orders',
        description: 'Order list and fulfillment',
        phase: 'H',
        requirePermission: ['orders.read', 'orders.manage'],
      },
      {
        href: '/promotions',
        label: 'Promotions',
        description: 'Coupons and campaigns',
        phase: 'I',
        requirePermission: ['promotions.manage'],
      },
      {
        href: '/bundle-deals',
        label: 'Bundle deals',
        description: 'Product bundles and deal pricing',
        phase: 'I',
        requirePermission: ['deals.manage'],
      },
    ],
  },
  {
    title: 'Configuration',
    items: [
      {
        href: '/shipping',
        label: 'Shipping',
        description: 'Zones, methods, rates',
        phase: 'J',
        requirePermission: ['shipping.manage'],
      },
      {
        href: '/shipping/rates',
        label: 'Shipping Rates',
        description: 'CSV weight-based courier matrix',
        phase: 'J',
        requirePermission: ['shipping.manage'],
      },
      {
        href: '/tax',
        label: 'Tax',
        description: 'Tax classes and rates',
        phase: 'K',
        requirePermission: ['tax.manage'],
      },
      {
        href: '/payments',
        label: 'Payments',
        description: 'Payment methods and operations',
        phase: 'L',
        requirePermission: ['payments.manage'],
      },
      {
        href: '/cms',
        label: 'CMS',
        description: 'Pages, blocks, sliders',
        phase: 'M',
        requirePermission: ['cms.manage'],
      },
      {
        href: '/store-navigation',
        label: 'Store navigation',
        description: 'Header links and layered mega menu',
        phase: 'D',
        requirePermission: ['products.read'],
      },
      {
        href: '/store-filters',
        label: 'Store filters',
        description: 'Product listing filters and option values',
        phase: 'D',
        requirePermission: ['products.read'],
      },
      {
        href: '/settings/policy-pages',
        label: 'Policy pages',
        description: 'Shipping, privacy, and terms content',
        phase: 'M',
        requirePermission: ['cms.manage'],
      },
      {
        href: '/settings/site-config',
        label: 'Site settings',
        description: 'Logo, announcement bar, and social media links',
        phase: 'N',
        requirePermission: ['settings.manage'],
      },
      {
        href: '/settings/store',
        label: 'Order settings',
        description: 'Minimum order amount and free delivery threshold',
        phase: 'N',
        requirePermission: ['settings.manage'],
      },
      {
        href: '/settings/theme',
        label: 'Store theme',
        description: 'Storefront color palette and visual style',
        phase: 'N',
        requirePermission: ['settings.manage'],
      },
      {
        href: '/analytics',
        label: 'Analytics',
        description: 'GA4 enhanced ecommerce tracking',
        phase: 'N',
        requirePermission: ['analytics.manage', 'settings.manage'],
      },
      {
        href: '/mail',
        label: 'Mail servers',
        description: 'SMTP mailboxes for orders, welcome, auth',
        phase: 'N',
        requirePermission: ['mail.manage', 'settings.manage'],
      },
      {
        href: '/subscriptions',
        label: 'Subscription',
        description: 'Storefront email subscribers',
        phase: 'N',
        requirePermission: ['subscriptions.manage'],
      },
    ],
  },
  {
    title: 'Staff',
    items: [
      {
        href: '/staff/users',
        label: 'Admin users',
        description: 'Create staff and assign roles',
        phase: 'A',
        requirePermission: ['admin.users.read', 'admin.users.create'],
      },
      {
        href: '/staff/roles',
        label: 'Roles & permissions',
        description: 'View roles and their permission keys',
        phase: 'A',
        requirePermission: ['admin.roles.read', 'admin.roles.manage'],
      },
    ],
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/' || pathname === '';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
