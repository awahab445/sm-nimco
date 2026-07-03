'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { type StorefrontNavMegaNode } from '@/lib/api-client';
import {
  CATEGORY_NAV_BADGES,
  type MegaMenuProductSpotlight,
} from '@/lib/mega-menu-config';
import { resolveImageUrl } from '@/lib/resolve-image-url';

const MEGA_MENU_BANNER_COL_PX = 252;

function sortByOrder<T extends { sortOrder?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function normalizePath(href: string): string {
  const base = href.trim().split('?')[0]?.split('#')[0] ?? '/';
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1);
  return base || '/';
}

function isNavActive(href: string, pathname: string): boolean {
  const target = normalizePath(href);
  const current = normalizePath(pathname);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}

function badgeSlugFromHref(href: string): string {
  const m = href.match(/\/categories\/([^/?#]+)/);
  return m?.[1] ?? '';
}

function CategoryBadge({ slug }: { slug: string }) {
  const kind = CATEGORY_NAV_BADGES[slug];
  if (!kind) return null;
  if (kind === 'hot') {
    return (
      <span className="ml-1.5 inline-flex shrink-0 items-center rounded px-1 py-0.5 text-[10px] font-bold uppercase leading-none text-white bg-red-500">
        Hot
      </span>
    );
  }
  return (
    <span className="ml-1.5 inline-flex shrink-0 items-center rounded px-1 py-0.5 text-[10px] font-bold uppercase leading-none text-white bg-emerald-600">
      New
    </span>
  );
}

function megaLinkClass(level: 2 | 3, active: boolean): string {
  const depth = level === 2 ? 'mega-menu-nav-link--l2' : 'mega-menu-nav-link--l3';
  const state = active ? ' mega-menu-nav-link--active' : '';
  return `mega-menu-nav-link ${depth}${state}`;
}

type MegaMenuLinkProps = {
  href: string;
  label: string;
  level: 2 | 3;
  pathname: string;
  onNavigate?: () => void;
};

function MegaMenuLink({ href, label, level, pathname, onNavigate }: MegaMenuLinkProps) {
  const active = isNavActive(href, pathname);
  return (
    <Link
      href={href}
      className={megaLinkClass(level, active)}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
    >
      <span>{label}</span>
      <CategoryBadge slug={badgeSlugFromHref(href)} />
    </Link>
  );
}

const CLOSE_MS = 180;
const SITE_HEADER_SELECTOR = 'header.site-header';
const SITE_HEADER_INNER_SELECTOR = 'header.site-header .site-header__inner';

function useMegaMenuPanelPosition(open: boolean): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({});

  const sync = useCallback(() => {
    const header = document.querySelector(SITE_HEADER_SELECTOR);
    const inner = document.querySelector(SITE_HEADER_INNER_SELECTOR);
    const anchor = inner ?? header;
    if (!anchor || !header) return;

    const headerBottom = header.getBoundingClientRect().bottom;
    const rect = anchor.getBoundingClientRect();
    const viewportPad = 8;
    const left = Math.max(viewportPad, rect.left);
    const right = Math.min(window.innerWidth - viewportPad, rect.right);
    const width = Math.max(0, right - left);

    setStyle({
      position: 'fixed',
      top: headerBottom,
      left,
      width,
      zIndex: 50,
      transform: 'none',
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [open, sync]);

  return style;
}

function NavChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? 'header-nav-trigger__chevron h-3.5 w-3.5'}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type MegaMenuAdminBanner = {
  imageUrl: string;
  href: string;
  alt: string;
} | null;

type DesktopMegaMenuProps = {
  roots: StorefrontNavMegaNode[];
  primaryLabel?: string;
  secondaryLabel?: string | null;
  primaryHref?: string;
  adminBanner?: MegaMenuAdminBanner;
};

export function DesktopShopMegaMenu({
  roots,
  primaryLabel = 'Products',
  secondaryLabel = 'Categories',
  primaryHref = '/products',
  adminBanner = null,
}: DesktopMegaMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelStyle = useMegaMenuPanelPosition(open);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const closeMenu = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);

  if (roots.length === 0) {
    return (
      <Link href="/products" className="header-nav-trigger text-sm font-medium text-white">
        Products
      </Link>
    );
  }

  const columns = sortByOrder(roots).slice(0, 4);
  const colCount = Math.min(4, Math.max(1, columns.length));

  const megaMenuPanel =
    open && mounted ? (
      <div
        className="store-mega-menu-panel"
        style={panelStyle}
        role="region"
        aria-label="Shop categories"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <div className="store-mega-menu-panel__inner">
          <MegaMenuNavGrid
            columns={columns}
            colCount={colCount}
            pathname={pathname}
            adminBanner={adminBanner}
            primaryHref={primaryHref}
          />
        </div>
      </div>
    ) : null;

  return (
    <div
      className="relative hidden self-stretch items-center overflow-visible lg:flex"
      onMouseLeave={scheduleClose}
    >
      <div className="flex h-full items-center gap-6">
        <Link
          href={primaryHref}
          onMouseEnter={closeMenu}
          onFocus={closeMenu}
          className="header-nav-trigger text-sm font-medium text-white"
        >
          {primaryLabel}
        </Link>
        {secondaryLabel != null && secondaryLabel !== '' ? (
          <button
            type="button"
            onMouseEnter={openMenu}
            onFocus={openMenu}
            aria-expanded={open}
            aria-haspopup="true"
            className="header-nav-trigger cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-white"
          >
            <span className="text-white">{secondaryLabel}</span>
            <NavChevron />
          </button>
        ) : null}
      </div>

      {mounted && megaMenuPanel ? createPortal(megaMenuPanel, document.body) : null}
    </div>
  );
}

function MegaMenuChildList({
  node,
  pathname,
}: {
  node: StorefrontNavMegaNode;
  pathname: string;
}) {
  const grandchildren = sortByOrder(node.children ?? []);
  return (
    <li>
      <MegaMenuLink href={node.href} label={node.label} level={2} pathname={pathname} />
      {grandchildren.length > 0 ? (
        <ul className="mega-menu-nav-nested space-y-0.5">
          {grandchildren.map((gc) => (
            <li key={gc.id}>
              <MegaMenuLink href={gc.href} label={gc.label} level={3} pathname={pathname} />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function useAdminMegaMenuBanner(
  adminBanner: MegaMenuAdminBanner,
  primaryHref: string,
): MegaMenuProductSpotlight | null {
  return useMemo(() => {
    if (!adminBanner) return null;
    const url = adminBanner.imageUrl?.trim();
    if (!url) return null;
    const imageSrc = resolveImageUrl(url);
    if (!imageSrc) return null;
    return {
      imageSrc,
      href: adminBanner.href?.trim() || primaryHref,
      alt: adminBanner.alt?.trim() || 'Mega menu promotion',
    };
  }, [adminBanner, primaryHref]);
}

function MegaMenuProductSpotlight({ spotlight }: { spotlight: MegaMenuProductSpotlight }) {
  return (
    <aside className="mega-menu-product-spotlight hidden xl:block">
      <Link href={spotlight.href} className="mega-menu-product-spotlight__link">
        <img
          src={spotlight.imageSrc}
          alt={spotlight.alt}
          className="mega-menu-product-spotlight__image"
          loading="lazy"
          decoding="async"
        />
      </Link>
    </aside>
  );
}

function MegaMenuNavGrid({
  columns,
  colCount,
  pathname,
  adminBanner,
  primaryHref = '/products',
}: {
  columns: StorefrontNavMegaNode[];
  colCount: number;
  pathname: string;
  adminBanner: MegaMenuAdminBanner;
  primaryHref?: string;
}) {
  const spotlight = useAdminMegaMenuBanner(adminBanner, primaryHref);

  return (
    <div
      className="mega-menu-nav-grid grid items-start gap-x-8 gap-y-5 overflow-visible"
      data-mega-col-count={colCount}
      style={{
        gridTemplateColumns: spotlight
          ? `repeat(${colCount}, minmax(0, 1fr)) ${MEGA_MENU_BANNER_COL_PX}px`
          : `repeat(${colCount}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((root) => {
        const children = sortByOrder(root.children ?? []);
        const rootActive = isNavActive(root.href, pathname);
        return (
          <div key={root.id} className="min-w-0">
            <Link
              href={root.href}
              className={`mega-menu-nav-heading${rootActive ? ' mega-menu-nav-heading--active' : ''}`}
              aria-current={rootActive ? 'page' : undefined}
            >
              {root.label}
            </Link>
            <ul className="mega-menu-nav-column-list mt-3 space-y-0.5 pr-1">
              {children.length === 0 ? (
                <li>
                  <MegaMenuLink
                    href={root.href}
                    label={`Shop ${root.label}`}
                    level={2}
                    pathname={pathname}
                  />
                </li>
              ) : (
                children.map((ch) => <MegaMenuChildList key={ch.id} node={ch} pathname={pathname} />)
              )}
            </ul>
          </div>
        );
      })}
      {spotlight ? <MegaMenuProductSpotlight spotlight={spotlight} /> : null}
    </div>
  );
}

type MobileCategoryAccordionsProps = {
  roots: StorefrontNavMegaNode[];
  onNavigate: () => void;
};

function MobileChildBlock({
  node,
  pathname,
  onNavigate,
}: {
  node: StorefrontNavMegaNode;
  pathname: string;
  onNavigate: () => void;
}) {
  const grandchildren = sortByOrder(node.children ?? []);
  if (grandchildren.length === 0) {
    return (
      <li>
        <MegaMenuLink href={node.href} label={node.label} level={2} pathname={pathname} onNavigate={onNavigate} />
      </li>
    );
  }

  const childActive = isNavActive(node.href, pathname);
  return (
    <li className="mega-menu-mobile-nested">
      <details className="mega-menu-mobile-root" open={childActive || undefined}>
        <summary className="header-nav-trigger flex cursor-pointer list-none items-center justify-between gap-2 px-2 py-2 text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden">
          <span>{node.label}</span>
          <NavChevron className="header-nav-trigger__chevron h-3 w-3" />
        </summary>
        <div className="mega-menu-mobile-panel px-2 py-2">
          <MegaMenuLink
            href={node.href}
            label={`All in ${node.label}`}
            level={2}
            pathname={pathname}
            onNavigate={onNavigate}
          />
          <ul className="mt-1 space-y-0.5">
            {grandchildren.map((gc) => (
              <li key={gc.id}>
                <MegaMenuLink
                  href={gc.href}
                  label={gc.label}
                  level={3}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      </details>
    </li>
  );
}

export function MobileCategoryAccordions({ roots, onNavigate }: MobileCategoryAccordionsProps) {
  const pathname = usePathname();
  if (roots.length === 0) return null;

  const sorted = sortByOrder(roots);

  return (
    <div className="border-t border-border pt-2 lg:hidden">
      <p className="header-nav-categories-label px-3 pb-1 text-xs font-semibold uppercase tracking-wide">
        Categories
      </p>
      <div className="space-y-1.5 px-1">
        {sorted.map((cat) => {
          const children = sortByOrder(cat.children ?? []);
          const rootActive = isNavActive(cat.href, pathname);
          return (
            <details
              key={cat.id}
              className="mega-menu-mobile-root"
              open={rootActive || undefined}
            >
              <summary className="header-nav-trigger flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                <span>{cat.label}</span>
                <NavChevron className="header-nav-trigger__chevron h-3 w-3" />
              </summary>
              <div className="mega-menu-mobile-panel px-2 py-2">
                <MegaMenuLink
                  href={cat.href}
                  label={`All in ${cat.label}`}
                  level={2}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
                <ul className="mt-1 space-y-0.5">
                  {children.map((ch) => (
                    <MobileChildBlock
                      key={ch.id}
                      node={ch}
                      pathname={pathname}
                      onNavigate={onNavigate}
                    />
                  ))}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
