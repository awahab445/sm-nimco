'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
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
import { plpBrowseApi, type PlpBrowseTreeNode } from '@/lib/api-client';
import { findBrowseNodeLabel } from '@/lib/plp-browse-tree';
import { storefrontUi } from '@/lib/storefront-ui';
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

function FilterFunnelIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
      />
    </svg>
  );
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
          className="fixed inset-0 z-[260] animate-plp-backdrop-enter bg-black/45 lg:hidden"
          aria-label="Close filters"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className="fixed inset-x-0 bottom-0 z-[261] flex max-h-[min(88vh,720px)] animate-plp-sheet-enter flex-col rounded-t-2xl border-t border-border bg-background shadow-2xl lg:hidden"
          id="plp-mobile-filters"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
        >
          <div className="flex shrink-0 flex-col border-b border-border pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
            <div className="flex justify-center py-2" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-muted-foreground/25" />
            </div>
            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className="text-base font-semibold text-foreground">Filters</h2>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <PlpBrowseTree
              label={browseLabel}
              tree={browseTree}
              selectedCategoryId={draft.categoryIds[0] ?? null}
              onSelectCategory={(id) => setDraft((d) => ({ ...d, categoryIds: id ? [id] : [], page: 1 }))}
              categoryIdBySlug={categoryIdBySlug}
            />
            <div className="mt-4 border-t border-border pt-4">
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
            className="shrink-0 space-y-2 border-t border-border bg-background px-4 py-3"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <button
              type="button"
              disabled={previewLoading}
              onClick={applyDrawerFilters}
              className={`w-full py-3 text-sm font-semibold ${storefrontUi.btnPrimary}`}
            >
              {previewLoading
                ? 'Applying…'
                : drawerFacetSource != null
                  ? `Apply Filters (${drawerFacetSource.matchingTotal})`
                  : 'Apply Filters'}
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className={`w-full py-2.5 ${storefrontUi.btnNeutral}`}
            >
              Close
            </button>
            {hasActiveFilters(draft) && (
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
                className="w-full text-center text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
              >
                Clear all filters
              </button>
            )}
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
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="flex w-full min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="hidden w-72 shrink-0 lg:block" aria-label="Product navigation and filters">
          <div className="sticky top-20 space-y-4">
            <PlpBrowseTree
              label={browseLabel}
              tree={browseTree}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={selectBrowseCategory}
              categoryIdBySlug={categoryIdBySlug}
            />
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Refine</h2>
              <button
                type="button"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters(applied)}
                className="text-xs font-medium text-primary underline-offset-2 hover:underline disabled:opacity-40"
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
          <div className="mb-4 lg:hidden">
            <PlpBrowseTree
              label={browseLabel}
              tree={browseTree}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={selectBrowseCategory}
              categoryIdBySlug={categoryIdBySlug}
            />
          </div>
          <PlpBrowseBreadcrumbs
            tree={browseTree}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={selectBrowseCategory}
            categoryIdBySlug={categoryIdBySlug}
          />
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
            <p className="mt-1 text-muted-foreground">{pageSubtitle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {!isInitialLoad && meta != null ? (
                <p className="text-sm text-muted-foreground">
                  {meta.total} {meta.total === 1 ? 'product' : 'products'}
                  {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
                </p>
              ) : null}
              <button
                type="button"
                onClick={openFiltersDrawer}
                className={`inline-flex items-center gap-2 lg:hidden ${storefrontUi.btnNeutral} px-3.5 py-2 shadow-sm active:scale-[0.98]`}
                aria-expanded={drawerOpen}
                aria-controls="plp-mobile-filters"
              >
                <FilterFunnelIcon className="h-4 w-4 text-muted-foreground" />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-xs font-semibold text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <PlpActiveFilterChips filters={applied} categoryNameById={categoryNameById} onChange={replaceFilters} />

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">{error}</div>
          )}

          {isInitialLoad ? (
            <PlpProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 py-16 text-center">
              <p className="text-muted-foreground">No products match your filters.</p>
            </div>
          ) : (
            <div className="relative">
              {isRefreshing && (
                <div
                  className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-background/55 backdrop-blur-[1px]"
                  aria-hidden
                />
              )}
              <div className={isRefreshing ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
                    const variant = getVariantForCart(product);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showViewOnly
                        availableQuantity={variant ? availability[variant.id] : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {totalPages > 1 && !isInitialLoad && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={buildPageUrl(page - 1)}
                  className={storefrontUi.btnNeutral}
                >
                  Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={buildPageUrl(page + 1)}
                  className={storefrontUi.btnNeutral}
                >
                  Next
                </Link>
              )}
            </div>
          )}
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
