'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';
import { useHydrated } from '@/lib/use-hydrated';
import { getStoreLogoSrc, splitStoreName, STORE_NAME } from '@/lib/config';
import {
  siteConfigApi,
  storefrontNavApi,
  mergeStorefrontNavigation,
  STOREFRONT_NAV_FALLBACK,
  type StorefrontNavItem,
  type StorefrontNavMegaNode,
} from '@/lib/api-client';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import { UserMenuDropdown } from '@/components/layout/user-menu-dropdown';
import { CartPreviewDropdown } from '@/components/layout/cart-preview-dropdown';
import { DesktopShopMegaMenu, MobileCategoryAccordions } from '@/components/layout/store-mega-menu';
import { SearchBar } from '@/components/search/search-bar';
import { useWishlistStore } from '@/lib/wishlist.store';
import type { StoreThemeCode } from '@/lib/theme/types';

const DESKTOP_NAV_MIN_WIDTH = 1024;
/** Intrinsic Image hints — visual size is driven by CSS (icon + HTML wordmark). */
const DEFAULT_LOGO_WIDTH = 48;
const DEFAULT_LOGO_HEIGHT = 48;
const LOGO_DISPLAY_MIN = 48;
const LOGO_DIMENSION_MIN = 16;
const LOGO_DIMENSION_MAX = 160;

function normalizeLogoDimension(value: number | null | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(LOGO_DIMENSION_MAX, Math.max(LOGO_DIMENSION_MIN, Math.round(value)));
}

function resolveLogoSrc(logoUrl: string | null | undefined, fallback: string): string {
  return resolveImageUrl(logoUrl) ?? fallback;
}

function isCartHref(href: string): boolean {
  const h = href.trim().split('?')[0] ?? '';
  return h === '/cart' || h.endsWith('/cart');
}

function normalizeNavPath(href: string): string {
  const base = href.trim().split('?')[0]?.split('#')[0] ?? '/';
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1);
  return base || '/';
}

function isNavLinkActive(href: string, pathname: string): boolean {
  const target = normalizeNavPath(href);
  const current = normalizeNavPath(pathname);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}

function navListsEqual(a: StorefrontNavItem[], b: StorefrontNavItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => {
    const other = b[i];
    return (
      item.id === other.id &&
      item.label === other.label &&
      item.href === other.href &&
      item.sortOrder === other.sortOrder &&
      item.openMegaMenu === other.openMegaMenu
    );
  });
}

/** Kalles-style nav: Poppins 15px/500 — typography enforced in chrome-enhancements.css. */
const NAV_LINK_CLASS =
  'chrome-nav-link font-sans text-[15px] font-medium tracking-normal transition-colors';

