'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';
import { STORE_NAME, getStoreLogoSrc } from '@/lib/config';
import { SearchBar } from '@/components/search/search-bar';
import { CategoryMegaNav } from '@/components/layout/category-mega-nav';

const DESKTOP_NAV_MIN_WIDTH = 1024;

export function Header() {
  const { isAuthenticated } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const cartItemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const logoSrc = getStoreLogoSrc();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobileNavTitleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const closeIfDesktop = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_NAV_MIN_WIDTH) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('resize', closeIfDesktop);
    return () => window.removeEventListener('resize', closeIfDesktop);
  }, []);

  const closeMobileNav = () => setMobileNavOpen(false);

  const mobileMenu =
    mobileNavOpen && mounted ? (
      <div
        className="fixed inset-0 z-[200] flex min-h-[100dvh] lg:hidden"
        id="mobile-main-nav"
        role="dialog"
        aria-modal="true"
        aria-labelledby={mobileNavTitleId}
      >
        <button
          type="button"
          className="min-h-0 min-w-0 flex-1 cursor-pointer bg-black/50 backdrop-blur-[1px]"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
        <div
          className="flex h-[100dvh] max-h-[100dvh] w-[min(100vw,22rem)] max-w-[min(100vw,22rem)] shrink-0 flex-col border-l border-border bg-background shadow-2xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <p id={mobileNavTitleId} className="text-sm font-semibold text-foreground">
              Menu
            </p>
            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close menu"
              onClick={closeMobileNav}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav
            className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3"
            aria-label="Mobile navigation"
          >
            <Link
              href="/"
              className="rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
              onClick={closeMobileNav}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
              onClick={closeMobileNav}
            >
              Products
            </Link>
            <Link
              href="/track-order"
              className="rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
              onClick={closeMobileNav}
            >
              Track order
            </Link>
            <Link
              href="/complain"
              className="rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
              onClick={closeMobileNav}
            >
              Complaints
            </Link>
            <Link
              href="/cart"
              className="flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
              onClick={closeMobileNav}
            >
              <span>Cart</span>
              {cartItemCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              ) : null}
            </Link>
            {isAuthenticated ? (
              <Link
                href="/account"
                className="rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
                onClick={closeMobileNav}
              >
                Account
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
                  onClick={closeMobileNav}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="mt-1 rounded-md bg-primary px-3 py-3 text-center text-base font-medium text-primary-foreground shadow-sm active:opacity-90 sm:py-2.5 sm:text-sm"
                  onClick={closeMobileNav}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex min-h-14 w-full min-w-0 max-w-[100rem] items-center justify-between gap-2 py-1.5 px-4 sm:gap-3 sm:px-8 lg:gap-4 lg:px-12 xl:px-16">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center bg-transparent text-lg font-semibold tracking-tight text-foreground outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={STORE_NAME}
              width={112}
              height={112}
              className="h-10 w-auto max-h-11 max-w-[8.5rem] bg-transparent object-contain object-left sm:h-12 sm:max-h-12 sm:max-w-[12rem]"
              priority
              unoptimized={logoSrc.startsWith('http')}
            />
          ) : (
            STORE_NAME
          )}
        </Link>

        <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-2">
          <SearchBar />
        </div>

        <nav
          className="hidden shrink-0 items-center gap-3 xl:gap-6 lg:flex"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="/track-order"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Track order
          </Link>
          <Link
            href="/complain"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Complaints
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cart
            {cartItemCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link
              href="/account"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-background p-2.5 text-foreground shadow-sm transition-colors hover:bg-muted active:bg-muted/80 lg:hidden"
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-main-nav"
          aria-haspopup="dialog"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          {mobileNavOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}

      <CategoryMegaNav />
    </header>
  );
}
