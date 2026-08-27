'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import {
  fetchAdminCategories,
  type AdminCategoryListItem,
} from '@/lib/api/categories';
import {
  bulkCreateAdminProducts,
  bulkDeleteAdminProducts,
  deleteAdminProduct,
  fetchAdminProducts,
  moneyToNumber,
  type AdminProductListRow,
  type CreateProductBody,
  type ProductStatus,
  type ProductType,
  type ProductVisibility,
} from '@/lib/api/products';
import { formatApiError } from '@/lib/api/error-message';
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  resolveImageUrl,
} from '@/lib/resolve-image-url';
import { PermissionGate } from '@/components/permission-gate';
import { formatPrice } from '@/lib/currency';

const STATUS_OPTIONS: { value: '' | ProductStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
];

const PRODUCT_CSV_TEMPLATE = [
  'sku,name,type,basePrice,slug,description,shortDescription,status,visibility,cost,weight,seoTitle,metaDescription,tasteProfile,ingredients,servingSuggestions,storageInstructions,dietaryHighlights,spiceLevel,faqs,focusKeywords,productTags',
  'NIMCO-MIX-250,Karachi Nimco Mix,configurable,850,karachi-nimco-mix,Crispy classic mix,Party favourite,active,both,,0.25,Buy Karachi Nimco Mix online,Fresh roasted nimco mix,Spicy & crunchy,"Gram flour, spices",Best with chai,Store sealed in a cool dry place,100% Vegetarian,Medium,Is it vegetarian? | Yes.,nimco mix karachi,nimco,snacks',
].join('\n');

function cell(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const direct = row[key];
    if (direct != null && String(direct).trim()) return String(direct).trim();
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(row)) {
      if (k.toLowerCase().replace(/[\s_-]+/g, '') === lower.replace(/[\s_-]+/g, '')) {
        if (v != null && String(v).trim()) return String(v).trim();
      }
    }
  }
  return '';
}

function parseOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function mapCsvRowToProduct(row: Record<string, unknown>, index: number): CreateProductBody {
  const sku = cell(row, 'sku');
  const name = cell(row, 'name');
  const typeRaw = cell(row, 'type') || 'configurable';
  const basePriceRaw = cell(row, 'basePrice', 'base_price', 'price');
  const basePrice = Number(basePriceRaw);

  if (!sku) throw new Error(`Row ${index + 1}: sku is required`);
  if (!name) throw new Error(`Row ${index + 1}: name is required`);
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    throw new Error(`Row ${index + 1}: basePrice must be a non-negative number`);
  }

  const allowedTypes: ProductType[] = ['simple', 'configurable', 'bundle', 'virtual'];
  const type = (allowedTypes.includes(typeRaw as ProductType)
    ? typeRaw
    : 'configurable') as ProductType;

  const statusRaw = cell(row, 'status');
  const visibilityRaw = cell(row, 'visibility');
  const status = (['draft', 'active', 'disabled'].includes(statusRaw)
    ? statusRaw
    : undefined) as ProductStatus | undefined;
  const visibility = (['catalog', 'search', 'both', 'none'].includes(visibilityRaw)
    ? visibilityRaw
    : undefined) as ProductVisibility | undefined;

  const cost = parseOptionalNumber(cell(row, 'cost'));
  const weight = parseOptionalNumber(cell(row, 'weight'));
  const shippingWeight = parseOptionalNumber(cell(row, 'shippingWeight', 'shipping_weight'));

  return {
    sku,
    name,
    type,
    basePrice,
    ...(cell(row, 'slug') ? { slug: cell(row, 'slug') } : {}),
    ...(cell(row, 'description') ? { description: cell(row, 'description') } : {}),
    ...(cell(row, 'shortDescription', 'short_description')
      ? { shortDescription: cell(row, 'shortDescription', 'short_description') }
      : {}),
    ...(status ? { status } : {}),
    ...(visibility ? { visibility } : {}),
    ...(cost !== undefined ? { cost } : {}),
    ...(weight !== undefined ? { weight } : {}),
    ...(shippingWeight !== undefined ? { shippingWeight } : {}),
    ...(cell(row, 'shippingWeightUnit', 'shipping_weight_unit')
      ? { shippingWeightUnit: cell(row, 'shippingWeightUnit', 'shipping_weight_unit') }
      : {}),
    ...(cell(row, 'seoTitle', 'seo_title')
      ? { seoTitle: cell(row, 'seoTitle', 'seo_title') }
      : {}),
    ...(cell(row, 'metaDescription', 'meta_description')
      ? { metaDescription: cell(row, 'metaDescription', 'meta_description') }
      : {}),
    ...(cell(row, 'tasteProfile', 'taste_profile')
      ? { tasteProfile: cell(row, 'tasteProfile', 'taste_profile') }
      : {}),
    ...(cell(row, 'ingredients') ? { ingredients: cell(row, 'ingredients') } : {}),
    ...(cell(row, 'servingSuggestions', 'serving_suggestions')
      ? { servingSuggestions: cell(row, 'servingSuggestions', 'serving_suggestions') }
      : {}),
    ...(cell(row, 'storageInstructions', 'storage_instructions')
      ? { storageInstructions: cell(row, 'storageInstructions', 'storage_instructions') }
      : {}),
    ...(cell(row, 'dietaryHighlights', 'dietary_highlights')
      ? { dietaryHighlights: cell(row, 'dietaryHighlights', 'dietary_highlights') }
      : {}),
    ...(cell(row, 'spiceLevel', 'spice_level')
      ? { spiceLevel: cell(row, 'spiceLevel', 'spice_level') }
      : {}),
    ...(cell(row, 'faqs') ? { faqs: cell(row, 'faqs') } : {}),
    ...(cell(row, 'focusKeywords', 'focus_keywords')
      ? { focusKeywords: cell(row, 'focusKeywords', 'focus_keywords') }
      : {}),
    ...(cell(row, 'productTags', 'product_tags')
      ? { productTags: cell(row, 'productTags', 'product_tags') }
      : {}),
  };
}
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, search, status, categoryId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

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

  const allVisibleSelected =
    rows.length > 0 && rows.every((row) => selectedIds.has(row.id));
  const someVisibleSelected = rows.some((row) => selectedIds.has(row.id));

  const toggleSelectAll = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        const next = new Set(current);
        rows.forEach((row) => next.delete(row.id));
        return next;
      }
      const next = new Set(current);
      rows.forEach((row) => next.add(row.id));
      return next;
    });
  };

  const toggleSelectOne = (productId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const onDeleteOne = async (row: AdminProductListRow) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${row.name}"?\n\nThis archives the product (soft delete). It will no longer appear in the catalog.`,
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    try {
      await deleteAdminProduct(row.id);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(row.id);
        return next;
      });
      setToast({ kind: 'success', message: `"${row.name}" deleted successfully.` });
      await load();
    } catch (e) {
      setToast({ kind: 'error', message: formatApiError(e) });
    } finally {
      setDeletingId(null);
    }
  };

  const onBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${ids.length} selected product${ids.length === 1 ? '' : 's'}?\n\nThis archives them (soft delete). They will no longer appear in the catalog.`,
      )
    ) {
      return;
    }
    setBulkDeleting(true);
    try {
      const res = await bulkDeleteAdminProducts(ids);
      setSelectedIds(new Set());
      setToast({
        kind: 'success',
        message: `${res.deletedCount} product${res.deletedCount === 1 ? '' : 's'} deleted successfully.`,
      });
      await load();
    } catch (e) {
      setToast({ kind: 'error', message: formatApiError(e) });
    } finally {
      setBulkDeleting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const blob = new Blob([PRODUCT_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'products-bulk-upload-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onCsvSelected = (file: File | null) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setToast({ kind: 'error', message: 'Please select a .csv file.' });
      if (csvInputRef.current) csvInputRef.current.value = '';
      return;
    }

    setCsvUploading(true);
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        void (async () => {
          try {
            if (result.errors.length > 0) {
              const first = result.errors[0];
              throw new Error(first.message || 'Failed to parse CSV');
            }
            const rawRows = (result.data ?? []).filter((row) =>
              Object.values(row).some((v) => String(v ?? '').trim()),
            );
            if (rawRows.length === 0) {
              throw new Error('CSV has no data rows.');
            }
            const products = rawRows.map((row, index) => mapCsvRowToProduct(row, index));
            const res = await bulkCreateAdminProducts(products);
            const parts: string[] = [];
            if (res.createdCount > 0) {
              parts.push(
                `${res.createdCount} created`,
              );
            }
            if ((res.updatedCount ?? 0) > 0) {
              parts.push(`${res.updatedCount} updated`);
            }
            setToast({
              kind: 'success',
              message:
                parts.length > 0
                  ? `Bulk upload complete: ${parts.join(', ')} (${res.requestedCount} row${res.requestedCount === 1 ? '' : 's'}).`
                  : `Processed ${res.requestedCount} row${res.requestedCount === 1 ? '' : 's'} with no changes.`,
            });
            await load();
          } catch (e) {
            setToast({
              kind: 'error',
              message: e instanceof Error ? e.message : formatApiError(e),
            });
          } finally {
            setCsvUploading(false);
            if (csvInputRef.current) csvInputRef.current.value = '';
          }
        })();
      },
      error: (err) => {
        setCsvUploading(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
        setToast({ kind: 'error', message: err.message || 'Failed to read CSV file.' });
      },
    });
  };

  const busy = deletingId !== null || bulkDeleting || csvUploading;

  return (
    <div className="mx-auto max-w-6xl">
      {toast ? (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-3 py-2 text-sm shadow-lg ${
            toast.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}

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
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className={`shrink-0 ${adminUi.btnSecondary}`}
            >
              CSV template
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onCsvSelected(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              disabled={csvUploading}
              onClick={() => csvInputRef.current?.click()}
              className={`shrink-0 ${adminUi.btnSecondary}`}
            >
              {csvUploading ? 'Uploading…' : 'Upload CSV'}
            </button>
            <Link href="/products/new" className={`shrink-0 ${adminUi.btnPrimary}`}>
              New product
            </Link>
          </div>
        </PermissionGate>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-[200px] flex-1">
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
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Category
          </label>
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

      {selectedIds.size > 0 ? (
        <PermissionGate anyOf={['products.delete']}>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-900/40 dark:bg-red-950/30">
            <span className="font-medium text-red-900 dark:text-red-200">
              {selectedIds.size} product{selectedIds.size === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onBulkDelete()}
              className="rounded-lg bg-red-700 px-3 py-1.5 font-medium text-white disabled:opacity-50 hover:bg-red-800"
            >
              {bulkDeleting ? 'Deleting…' : 'Delete Selected'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setSelectedIds(new Set())}
              className="font-medium text-red-900 underline disabled:opacity-50 dark:text-red-200"
            >
              Clear selection
            </button>
          </div>
        </PermissionGate>
      ) : null}

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
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="w-10 px-3 py-3">
                  <PermissionGate anyOf={['products.delete']}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
                      }}
                      onChange={toggleSelectAll}
                      aria-label="Select all products on this page"
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                  </PermissionGate>
                </th>
                <th className="w-14 px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300" />
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Product</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">SKU</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Type</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Price</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">Variants</th>
                <th className="px-3 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => {
                const img = row.images[0];
                return (
                  <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                    <td className="px-3 py-2">
                      <PermissionGate anyOf={['products.delete']}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelectOne(row.id)}
                          aria-label={`Select ${row.name}`}
                          className="h-4 w-4 rounded border-zinc-300"
                        />
                      </PermissionGate>
                    </td>
                    <td className="px-3 py-2">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveImageUrl(img.url) || PRODUCT_IMAGE_PLACEHOLDER}
                          alt=""
                          className="h-10 w-10 rounded-md bg-zinc-100 object-cover dark:bg-zinc-800"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER;
                          }}
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
                      {formatPrice(moneyToNumber(row.basePrice))}
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
                      <div className="inline-flex items-center gap-3">
                        <Link
                          href={`/products/${row.id}`}
                          className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                        >
                          Open
                        </Link>
                        <PermissionGate anyOf={['products.delete']}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void onDeleteOne(row)}
                            className="text-sm font-medium text-red-700 underline disabled:opacity-50 dark:text-red-400"
                            title={`Delete ${row.name}`}
                          >
                            {deletingId === row.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </PermissionGate>
                      </div>
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
