'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { categoryApi, type Category } from '@/lib/api-client';

function flattenCategories(cats: { data?: Category[] } | Category[]): Category[] {
  if (Array.isArray(cats)) return cats;
  return cats.data ?? [];
}

export type CategorySidebarProps = {
  /** Highlights a row when `/products?category=<id>` is active */
  filterCategoryId?: string | null;
};

function categorySlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/categories\/([^/]+)/);
  return m?.[1] ?? null;
}

export function CategorySidebar({ filterCategoryId = null }: CategorySidebarProps) {
  const pathname = usePathname() ?? '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sheetTitleId = useId();
  const sheetId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    categoryApi
      .getCategories()
      .then((res) => {
        if (!cancelled) setCategories(flattenCategories(res));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const slug = categorySlugFromPath(pathname);

  const currentCategoryLabel = useMemo(() => {
    if (slug) {
      const c = categories.find((x) => x.slug === slug);
      if (c) return c.name;
    }
    if (filterCategoryId) {
      const c = categories.find((x) => x.id === filterCategoryId);
      if (c) return c.name;
    }
    if (pathname === '/products') return 'All products';
    return 'All products';
  }, [categories, filterCategoryId, pathname, slug]);

  const linkClassDesktop = (active: boolean) =>
    `block py-2 text-sm transition-colors ${
      active
        ? 'font-medium text-foreground'
        : 'text-muted-foreground hover:text-[var(--navbar-link-hover,var(--primary-hover))]'
    }`;

  const linkClassSheet = (active: boolean) =>
    `flex w-full items-center justify-between px-1 py-3.5 text-base transition-colors sm:text-[15px] ${
      active
        ? 'font-medium text-foreground'
        : 'text-muted-foreground hover:text-[var(--navbar-link-hover,var(--primary-hover))]'
    }`;

  const closeSheet = () => setSheetOpen(false);

  const sheet =
    sheetOpen && mounted ? (
      <div
        className="fixed inset-0 isolate z-[240] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={sheetTitleId}
        id={sheetId}
      >
        {/* absolute layers: avoids flex + fixed stacking bugs on mobile (sheet hidden behind backdrop) */}
        <button
          type="button"
          className="absolute inset-0 z-0 cursor-pointer bg-foreground/30"
          aria-label="Close category menu"
          onClick={closeSheet}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex max-h-[min(88dvh,560px)] min-h-[12rem] flex-col rounded-t-2xl border-t border-border/60 bg-background text-foreground shadow-[0_-4px_24px_color-mix(in_srgb,var(--foreground)_8%,transparent)]"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex shrink-0 flex-col items-center border-b border-border/80 pt-2 pb-1">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/25" aria-hidden />
            <div className="flex w-full items-center justify-between px-4 pb-2 pt-3">
              <h2 id={sheetTitleId} className="text-base font-semibold text-foreground">
                Shop by category
              </h2>
              <button
                type="button"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
                onClick={closeSheet}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2" aria-label="Categories">
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/products"
                  className={linkClassSheet(pathname === '/products' && !filterCategoryId)}
                  onClick={closeSheet}
                >
                  All products
                </Link>
              </li>
              {categories.map((cat) => {
                const onCategoryPage = pathname === `/categories/${cat.slug}`;
                const filteredHere = pathname === '/products' && filterCategoryId === cat.id;
                const isActive = onCategoryPage || filteredHere;
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className={linkClassSheet(isActive)}
                      onClick={closeSheet}
                    >
                      <span>
                        {cat.name}
                        {cat.productCount != null && (
                          <span className="ml-2 font-normal text-muted-foreground">({cat.productCount})</span>
                        )}
                      </span>
                      {isActive ? (
                        <svg className="h-5 w-5 shrink-0 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    ) : null;

  if (loading) {
    return (
      <>
        <div className="w-full shrink-0 lg:hidden" aria-busy="true">
          <div className="h-12 w-full animate-pulse rounded-xl bg-muted/80" />
        </div>
        <aside className="hidden w-56 shrink-0 lg:block" aria-busy="true" aria-label="Categories">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <ul className="mt-4 space-y-1">
            {[1, 2, 3].map((i) => (
              <li key={i} className="h-9 animate-pulse rounded-md bg-muted/70" />
            ))}
          </ul>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Mobile: trigger + bottom sheet (common e-commerce pattern) */}
      <div className="w-full shrink-0 lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 border-b border-border/60 bg-transparent py-3 text-left transition-colors"
          aria-expanded={sheetOpen}
          aria-controls={sheetId}
          onClick={() => setSheetOpen(true)}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Category</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{currentCategoryLabel}</p>
          </div>
          <svg
            className="h-5 w-5 shrink-0 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mounted && sheet ? createPortal(sheet, document.body) : null}
      </div>

      {/* Desktop: sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block" aria-label="Product categories">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Categories</h2>
        <ul className="mt-4 space-y-0.5" role="list">
          <li>
            <Link
              href="/products"
              className={linkClassDesktop(pathname === '/products' && !filterCategoryId)}
            >
              All products
            </Link>
          </li>
          {categories.map((cat) => {
            const onCategoryPage = pathname === `/categories/${cat.slug}`;
            const filteredHere = pathname === '/products' && filterCategoryId === cat.id;
            const isActive = onCategoryPage || filteredHere;
            return (
              <li key={cat.id}>
                <Link href={`/categories/${cat.slug}`} className={linkClassDesktop(isActive)}>
                  {cat.name}
                  {cat.productCount != null && (
                    <span className="ml-1.5 text-muted-foreground">({cat.productCount})</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