/** Kalles `#icon-h-heart` — thin Feather heart outline. */
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function Header({ theme = 'default' }: { theme?: StoreThemeCode }) {
  const pathname = usePathname();
  const isSmNimco = theme === 'sm_nimco';
  const { isAuthenticated } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const cartItemCount =
    (cart?.items?.reduce((sum, i) => sum + (i.quantity ?? 0), 0) ?? 0) +
    (cart?.bundles?.reduce((sum, b) => sum + (b.quantity ?? 0), 0) ?? 0);
  const defaultLogoSrc = getStoreLogoSrc();
  const [logoSrc, setLogoSrc] = useState(defaultLogoSrc);
  const [logoWidth, setLogoWidth] = useState(DEFAULT_LOGO_WIDTH);
  const [logoHeight, setLogoHeight] = useState(DEFAULT_LOGO_HEIGHT);
  const [mainNav, setMainNav] = useState<StorefrontNavItem[]>(STOREFRONT_NAV_FALLBACK.header);
  const [megaMenu, setMegaMenu] = useState<StorefrontNavMegaNode[]>(STOREFRONT_NAV_FALLBACK.megaMenu);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavTab, setMobileNavTab] = useState<'menu' | 'categories'>('menu');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const rafScrollRef = useRef(0);
  const headerRef = useRef<HTMLElement | null>(null);
  const hydrated = useHydrated();
  const mobileNavTitleId = useId();

  /** Expose header height for immersive hero pull-up under the menu. */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const syncHeight = () => {
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${el.offsetHeight}px`,
      );
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--site-header-height');
    };
  }, []);

  /** Kalles sticky-type on_scroll_up: hide on scroll-down, show when scrolling up. */
  useEffect(() => {
    const applyScrollState = () => {
      rafScrollRef.current = 0;
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      setHeaderScrolled(y > 8);

      if (y < 80) {
        setHeaderHidden(false);
      } else if (delta > 8) {
        setHeaderHidden(true);
      } else if (delta < -8) {
        setHeaderHidden(false);
      }

      lastScrollY.current = y;
    };

    const onScroll = () => {
      if (rafScrollRef.current) return;
      rafScrollRef.current = window.requestAnimationFrame(applyScrollState);
    };

    lastScrollY.current = window.scrollY;
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafScrollRef.current) window.cancelAnimationFrame(rafScrollRef.current);
    };
  }, []);

  // Keep header visible while the mobile drawer is open (derived — no effect setState).
  const headerVisuallyHidden = headerHidden && !mobileNavOpen;

  useEffect(() => {
    let cancelled = false;
    siteConfigApi
      .getSiteConfig()
      .then((res) => {
        if (cancelled) return;
        const siteConfig = res.data;
        setLogoSrc(resolveLogoSrc(siteConfig.logoUrl, defaultLogoSrc));
        setLogoWidth(normalizeLogoDimension(siteConfig.logoWidth, DEFAULT_LOGO_WIDTH));
        setLogoHeight(normalizeLogoDimension(siteConfig.logoHeight, DEFAULT_LOGO_HEIGHT));
      })
      .catch(() => {
        if (cancelled) return;
        setLogoSrc(defaultLogoSrc);
        setLogoWidth(DEFAULT_LOGO_WIDTH);
        setLogoHeight(DEFAULT_LOGO_HEIGHT);
      });

    storefrontNavApi
      .getNavigation()
      .then((res) => {
        if (cancelled) return;
        const merged = mergeStorefrontNavigation(
          res.data ?? { header: [], megaMenu: [] },
        );
        setMainNav((prev) =>
          navListsEqual(prev, merged.header) ? prev : merged.header,
        );
        setMegaMenu(merged.megaMenu);
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
  }, [defaultLogoSrc]);

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

  const closeMobileNav = () => {
    setMobileNavOpen(false);
    setMobileNavTab('menu');
  };

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
    return (
      <Link
        key={item.id}
        href={item.href}
        className={`${NAV_LINK_CLASS} ${isNavLinkActive(item.href, pathname) ? 'chrome-nav-link--active' : ''}`}
        aria-current={isNavLinkActive(item.href, pathname) ? 'page' : undefined}
      >
        {item.label}
      </Link>
    );
  }

  function mobileNavItem(item: StorefrontNavItem) {
    if (item.openMegaMenu) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className="mobile-nav-link"
          onClick={closeMobileNav}
          aria-current={isNavLinkActive(item.href, pathname) ? 'page' : undefined}
        >
          {item.label}
        </Link>
      );
    }
    if (isCartHref(item.href)) {
      return null;
    }
    return (
      <Link
        key={item.id}
        href={item.href}
        className="mobile-nav-link"
        onClick={closeMobileNav}
        aria-current={isNavLinkActive(item.href, pathname) ? 'page' : undefined}
      >
        {item.label}
      </Link>
    );
  }

  const mobileMenuButton = hydrated ? (
    <button
      type="button"
      suppressHydrationWarning
      className="site-header__menu-btn inline-flex shrink-0 items-center justify-center p-1 text-foreground transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-expanded={mobileNavOpen}
      aria-controls="mobile-main-nav"
      aria-haspopup="dialog"
      aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
      onClick={() => setMobileNavOpen((o) => !o)}
    >
      <svg width="28" height="16" viewBox="0 0 30 16" fill="currentColor" aria-hidden>
        <rect width="30" height="1.5" />
        <rect y="7" width="20" height="1.5" />
        <rect y="14" width="30" height="1.5" />
      </svg>
    </button>
  ) : (
    <span className="site-header__menu-btn inline-flex shrink-0 p-1" aria-hidden>
      <svg width="28" height="16" viewBox="0 0 30 16" fill="currentColor">
        <rect width="30" height="1.5" />
        <rect y="7" width="20" height="1.5" />
        <rect y="14" width="30" height="1.5" />
      </svg>
    </span>
  );

  const { lead: brandLead, trail: brandTrail } = splitStoreName(STORE_NAME);
  const logoIntrinsic = Math.max(logoWidth, logoHeight, LOGO_DISPLAY_MIN);

  const smNimcoBrandLogo = (
    <Link
      href="/"
      className="site-header__logo inline-flex max-w-full items-center gap-3 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-label={`${STORE_NAME} home`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-gold-primary,#d4af37)] bg-[var(--brand-purple-dark,#1e1035)] shadow-md">
        <span className="font-heading text-xl font-extrabold text-[var(--brand-gold-primary,#d4af37)]">
          SM
        </span>
      </div>
      <div className="min-w-0 text-left leading-tight">
        <span className="site-header__store-name block font-heading text-xl font-extrabold text-[var(--brand-purple-dark,#1e1035)]">
          SM NIMCO
        </span>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--brand-gold-hover,#b89628)]">
          &amp; Sweets House
        </span>
      </div>
    </Link>
  );

  const brandLogo = isSmNimco ? (
    smNimcoBrandLogo
  ) : (
    <Link
      href="/"
      className="site-header__logo inline-flex max-w-full items-center gap-2 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:gap-2.5"
      aria-label={`${STORE_NAME} home`}
    >
      <Image
        src={logoSrc}
        alt=""
        width={logoIntrinsic}
        height={logoIntrinsic}
        className="h-10 w-10 shrink-0 object-contain lg:h-12 lg:w-12"
        priority
        unoptimized={logoSrc.startsWith('http')}
      />
      <span className="min-w-0 text-left leading-none" aria-hidden="true">
        {/* Mobile: stacked wordmark — M. ESSA / CHEMICALS */}
        <span className="flex flex-col gap-0.5 lg:hidden">
          <span className="site-header__store-name text-[13px] font-bold tracking-[0.04em] text-foreground sm:text-sm">
            {brandLead}
          </span>
          {brandTrail ? (
            <span className="site-header__wordmark-accent text-[12px] font-medium tracking-[0.06em] sm:text-[13px]">
              {brandTrail}
            </span>
          ) : null}
        </span>
        {/* Desktop: single-line wordmark beside icon */}
        <span className="hidden whitespace-nowrap lg:inline-flex lg:items-baseline lg:gap-1.5">
          <span className="site-header__store-name text-base font-bold tracking-[0.04em] text-foreground xl:text-lg">
            {brandLead}
          </span>
          {brandTrail ? (
            <span className="site-header__wordmark-accent text-base font-semibold tracking-[0.04em] xl:text-lg">
              {brandTrail}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );

  /** Wishlist — badge from guest localStorage or authenticated server list. */
  const displayWishlistCount = hydrated ? wishlistCount : 0;
  const wishlistButton = (
    <Link
      href="/wishlist"
      className="site-header__icon-btn relative inline-flex items-center justify-center text-foreground transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-label={
        displayWishlistCount > 0
          ? `Wishlist, ${displayWishlistCount} ${displayWishlistCount === 1 ? 'item' : 'items'}`
          : 'Wishlist'
      }
      title="Wishlist"
    >
      <span className="relative inline-flex h-[22px] w-[22px] items-center justify-center">
        <HeartIcon className="h-[22px] w-[22px]" />
        <span className="chrome-count-box" aria-hidden>
          {displayWishlistCount > 99 ? '99+' : displayWishlistCount}
        </span>
      </span>
    </Link>
  );

  const headerActions = (
    <div className="site-header__actions flex shrink-0 items-center gap-5 lg:gap-6">
      <SearchBar />
      <UserMenuDropdown />
      {wishlistButton}
      {cartNavItem ? (
        <CartPreviewDropdown
          label={cartNavItem.label}
          href={cartNavItem.href}
          variant={isSmNimco ? 'sm-nimco' : 'default'}
        />
      ) : (
        <CartPreviewDropdown variant={isSmNimco ? 'sm-nimco' : 'default'} />
      )}
    </div>
  );

  const mobileMenu =
    mobileNavOpen && hydrated ? (
      <div
        className="mobile-nav-drawer fixed inset-0 z-[200] flex min-h-[100dvh] lg:hidden"
        id="mobile-main-nav"
        role="dialog"
        aria-modal="true"
        aria-labelledby={mobileNavTitleId}
      >
        <div
          className="mobile-nav-drawer__panel relative flex h-[100dvh] max-h-[100dvh] w-[min(100vw-50px,21.25rem)] max-w-[min(100vw-50px,21.25rem)] shrink-0 flex-col bg-card shadow-product-card"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex min-h-14 shrink-0 border-b border-border bg-foreground/[0.06] pt-[max(0px,env(safe-area-inset-top))]">
            <button
              type="button"
              id={mobileNavTitleId}
              className={`mobile-nav-drawer__tab flex flex-1 items-center justify-center px-2 text-sm font-medium ${
                mobileNavTab === 'menu' ? 'is-active' : ''
              }`}
              aria-pressed={mobileNavTab === 'menu'}
              onClick={() => setMobileNavTab('menu')}
            >
              Menu
            </button>
            <button
              type="button"
              className={`mobile-nav-drawer__tab flex flex-1 items-center justify-center px-2 text-sm font-medium ${
                mobileNavTab === 'categories' ? 'is-active' : ''
              }`}
              aria-pressed={mobileNavTab === 'categories'}
              onClick={() => setMobileNavTab('categories')}
            >
              Categories
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {mobileNavTab === 'menu' ? (
              <nav className="flex flex-col" aria-label="Mobile navigation">
                {mainNav.map((item) => mobileNavItem(item))}
                {hydrated && isAuthenticated ? (
                  <Link href="/account" className="mobile-nav-link" onClick={closeMobileNav}>
                    My Profile
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="mobile-nav-link" onClick={closeMobileNav}>
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="mobile-nav-link font-semibold"
                      onClick={closeMobileNav}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            ) : (
              <MobileCategoryAccordions roots={megaMenu} onNavigate={closeMobileNav} />
            )}
          </div>
        </div>

        <button
          type="button"
          className="mobile-nav-drawer__close inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-btn-hover"
          aria-label="Close menu"
          onClick={closeMobileNav}
        >
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
            <path d="M15 0L1 14m14 0L1 0" stroke="currentColor" strokeWidth={1.5} />
          </svg>
        </button>

        <button
          type="button"
          className="min-h-0 min-w-0 flex-1 cursor-pointer bg-foreground/40 backdrop-blur-[1px]"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
      </div>
    ) : null;

  return (
    <header
      ref={headerRef}
      className={`site-header sticky top-0 z-[60] w-full max-w-full overflow-visible border-b ${headerScrolled ? 'is-scrolled' : ''} ${headerVisuallyHidden ? 'is-header-hidden' : ''}`}
    >
      {/* Mobile: hamburger left | logo center | search + cart (account/wishlist live in toolbar) */}
      <div className="site-header__mobile lg:hidden">
        <div className="relative flex min-h-[3.25rem] w-full items-center justify-between px-2.5 py-2 sm:px-4">
          <div className="z-10 flex w-11 shrink-0 items-center justify-start">{mobileMenuButton}</div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-14 sm:px-16">
            <div className="pointer-events-auto max-w-[min(100%,14.5rem)]">{brandLogo}</div>
          </div>
          <div className="z-10 flex shrink-0 items-center justify-end gap-4 pr-0.5">
            <SearchBar />
            <Link
              href={cartNavItem?.href ?? '/cart'}
              className="site-header__icon-btn relative inline-flex items-center justify-center text-foreground transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label={
                cartItemCount > 0
                  ? `${cartNavItem?.label ?? 'Cart'}, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`
                  : cartNavItem?.label ?? 'Cart'
              }
            >
              <span className="relative inline-flex h-6 w-6 items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6" aria-hidden />
                {hydrated ? (
                  <span className="chrome-count-box" aria-hidden>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                ) : (
                  <span className="chrome-count-box" aria-hidden>
                    0
                  </span>
                )}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop: single row — nav left | logo center | icons right (Kalles logo-center) */}
      <div className="site-header__inner mx-auto hidden w-full max-w-[100rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3.5 sm:px-8 lg:grid lg:min-h-[4.25rem] lg:px-12 xl:gap-6 xl:px-16">
        <nav
          className="flex min-w-0 items-center justify-start gap-6 overflow-visible xl:gap-8"
          aria-label="Main navigation"
        >
          {desktopNavLinks.map((item) => desktopNavItem(item))}
        </nav>

        <div className="site-header__logo-col flex shrink-0 items-center justify-center px-2">
          {brandLogo}
        </div>

        <div className="site-header__actions-col flex min-w-0 items-center justify-end">
          {headerActions}
        </div>
      </div>

      {hydrated && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
