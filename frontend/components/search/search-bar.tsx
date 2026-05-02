'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/lib/api-client';
import { DEFAULT_CURRENCY } from '@/lib/config';

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

export function SearchBar() {
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

  const formatPrice = (value: string | number) => {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isNaN(n) ? '' : new Intl.NumberFormat(undefined, { style: 'currency', currency: DEFAULT_CURRENCY }).format(n);
  };

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
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:placeholder-zinc-400 dark:focus:border-blue-400 dark:focus:bg-zinc-900 dark:focus:ring-blue-400"
            aria-expanded={open}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
          />
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-zinc-500" aria-hidden>
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
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500 dark:text-zinc-400">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-zinc-600 dark:border-t-blue-400" aria-hidden />
              <span className="ml-2">Searching...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-zinc-400">
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
                      className="flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-zinc-800">
                        {item.images?.[0]?.url ? (
                          <img
                            src={item.images[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-zinc-500">—</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-gray-900 dark:text-zinc-50">{item.name}</span>
                        <span className="text-sm text-gray-500 dark:text-zinc-400">{formatPrice(item.basePrice)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {total > suggestions.length && (
                <div className="border-t border-gray-100 dark:border-zinc-800">
                  <Link
                    href={`/products?search=${encodeURIComponent(query.trim())}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-zinc-800"
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
