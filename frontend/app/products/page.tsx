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

  const pageSubtitle = useMemo(() => {
    if (applied.search) return `Results for "${applied.search}"`;
    if (selectedCategoryId) return 'Browse products in this category.';
    if (hasActiveFilters(applied)) return 'Filtered results.';
    return 'Browse all products.';
  }, [applied, selectedCategoryId]);

  const drawerShowLabel = previewLoading
    ? 'Updating…'
    : previewFacets != null
      ? `Show ${previewFacets.matchingTotal} products`
      : 'Show products';

  const isInitialLoad = loading && data === null;
  const isRefreshing = loading && data !== null;

  const drawer =
    drawerOpen && mounted ? (
      <div className="fixed inset-0 z-[260] flex flex-col bg-background lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
          <h2 className="text-base font-semibold text-foreground">Filters</h2>
          <button
            type="button"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <PlpBrowseTree
            label={browseLabel}
            tree={browseTree}
            selectedCategoryId={draft.categoryIds[0] ?? null}
            onSelectCategory={(id) => setDraft((d) => ({ ...d, categoryIds: id ? [id] : [], page: 1 }))}
            categoryIdBySlug={categoryIdBySlug}
          />
          <PlpFilterAccordions
            filters={draft}
            facets={facets}
            categoryNameById={categoryNameById}
            onFiltersChange={setDraft}
            hideCategoryPanels
          />
        </div>
        <div
          className="shrink-0 border-t border-border bg-background px-4 py-3"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            disabled={previewLoading}
            onClick={() => {
              replaceFilters({ ...draft, page: 1 });
              setDrawerOpen(false);
            }}
            className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {drawerShowLabel}
          </button>
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-2 w-full text-center text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 sm:pb-8 lg:px-8 lg:pb-8">
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
            {!isInitialLoad && meta != null && (
              <p className="mt-2 text-sm text-muted-foreground">
                {meta.total} {meta.total === 1 ? 'product' : 'products'}
                {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
              </p>
            )}
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
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {!drawerOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-[250] border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            onClick={() => {
              setDraft(clonePlpFilters(applied));
              setDrawerOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            Filter
            {hasActiveFilters(applied) ? (
              <span className="rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs">On</span>
            ) : null}
          </button>
        </div>
      )}

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
