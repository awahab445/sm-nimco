'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  productApi,
  inventoryApi,
  categoryApi,
  type ProductListResponse,
  type ProductFacets,
  type Category,
} from '@/lib/api-client';
import { ProductCard, getVariantForCart } from '@/components/product/product-card';
import {
  parsePlpFilters,
  serializePlpFilters,
  plpStateToListQuery,
  plpStateToFacetQuery,
  clonePlpFilters,
  type PlpFilterState,
} from '@/lib/plp-url-state';
import { PlpFilterAccordions } from '@/components/products/plp-filter-accordions';
import { PlpActiveFilterChips } from '@/components/products/plp-active-filter-chips';
import { PlpBrowseTree, PlpBrowseBreadcrumbs } from '@/components/products/plp-browse-tree';
import { PlpProductGridSkeleton } from '@/components/products/plp-product-grid-skeleton';
import {
  PlpToolbar,
  plpListingClass,
  sortProducts,
  type PlpListingMode,
  type PlpSortOption,
} from '@/components/products/plp-toolbar';
import { PlpPagination } from '@/components/products/plp-pagination';
import { plpBrowseApi, type PlpBrowseTreeNode } from '@/lib/api-client';
import { findBrowseNodeLabel } from '@/lib/plp-browse-tree';
import { trackSearch, trackViewItemList } from '@/lib/analytics/events';

