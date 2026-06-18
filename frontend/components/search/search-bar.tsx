'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/lib/api-client';
import { formatPrice } from '@/lib/currency';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const SUGGESTIONS_LIMIT = 8;

type SuggestionItem = {
  id: string;
  name: string;
  slug: string;
  basePrice: string | number;
  images: Array<{ url: string }>;
};

export function SearchBar({ variant = 'default' }: { variant?: 'default' | 'header' }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        setOpen(true);
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
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setTotal(0);
      setOpen(false);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(q), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    if (q.length > 0) {
      router.push(`/products?search=${encodeURIComponent(q)}`);
    } else {
      router.push('/products');
    }
  };

  const formatSuggestionPrice = (value: string | number) => {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isNaN(n) ? '' : formatPrice(n);
  };

  const isHeader = variant === 'header';

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="header-search" className="sr-only">
          Search products
        </label>
        <div className="relative">
          <input
            id="header-search"
            type="search"
            autoComplete="off"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= MIN_QUERY_LENGTH && setOpen(true)}
            className={
              isHeader
                ? 'w-full rounded-lg border border-white/30 bg-white/15 py-2 pl-4 pr-10 text-sm text-white placeholder:text-blue-100/80 focus:border-blue-200 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/25'
                : 'w-full rounded-lg border border-input bg-card py-2 pl-4 pr-10 text-sm text-brand-text placeholder:text-brand-accent/70 focus:border-brand-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-primary/25'
            }
            aria-expanded={open}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
          />
          <span
            className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 ${isHeader ? 'text-blue-100' : 'text-muted-foreground'}`}
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </form>

      {open && (query.trim().length >= MIN_QUERY_LENGTH || suggestions.length > 0) && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" aria-hidden />
              <span className="ml-2">Searching...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No products found. Try a different search.
            </div>
          ) : (
            <>
              <ul className="py-1">
                {suggestions.map((item) => (
                  <li key={item.id} role="option">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-left hover:bg-muted"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                        {item.images?.[0]?.url ? (
                          <img
                            src={item.images[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">—</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">{item.name}</span>
                        <span className="text-sm text-muted-foreground">{formatSuggestionPrice(item.basePrice)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {total > suggestions.length && (
                <div className="border-t border-border">
                  <Link
                    href={`/products?search=${encodeURIComponent(query.trim())}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-muted hover:opacity-90"
                  >
                    See all {total} results
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
