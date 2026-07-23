'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { UserIcon } from '@/components/icons/user-icon';
import { useAuthStore } from '@/lib/auth.store';
import { useHydrated } from '@/lib/use-hydrated';

const CLOSE_MS = 160;

const guestMenuItemClass =
  'block w-full px-4 py-2 text-left text-sm text-popover-foreground transition-all duration-200';

export function UserMenuDropdown() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { isAuthenticated, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_MS);
  }, [cancelClose]);

  const openMenu = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <div
      className="relative hidden items-center overflow-visible lg:flex"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      {hydrated ? (
        <button
          type="button"
          suppressHydrationWarning
          className="site-header__icon-btn inline-flex items-center justify-center text-foreground transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label={isAuthenticated ? 'Account menu' : 'Sign in menu'}
          aria-expanded={open}
          aria-haspopup="menu"
          onMouseEnter={openMenu}
          onFocus={openMenu}
        >
          <UserIcon className="h-[22px] w-[22px]" aria-hidden />
        </button>
      ) : (
        <span className="site-header__icon-btn inline-flex items-center justify-center" aria-hidden>
          <UserIcon className="h-[22px] w-[22px]" />
        </span>
      )}

      {hydrated && open ? (
        <div
          role="menu"
          aria-label={isAuthenticated ? 'Account' : 'Sign in'}
          className="header-user-menu absolute right-0 top-full z-[120] min-w-[11rem] py-1.5"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                role="menuitem"
                className="header-user-menu__item"
                onClick={() => setOpen(false)}
              >
                My Profile
              </Link>
              <Link
                href="/wishlist"
                role="menuitem"
                className="header-user-menu__item"
                onClick={() => setOpen(false)}
              >
                Wishlist
              </Link>
              <button
                type="button"
                role="menuitem"
                className="header-user-menu__item w-full text-left"
                onClick={() => void handleLogout()}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                role="menuitem"
                className={guestMenuItemClass}
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                role="menuitem"
                className={`${guestMenuItemClass} font-semibold`}
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
