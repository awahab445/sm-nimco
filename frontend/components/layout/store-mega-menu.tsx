'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import type { StorefrontNavMegaNode } from '@/lib/api-client';
import { CATEGORY_NAV_BADGES, getMegaMenuPromo } from '@/lib/mega-menu-config';

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

type DesktopMegaMenuProps = {
  roots: StorefrontNavMegaNode[];
  primaryLabel?: string;
  secondaryLabel?: string | null;
  primaryHref?: string;
};

export function DesktopShopMegaMenu({
  roots,
  primaryLabel = 'Products',
  secondaryLabel = 'Categories',
  primaryHref = '/products',
}: DesktopMegaMenuProps) {
  const pathname = usePathname();
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

  if (roots.length === 0) {
    return (
      <Link href="/products" className="header-nav-trigger text-sm font-medium">
        Products
      </Link>
    );
  }

  const columns = sortByOrder(roots).slice(0, 4);
  const colCount = Math.min(4, Math.max(1, columns.length));
  const promo = getMegaMenuPromo();

  return (
    <div
      className="relative hidden overflow-visible lg:block"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <div className="flex items-center gap-6">
        <Link
          href={primaryHref}
          onMouseEnter={openMenu}
          onFocus={openMenu}
          className="header-nav-trigger text-sm font-medium"
          aria-expanded={open}
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
            className="header-nav-trigger cursor-pointer border-0 bg-transparent p-0 text-sm font-medium"
          >
            <span>{secondaryLabel}</span>
            <NavChevron />
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className="store-mega-menu-panel absolute left-1/2 top-full z-[999] w-screen max-w-[100vw] -translate-x-1/2"
          role="region"
          aria-label="Shop categories"
          onMouseEnter={openMenu}
        >
          <div className="mx-auto max-w-[100rem] overflow-x-auto px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
            <MegaMenuGridInner columns={columns} promo={promo} colCount={colCount} pathname={pathname} />
          </div>
        </div>
      ) : null}
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

function MegaMenuGridInner({
  columns,
  promo,
  colCount,
  pathname,
}: {
  columns: StorefrontNavMegaNode[];
  promo: ReturnType<typeof getMegaMenuPromo>;
  colCount: number;
  pathname: string;
}) {
  return (
    <div
      className="grid gap-x-10 gap-y-6"
      style={{
        gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr)) minmax(220px, 300px)`,
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
            <ul className="mt-3 max-h-[min(40vh,22rem)] space-y-0.5 overflow-y-auto overscroll-contain pr-1">
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

      <aside className="min-w-0 lg:max-w-[300px]">
        <div className="mega-menu-promo-card flex h-full flex-col overflow-hidden rounded-xl">
          <div className="relative aspect-[4/3] w-full shrink-0 bg-muted">
            <Image
              src={promo.imageSrc}
              alt={promo.headline}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 300px"
              unoptimized={promo.imageSrc.startsWith('http')}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="text-lg font-bold leading-tight drop-shadow-sm">{promo.headline}</p>
              <p className="mt-1 text-sm text-white/90 drop-shadow-sm">{promo.subline}</p>
              <Link
                href={promo.ctaHref}
                className="pointer-events-auto mt-3 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                {promo.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </aside>
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
