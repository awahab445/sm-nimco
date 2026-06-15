'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth.store';
import { useRouter } from 'next/navigation';
import { storefrontUi } from '@/lib/storefront-ui';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/account', label: 'Overview' },
  { href: '/profile', label: 'Profile' },
  { href: '/orders', label: 'Orders' },
  { href: '/addresses', label: 'Addresses' },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="w-full flex-shrink-0 md:w-64">
      <div className="rounded-lg border border-border bg-card shadow-product-card">
        <div className="border-b border-border p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
                {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-text">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-secondary/45 text-brand-accent'
                        : 'text-brand-text/90 hover:bg-brand-secondary/25'
                    }`}
                  >
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-md border border-border bg-brand-bg px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-secondary/25"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
