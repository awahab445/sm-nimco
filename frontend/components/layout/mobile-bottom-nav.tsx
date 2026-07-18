'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';
import { useHydrated } from '@/lib/use-hydrated';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import { UserIcon } from '@/components/icons/user-icon';
import { STOREFRONT_OPEN_SEARCH_EVENT } from '@/lib/storefront-events';

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

function isNavActive(href: string, pathname: string): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}

/** Feather grid — Kalles toolbar Shop icon. */
function ShopGridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

/** Lucide BadgePercent — reads clearly as “deals”. */
function DealsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m15 9-6 6" />
      <path d="M9 9h.01" />
      <path d="M15 15h.01" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function ToolbarCount({ count }: { count: number }) {
  return (
    <span className="mobile-toolbar__count" aria-hidden>
      {count > 99 ? '99+' : count}
    </span>
  );
}

/**
 * Kalles demo toolbar-mobile blocks: Shop · Deals · Cart · Account · Search
 * (fixed bottom, labels under icons, ~55px tall @ ≤1024px).
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const cartItemCount =
    (cart?.items?.reduce((sum, i) => sum + (i.quantity ?? 0), 0) ?? 0) +
    (cart?.bundles?.reduce((sum, b) => sum + (b.quantity ?? 0), 0) ?? 0);

  if (!hydrated) {
    return null;
  }

  const accountHref = isAuthenticated ? '/account' : '/login';
  const shopActive = isNavActive('/products', pathname) || pathname.startsWith('/categories');
  const dealsActive = isNavActive('/deals', pathname);
  const cartActive = isNavActive('/cart', pathname);
  const accountActive = isNavActive('/account', pathname) || isNavActive('/login', pathname);
  const iconClass = 'h-5 w-5';

  return createPortal(
    <nav
      className="mobile-bottom-nav mobile-toolbar fixed inset-x-0 bottom-0 z-[90] lg:hidden"
      aria-label="Mobile toolbar"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mobile-toolbar__inner flex h-[3.4375rem] w-full items-stretch">
        <Link
          href="/products"
          className={`mobile-toolbar__item ${shopActive ? 'is-active' : ''}`}
          aria-current={shopActive ? 'page' : undefined}
        >
          <span className="mobile-toolbar__icon">
            <ShopGridIcon className={iconClass} />
          </span>
          <span className="mobile-toolbar__label">Shop</span>
        </Link>

        <Link
          href="/deals"
          className={`mobile-toolbar__item ${dealsActive ? 'is-active' : ''}`}
          aria-current={dealsActive ? 'page' : undefined}
        >
          <span className="mobile-toolbar__icon">
            <DealsIcon className={iconClass} />
          </span>
          <span className="mobile-toolbar__label">Deals</span>
        </Link>

        <Link
          href="/cart"
          className={`mobile-toolbar__item ${cartActive ? 'is-active' : ''}`}
          aria-current={cartActive ? 'page' : undefined}
          aria-label={
            cartItemCount > 0
              ? `Cart, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`
              : 'Cart'
          }
        >
          <span className="mobile-toolbar__icon relative">
            <ShoppingBagIcon className={iconClass} strokeWidth={1.5} />
            <ToolbarCount count={cartItemCount} />
          </span>
          <span className="mobile-toolbar__label" aria-hidden>
            Cart
          </span>
        </Link>

        <Link
          href={accountHref}
          className={`mobile-toolbar__item ${accountActive ? 'is-active' : ''}`}
          aria-current={accountActive ? 'page' : undefined}
          aria-label={isAuthenticated ? 'Account' : 'Log in'}
        >
          <span className="mobile-toolbar__icon">
            <UserIcon className={iconClass} strokeWidth={1.5} />
          </span>
          <span className="mobile-toolbar__label">Account</span>
        </Link>

        <button
          type="button"
          className="mobile-toolbar__item"
          aria-label="Search"
          onClick={() => {
            window.dispatchEvent(new Event(STOREFRONT_OPEN_SEARCH_EVENT));
          }}
        >
          <span className="mobile-toolbar__icon">
            <SearchIcon className={iconClass} />
          </span>
          <span className="mobile-toolbar__label">Search</span>
        </button>
      </div>
    </nav>,
    document.body,
  );
}
