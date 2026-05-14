'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';
import { STORE_NAME, getStoreLogoSrc } from '@/lib/config';
import {
  storefrontNavApi,
  STOREFRONT_NAV_FALLBACK,
  type StorefrontNavItem,
  type StorefrontNavMegaNode,
} from '@/lib/api-client';
import { SearchBar } from '@/components/search/search-bar';
import { DesktopShopMegaMenu, MobileCategoryAccordions } from '@/components/layout/store-mega-menu';
import { UserMenuDropdown } from '@/components/layout/user-menu-dropdown';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';

const DESKTOP_NAV_MIN_WIDTH = 1024;

function isCartHref(href: string): boolean {
  const h = href.trim().split('?')[0] ?? '';
  return h === '/cart' || h.endsWith('/cart');
}

export function Header() {
  const { isAuthenticated } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const cartItemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const logoSrc = getStoreLogoSrc();
  const [mainNav, setMainNav] = useState<StorefrontNavItem[]>(STOREFRONT_NAV_FALLBACK.header);
  const [megaMenu, setMegaMenu] = useState<StorefrontNavMegaNode[]>(STOREFRONT_NAV_FALLBACK.megaMenu);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobileNavTitleId = useId();

  useEffect(() => {
    let cancelled = false;
    storefrontNavApi
      .getNavigation()
      .then((res) => {
        if (cancelled) return;
        const payload = res.data;
        if (payload?.header?.length) {
          setMainNav(payload.header);
          setMegaMenu(payload.megaMenu ?? []);
        } else {
          setMainNav(STOREFRONT_NAV_FALLBACK.header);
          setMegaMenu(STOREFRONT_NAV_FALLBACK.megaMenu);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMainNav(STOREFRONT_NAV_FALLBACK.header);
          setMegaMenu(STOREFRONT_NAV_FALLBACK.megaMenu);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const cartNavItem = mainNav.find((item) => isCartHref(item.href));
  const desktopNavLinks = mainNav.filter((item) => !isCartHref(item.href));

  function desktopNavItem(item: StorefrontNavItem) {
    if (item.openMegaMenu) {
      const adminBanner =
        item.bannerImageUrl?.trim()
          ? {
              imageUrl: item.bannerImageUrl,
              href: item.bannerHref?.trim() || item.href,
              alt: item.bannerAlt?.trim() || item.label,
            }
          : null;
      return (
        <DesktopShopMegaMenu
          key={item.id}
          roots={megaMenu}
          primaryLabel={item.label}
          secondaryLabel={item.secondaryLabel}
          primaryHref={item.href}
          adminBanner={adminBanner}
        />
      );
    }
    if (isCartHref(item.href)) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className="relative inline-flex items-center justify-center text-foreground transition-opacity hover:opacity-80"
          aria-label={
            cartItemCount > 0
              ? `${item.label}, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`
              : item.label
          }
          title={item.label}
        >
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <ShoppingBagIcon className="h-6 w-6" strokeWidth={2} aria-hidden />
            {cartItemCount > 0 ? (
              <span
                className="pointer-events-none absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold leading-none text-white ring-2 ring-background"
                aria-hidden
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            ) : null}
          </span>
        </Link>
      );
    }
    return (
      <Link
        key={item.id}
        href={item.href}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {item.label}
      </Link>
    );
  }

  function mobileNavItem(item: StorefrontNavItem) {
    if (item.openMegaMenu) {
      return (
        <div key={item.id} className="space-y-1">
          <Link
            href={item.href}
            className="block rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
            onClick={closeMobileNav}
          >
            {item.label}
          </Link>
          <MobileCategoryAccordions roots={megaMenu} onNavigate={closeMobileNav} />
        </div>
      );
    }
    if (isCartHref(item.href)) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-semibold text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
          aria-label={
            cartItemCount > 0
              ? `${item.label}, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`
              : item.label
          }
          onClick={closeMobileNav}
        >
          <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
            <ShoppingBagIcon className="h-6 w-6" strokeWidth={2} aria-hidden />
            {cartItemCount > 0 ? (
              <span
                className="pointer-events-none absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold leading-none text-white ring-2 ring-background"
                aria-hidden
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            ) : null}
          </span>
          <span aria-hidden>{item.label}</span>
        </Link>
      );
    }
    return (
      <Link
        key={item.id}
        href={item.href}
        className="rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
        onClick={closeMobileNav}
      >
        {item.label}
      </Link>
    );
  }

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
            {mainNav.map((item) => mobileNavItem(item))}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="rounded-md px-3 py-3 text-base font-medium text-foreground active:bg-muted sm:py-2.5 sm:text-sm"
                onClick={closeMobileNav}
              >
                My Profile
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
    <header className="site-header sticky top-0 z-[60] w-full max-w-full overflow-visible border-b relative">
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
          className="hidden shrink-0 self-stretch items-center gap-3 overflow-visible xl:gap-6 lg:flex"
          aria-label="Main navigation"
        >
          {desktopNavLinks.map((item) => desktopNavItem(item))}
          <UserMenuDropdown />
          {cartNavItem ? desktopNavItem(cartNavItem) : null}
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
    </header>
  );
}