function flattenCategories(res: { data?: Category[] } | CategoryTreeLike[]): Category[] {
  if (Array.isArray(res)) {
    const out: Category[] = [];
    const walk = (nodes: CategoryTreeLike[]) => {
      for (const n of nodes) {
        out.push(n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(res as CategoryTreeLike[]);
    return out;
  }
  return res.data ?? [];
}

type CategoryTreeLike = Category & { children?: CategoryTreeLike[] };

function hasActiveFilters(f: PlpFilterState): boolean {
  const attrActive = Object.values(f.facetAttr).some((arr) => arr.length > 0);
  return (
    f.categoryIds.length > 0 ||
    attrActive ||
    (f.minPrice != null && Number.isFinite(f.minPrice)) ||
    (f.maxPrice != null && Number.isFinite(f.maxPrice))
  );
}

function countActiveFilters(f: PlpFilterState): number {
  let count = f.categoryIds.length;
  for (const values of Object.values(f.facetAttr)) {
    count += values.length;
  }
  if (f.minPrice != null && Number.isFinite(f.minPrice)) count += 1;
  if (f.maxPrice != null && Number.isFinite(f.maxPrice)) count += 1;
  return count;
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const spKey = searchParams.toString();

  const applied = useMemo(() => parsePlpFilters(new URLSearchParams(spKey)), [spKey]);

  const replaceFilters = useCallback(
    (next: PlpFilterState) => {
      const qs = serializePlpFilters(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const [categoryNameById, setCategoryNameById] = useState<Map<string, string>>(() => new Map());
  const [categoryIdBySlug, setCategoryIdBySlug] = useState<Map<string, string>>(() => new Map());
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [facets, setFacets] = useState<ProductFacets | null>(null);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<PlpFilterState>(applied);
  const [previewFacets, setPreviewFacets] = useState<ProductFacets | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [browseLabel, setBrowseLabel] = useState('Categories');
  const [browseTree, setBrowseTree] = useState<PlpBrowseTreeNode[]>([]);
  const [sortBy, setSortBy] = useState<PlpSortOption>('featured');
  const [listingMode, setListingMode] = useState<PlpListingMode>('grid-4');

  const selectedCategoryId = applied.categoryIds[0] ?? null;

  const listQuery = useMemo(() => plpStateToListQuery(applied), [applied]);
  const listQueryKey = useMemo(() => JSON.stringify(listQuery), [listQuery]);
  const facetQuery = useMemo(() => plpStateToFacetQuery(applied), [applied]);
  const facetQueryKey = useMemo(() => JSON.stringify(facetQuery), [facetQuery]);
  const viewListDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    plpBrowseApi
      .getBrowseTree()
      .then((res) => {
        if (cancelled) return;
        setBrowseLabel(res.data?.label ?? 'Categories');
        setBrowseTree(res.data?.tree ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setBrowseLabel('Categories');
          setBrowseTree([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    categoryApi
      .getCategories()
      .then((res) => {
        if (cancelled) return;
        const list = flattenCategories(res as { data?: Category[] } | CategoryTreeLike[]);
        const m = new Map<string, string>();
        const bySlug = new Map<string, string>();
        for (const c of list) {
          m.set(c.id, c.name);
          if (c.slug) bySlug.set(c.slug, c.id);
        }
        setCategoryNameById(m);
        setCategoryIdBySlug(bySlug);
      })
      .catch(() => {
        if (!cancelled) {
          setCategoryNameById(new Map());
          setCategoryIdBySlug(new Map());
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    setDraft(clonePlpFilters(applied));
  }, [drawerOpen, applied]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productApi
      .listProducts(listQuery)
      .then((res) => {
        if (!cancelled) setData(res);
        const variantIds = (res?.data ?? []).map((p) => getVariantForCart(p)?.id).filter(Boolean) as string[];
        if (variantIds.length > 0) {
          inventoryApi.getAvailability(variantIds).then((r) => {
            if (!cancelled) setAvailability(r.data);
          });
        } else if (!cancelled) setAvailability({});
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listQueryKey]);

  useEffect(() => {
    let cancelled = false;
    productApi
      .getFacets(facetQuery)
      .then((f) => {
        if (!cancelled) setFacets(f);
      })
      .catch(() => {
        if (!cancelled) setFacets(null);
      });
    return () => {
      cancelled = true;
    };
  }, [facetQueryKey]);

  const previewDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewGen = useRef(0);
  useEffect(() => {
    if (!drawerOpen) {
      previewGen.current += 1;
      setPreviewFacets(null);
      setPreviewLoading(false);
      return;
    }
    if (previewDebounce.current) clearTimeout(previewDebounce.current);
    setPreviewFacets(null);
    setPreviewLoading(true);
    const gen = ++previewGen.current;
    previewDebounce.current = setTimeout(() => {
      const q = plpStateToFacetQuery(draft);
      productApi
        .getFacets(q)
        .then((f) => {
          if (previewGen.current === gen) setPreviewFacets(f);
        })
        .catch(() => {
          if (previewGen.current === gen) setPreviewFacets(null);
        })
        .finally(() => {
          if (previewGen.current === gen) setPreviewLoading(false);
        });
    }, 320);
    return () => {
      if (previewDebounce.current) clearTimeout(previewDebounce.current);
    };
  }, [drawerOpen, draft]);

  const products = data?.data ?? [];
  const displayProducts = useMemo(
    () => sortProducts(data?.data ?? [], sortBy),
    [data?.data, sortBy],
  );
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const page = applied.page;

  const buildPageUrl = (p: number) => {
    const next: PlpFilterState = { ...applied, page: p };
    const qs = serializePlpFilters(next);
    return qs ? `/products?${qs}` : '/products';
  };

  const clearAllFilters = () => {
    replaceFilters({
      page: 1,
      search: applied.search,
      categoryIds: [],
      facetAttr: {},
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const selectBrowseCategory = useCallback(
    (categoryId: string | null) => {
      replaceFilters({
        ...applied,
        categoryIds: categoryId ? [categoryId] : [],
        page: 1,
      });
    },
    [applied, replaceFilters],
  );

  const pageTitle = useMemo(() => {
    if (applied.search) return `Search results`;
    const fromTree = findBrowseNodeLabel(browseTree, selectedCategoryId, categoryIdBySlug);
    if (fromTree) return fromTree;
    if (selectedCategoryId) {
      return categoryNameById.get(selectedCategoryId) ?? 'Products';
    }
    return 'Products';
  }, [applied.search, browseTree, selectedCategoryId, categoryNameById, categoryIdBySlug]);

  useEffect(() => {
    if (!data?.data?.length) return;
    if (viewListDebounce.current) clearTimeout(viewListDebounce.current);
    viewListDebounce.current = setTimeout(() => {
      const listId = selectedCategoryId ?? applied.search ?? 'all-products';
      trackViewItemList(String(listId), pageTitle, data.data);
      if (applied.search?.trim()) {
        trackSearch(applied.search, {
          contentIds: data.data.map((p) => p.sku).filter(Boolean),
        });
      }
    }, 300);
    return () => {
      if (viewListDebounce.current) clearTimeout(viewListDebounce.current);
    };
  }, [data, selectedCategoryId, applied.search, pageTitle]);

  const pageSubtitle = useMemo(() => {
    if (applied.search) return `Results for "${applied.search}"`;
    if (selectedCategoryId) return 'Browse products in this category.';
    if (hasActiveFilters(applied)) return 'Filtered results.';
    return 'Browse all products.';
  }, [applied, selectedCategoryId]);

  const drawerFacetSource = previewFacets ?? facets;
  const activeFilterCount = countActiveFilters(applied);

  const applyDrawerFilters = () => {
    replaceFilters({ ...draft, page: 1 });
    setDrawerOpen(false);
  };

  const drawer =
    drawerOpen && mounted ? (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[260] animate-plp-backdrop-enter bg-foreground/35 lg:hidden"
          aria-label="Close filters"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className="fixed inset-y-0 left-0 z-[261] flex w-[min(22rem,88vw)] animate-plp-drawer-enter flex-col border-r border-border/60 bg-background shadow-[4px_0_28px_color-mix(in_srgb,var(--foreground)_10%,transparent)] lg:hidden"
          id="plp-mobile-filters"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border/50 bg-muted/40 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
              Filter
            </h2>
            <button
              type="button"
              className="p-1 text-foreground transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))]"
              aria-label="Close filters"
              onClick={() => setDrawerOpen(false)}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 14" fill="none" aria-hidden>
                <path d="M15 0L1 14m14 0L1 0" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2">
            <PlpBrowseTree
              label={browseLabel}
              tree={browseTree}
              selectedCategoryId={draft.categoryIds[0] ?? null}
              onSelectCategory={(id) => setDraft((d) => ({ ...d, categoryIds: id ? [id] : [], page: 1 }))}
              categoryIdBySlug={categoryIdBySlug}
            />
            <div className="mt-2 border-t border-border/50">
              <PlpFilterAccordions
                filters={draft}
                facets={drawerFacetSource}
                categoryNameById={categoryNameById}
                onFiltersChange={setDraft}
                hideCategoryPanels
              />
            </div>
          </div>
          <div
            className="shrink-0 space-y-2 border-t border-border/50 bg-background px-5 py-4"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <button
              type="button"
              disabled={previewLoading}
              onClick={applyDrawerFilters}
              className="plp-filter-apply w-full py-3.5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {previewLoading
                ? 'Applying…'
                : drawerFacetSource != null
                  ? `Show results (${drawerFacetSource.matchingTotal})`
                  : 'Show results'}
            </button>
            {hasActiveFilters(draft) ? (
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    page: 1,
                    search: draft.search,
                    categoryIds: [],
                    facetAttr: {},
                    minPrice: undefined,
                    maxPrice: undefined,
                  })
                }
                className="w-full py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))]"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>
      </>
    ) : null;

  const isInitialLoad = loading && data === null;
  const isRefreshing = loading && data !== null;

  const openFiltersDrawer = () => {
    setDraft(clonePlpFilters(applied));
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="flex w-full min-w-0 flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
        <aside className="hidden w-[15.5rem] shrink-0 lg:block xl:w-64" aria-label="Product navigation and filters">
          <div className="sticky top-24 space-y-1">
            <PlpBrowseTree
              label={browseLabel}
              tree={browseTree}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={selectBrowseCategory}
              categoryIdBySlug={categoryIdBySlug}
            />
            <div className="mt-6 flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                Filter
              </h2>
              <button
                type="button"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters(applied)}
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))] disabled:opacity-40"
              >
                Clear all
              </button>
            </div>
            <PlpFilterAccordions
              filters={applied}
              facets={facets}
              categoryNameById={categoryNameById}
              onFiltersChange={(next) => replaceFilters({ ...next, page: 1 })}
              hideCategoryPanels
            />
          </div>
        </aside>

        <div className="min-w-0 w-full flex-1">
          <PlpBrowseBreadcrumbs
            tree={browseTree}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={selectBrowseCategory}
            categoryIdBySlug={categoryIdBySlug}
          />
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {pageTitle}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{pageSubtitle}</p>
          </div>

          <PlpToolbar
            sortBy={sortBy}
            onSortChange={setSortBy}
            listingMode={listingMode}
            onListingModeChange={setListingMode}
            onOpenFilters={openFiltersDrawer}
            filterCount={activeFilterCount}
            showFilterButton
            filterExpanded={drawerOpen}
            filterControlsId="plp-mobile-filters"
            resultSummary={
              !isInitialLoad && meta != null ? (
                <p className="plp-toolbar__result-text text-sm text-muted-foreground">
                  Showing {meta.total} {meta.total === 1 ? 'result' : 'results'}
                </p>
              ) : null
            }
          />

          <PlpActiveFilterChips
            filters={applied}
            categoryNameById={categoryNameById}
            onChange={replaceFilters}
            onClearAll={clearAllFilters}
          />

          {error && (
            <div className="mb-4 border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
          )}

          {isInitialLoad ? (
            <PlpProductGridSkeleton
              columns={listingMode === 'grid-3' ? 'comfortable' : listingMode === 'list' ? 'list' : 'default'}
            />
          ) : products.length === 0 ? (
            <div className="py-16 text-center sm:py-24">
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
              {hasActiveFilters(applied) ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-3 text-xs font-medium uppercase tracking-wider text-foreground underline-offset-4 hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="relative">
              {isRefreshing && (
                <div
                  className="pointer-events-none absolute inset-0 z-10 bg-background/55 backdrop-blur-[1px]"
                  aria-hidden
                />
              )}
              <div className={isRefreshing ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                <div className={plpListingClass(listingMode)}>
                  {displayProducts.map((product) => {
                    const variant = getVariantForCart(product);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        layout={listingMode === 'list' ? 'list' : 'grid'}
                        availableQuantity={variant ? availability[variant.id] : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!isInitialLoad ? (
            <PlpPagination page={page} totalPages={totalPages} hrefForPage={buildPageUrl} />
          ) : null}
        </div>
      </div>

      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <PlpProductGridSkeleton count={6} />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
