'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import type { CategoryTreeItem } from '@/lib/api-client';
import { CATEGORY_NAV_BADGES, getMegaMenuPromo } from '@/lib/mega-menu-config';

function sortByPosition<T extends { position?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
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

const CLOSE_MS = 180;

type DesktopMegaMenuProps = {
  roots: CategoryTreeItem[];
  /** Primary tab label (default: Products). */
  primaryLabel?: string;
  /** Secondary tab label (default: Categories). */
  secondaryLabel?: string | null;
  /** Primary tab URL (default: /products). */
  primaryHref?: string;
};

/** Desktop: hover primary or secondary label for full-width mega panel (lg+). */
export function DesktopShopMegaMenu({
  roots,
  primaryLabel = 'Products',
  secondaryLabel = 'Categories',
  primaryHref = '/products',
}: DesktopMegaMenuProps) {
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

/** Opens menu and clears any pending close timer. */
  const openMenu = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  if (roots.length === 0) {
    return (
      <Link
        href="/products"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Products
      </Link>
    );
  }

  const columns = sortByPosition(roots).slice(0, 4);
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
          className={`text-sm font-medium transition-colors hover:text-foreground ${
            open ? 'text-foreground' : 'text-muted-foreground'
          }`}
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
            className={`cursor-pointer border-0 bg-transparent p-0 text-sm font-medium transition-colors hover:text-foreground ${
              open ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className="store-mega-menu-panel absolute left-1/2 top-full z-[999] w-screen max-w-[100vw] -translate-x-1/2 border-t border-border bg-white pt-2 font-sans text-foreground shadow-[0_16px_48px_-12px_rgba(15,23,42,0.18)]"
          role="region"
          aria-label="Shop categories"
          onMouseEnter={openMenu}
        >
          <div className="mx-auto max-w-[100rem] overflow-x-auto px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
            <MegaMenuGridInner columns={columns} promo={promo} colCount={colCount} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MegaMenuGridInner({
  columns,
  promo,
  colCount,
}: {
  columns: CategoryTreeItem[];
  promo: ReturnType<typeof getMegaMenuPromo>;
  colCount: number;
}) {
  return (
    <div
      className="grid gap-x-10 gap-y-6"
      style={{
        gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr)) minmax(220px, 300px)`,
      }}
    >
      {columns.map((root) => {
        const children = sortByPosition(root.children ?? []);
        return (
          <div key={root.id} className="min-w-0">
            <Link
              href={`/categories/${root.slug}`}
              className="mega-menu-nav-heading block text-sm font-bold tracking-tight text-foreground hover:text-primary"
            >
              {root.name}
            </Link>
            <ul className="mt-3 max-h-[min(40vh,22rem)] space-y-0.5 overflow-y-auto overscroll-contain pr-1">
              {children.length === 0 ? (
                <li>
                  <Link
                    href={`/categories/${root.slug}`}
                    className="mega-menu-nav-link block rounded-md py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-primary"
                  >
                    Shop {root.name}
                  </Link>
                </li>
              ) : (
                children.map((ch) => (
                  <li key={ch.id}>
                    <Link
                      href={`/categories/${ch.slug}`}
                      className="mega-menu-nav-link flex flex-wrap items-center rounded-md py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-primary"
                    >
                      <span>{ch.name}</span>
                      <CategoryBadge slug={ch.slug} />
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}

      <aside className="min-w-0 lg:max-w-[300px]">
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
  roots: CategoryTreeItem[];
  onNavigate: () => void;
};

/** Mobile drawer: nested categories as accordions (lg:hidden). */
export function MobileCategoryAccordions({ roots, onNavigate }: MobileCategoryAccordionsProps) {
  if (roots.length === 0) return null;

  const sorted = sortByPosition(roots);

  return (
    <div className="border-t border-border pt-2 lg:hidden">
      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</p>
      <div className="space-y-1.5 px-1">
      {sorted.map((cat) => {
        const children = sortByPosition(cat.children ?? []);
        return (
          <details
            key={cat.id}
            className="group rounded-md border border-border/60 bg-card/30 open:bg-muted/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
              <span>{cat.name}</span>
              <span className="text-xs text-muted-foreground transition-transform group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </summary>
            <div className="border-t border-border/60 px-2 py-2">
              <Link
                href={`/categories/${cat.slug}`}
                className="mega-menu-nav-link block rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                onClick={onNavigate}
              >
                All in {cat.name}
              </Link>
              <ul className="mt-1 space-y-0.5">
                {children.map((ch) => (
                  <li key={ch.id}>
                    <Link
                      href={`/categories/${ch.slug}`}
                      className="mega-menu-nav-link flex flex-wrap items-center rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={onNavigate}
                    >
                      <span>{ch.name}</span>
                      <CategoryBadge slug={ch.slug} />
                    </Link>
                  </li>
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
