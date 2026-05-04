/**
 * Main sidebar navigation — aligned with MASTER_PROMPT_ADMIN_NEXTJS module phases C–L.
 */

export type NavItem = {
  href: string;
  label: string;
  description: string;
  /** Master prompt phase id for stub pages */
  phase: string;
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
    title: 'Catalog',
    items: [
      {
        href: '/categories',
        label: 'Categories',
        description: 'Category tree and merchandising',
        phase: 'C',
      },
      {
        href: '/products',
        label: 'Products',
        description: 'Catalog, variants, images',
        phase: 'D',
      },
      {
        href: '/inventory',
        label: 'Inventory',
        description: 'Stock levels and adjustments',
        phase: 'E',
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
      },
      {
        href: '/customers',
        label: 'Customers',
        description: 'Profiles and group assignment',
        phase: 'G',
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
      },
      {
        href: '/promotions',
        label: 'Promotions',
        description: 'Coupons and campaigns',
        phase: 'I',
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
      },
      {
        href: '/tax',
        label: 'Tax',
        description: 'Tax classes and rates',
        phase: 'K',
      },
      {
        href: '/payments',
        label: 'Payments',
        description: 'Payment methods and operations',
        phase: 'L',
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
