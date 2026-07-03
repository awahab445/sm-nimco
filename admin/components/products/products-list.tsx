'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchAdminCategories,
  type AdminCategoryListItem,
} from '@/lib/api/categories';
import { fetchAdminProducts, moneyToNumber, type AdminProductListRow, type ProductStatus } from '@/lib/api/products';
import { formatApiError } from '@/lib/api/error-message';
import { PermissionGate } from '@/components/permission-gate';

const STATUS_OPTIONS: { value: '' | ProductStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
];

export function ProductsList() {
  const [rows, setRows] = useState<AdminProductListRow[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategoryListItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | ProductStatus>('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchAdminProducts({
        page,
        limit: 20,
        ...(search.trim().length >= 2 ? { search } : {}),
        ...(status ? { status } : {}),
        ...(categoryId ? { category: categoryId } : {}),
      });
      setRows(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchAdminCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Products
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Catalog SKUs, pricing, and merchandising. Search needs at least 2 characters.
          </p>
        </div>
        <PermissionGate anyOf={['products.create']}>
          <Link
            href="/products/new"
            className={`shrink-0 ${adminUi.btnPrimary}`}
          >
            New product
          </Link>
        </PermissionGate>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Search</label>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, SKU, slug, category…"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="w-full sm:w-44">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as '' | ProductStatus);
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full min-w-[200px] sm:flex-1">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Category</label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">All categories</option>
            {categories
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No products found.</div>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300 w-14" />
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Product</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">SKU</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Type</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Price</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Variants</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => {
                const img = row.images[0];
                return (
                  <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                    <td className="px-3 py-2">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover bg-zinc-100 dark:bg-zinc-800"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{row.name}</div>
                      <div className="text-xs text-zinc-500">{row.slug}</div>
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{row.sku}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{row.type}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {moneyToNumber(row.basePrice).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          row.status === 'active'
                            ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                            : row.status === 'draft'
                              ? 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
                              : 'rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {row._count?.variants ?? 0}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/products/${row.id}`}
                        className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {meta.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} products)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
