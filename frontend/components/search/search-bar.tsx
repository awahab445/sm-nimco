'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { productApi } from '@/lib/api-client';
import { formatPrice } from '@/lib/currency';
import { useHydrated } from '@/lib/use-hydrated';
import { storefrontUi } from '@/lib/storefront-ui';
import { trackSearch } from '@/lib/analytics/events';
import { STOREFRONT_OPEN_SEARCH_EVENT } from '@/lib/storefront-events';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const SUGGESTIONS_LIMIT = 8;

type SuggestionItem = {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  basePrice: string | number;
  images: Array<{ url: string }>;
};

/** Thin outline search — matches Kalles header icon stroke. */
function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function SearchBar() {
  const router = useRouter();
  const hydrated = useHydrated();
  const titleId = useId();
  const inputId = useId();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    setLoading(true);
    productApi
      .searchSuggestions(q, SUGGESTIONS_LIMIT, { signal })
      .then((res) => {
        setSuggestions(res.data);
        setTotal(res.total);
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          setSuggestions([]);
          setTotal(0);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const onOpenSearch = () => openDrawer();
    window.addEventListener(STOREFRONT_OPEN_SEARCH_EVENT, onOpenSearch);
    return () => window.removeEventListener(STOREFRONT_OPEN_SEARCH_EVENT, onOpenSearch);
  }, [openDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [drawerOpen, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < MIN_QUERY_LENGTH) return;
    debounceRef.current = setTimeout(() => fetchSuggestions(q), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions, drawerOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    closeDrawer();
    if (q.length > 0) {
      trackSearch(q, {
        contentIds: suggestions.map((s) => s.sku).filter(Boolean) as string[],
      });
      router.push(`/products?search=${encodeURIComponent(q)}`);
    } else {
      router.push('/products');
    }
  };

  const formatSuggestionPrice = (value: string | number) => {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isNaN(n) ? '' : formatPrice(n);
  };

  const showResults = query.trim().length >= MIN_QUERY_LENGTH;

  const drawer =
    drawerOpen && hydrated ? (
      <div
        className="search-drawer fixed inset-0 z-[210] flex min-h-[100dvh] justify-end"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="min-h-0 min-w-0 flex-1 cursor-pointer bg-foreground/40 backdrop-blur-[1px]"
          aria-label="Close search"
          onClick={closeDrawer}
        />
        <aside
          className="search-drawer__panel flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] shrink-0 flex-col border-l border-border bg-card shadow-product-card sm:w-[min(100vw,34rem)] sm:max-w-[min(100vw,34rem)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex min-h-[50px] shrink-0 items-center justify-between gap-3 border-b border-border pl-5 pr-1 pt-[max(0px,env(safe-area-inset-top))]">
            <p
              id={titleId}
              className="font-sans text-[17px] font-medium uppercase tracking-normal text-foreground"
            >
              Search our site
            </p>
            <button
              type="button"
              className="inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center text-foreground transition-colors hover:text-primary-hover"
              aria-label="Close search"
              onClick={closeDrawer}
            >
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
                <path d="M15 0L1 14m14 0L1 0" stroke="currentColor" strokeWidth={1.5} />
              </svg>
            </button>
          </div>

          <div className="shrink-0 border-b border-border px-4 py-3">
            <form onSubmit={handleSubmit} role="search">
              <label htmlFor={inputId} className="sr-only">
                Search products
              </label>
              <div className="flex items-center gap-2 border-b border-foreground/20 pb-2">
                <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  id={inputId}
                  type="search"
                  autoComplete="off"
                  placeholder="Search for products"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  suppressHydrationWarning
                  className="min-w-0 flex-1 border-0 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                  aria-controls="search-drawer-results"
                  aria-autocomplete="list"
                />
                {query ? (
                  <button
                    type="button"
                    className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setQuery('');
                      setSuggestions([]);
                      setTotal(0);
                      inputRef.current?.focus();
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div
            id="search-drawer-results"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            role="listbox"
            aria-label="Search results"
          >
            {!showResults ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Type at least {MIN_QUERY_LENGTH} characters to search.
              </p>
            ) : loading ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <span
                  className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary"
                  aria-hidden
                />
                <span className="ml-2">Searching...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No products found. Try a different search.
              </p>
            ) : (
              <>
                <ul className="py-1">
                  {suggestions.map((item) => (
                    <li key={item.id} role="option" aria-selected={false}>
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeDrawer}
                        className="flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-muted">
                          {item.images?.[0]?.url ? (
                            <img
                              src={item.images[0].url}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              —
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatSuggestionPrice(item.basePrice)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {total > suggestions.length ? (
                  <div className="border-t border-border">
                    <Link
                      href={`/products?search=${encodeURIComponent(query.trim())}`}
                      onClick={closeDrawer}
                      className={`block px-4 py-3 text-center text-sm ${storefrontUi.link} hover:bg-muted`}
                    >
                      See all {total} results
                    </Link>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </aside>
      </div>
    ) : null;

  return (
    <>
      {hydrated ? (
        <button
          type="button"
          suppressHydrationWarning
          className="site-header__icon-btn inline-flex items-center justify-center text-foreground transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Search products"
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          onClick={openDrawer}
        >
          <SearchIcon className="h-[22px] w-[22px]" />
        </button>
      ) : (
        <span className="site-header__icon-btn inline-flex items-center justify-center" aria-hidden>
          <SearchIcon className="h-[22px] w-[22px]" />
        </span>
      )}
      {hydrated && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
