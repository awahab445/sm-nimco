'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminUi } from '@/lib/admin-ui';
import {
  createBundleDeal,
  fetchBundleDeal,
  previewBundlePricing,
  updateBundleDeal,
  type BundleDeal,
  type BundleDealItemInput,
  type BundleDealStatus,
  type BundlePricingPreview,
} from '@/lib/api/bundle-deals';
import { fetchAdminProducts, fetchAdminProduct, type AdminProductListRow } from '@/lib/api/products';
import { formatApiError } from '@/lib/api/error-message';

type SelectedRow = BundleDealItemInput & {
  key: string;
  productName: string;
  productSku: string;
  thumbnail?: string;
  variantOptions: Array<{ id: string; name: string; price: number }>;
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatRs(amount: number) {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function resolveAdminImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

type Props = {
  dealId?: string;
};

export function BundleDealForm({ dealId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(dealId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<BundleDealStatus>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [dealPrice, setDealPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [selected, setSelected] = useState<SelectedRow[]>([]);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<AdminProductListRow[]>([]);
  const [searching, setSearching] = useState(false);

  const [pricing, setPricing] = useState<BundlePricingPreview | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const itemInputs: BundleDealItemInput[] = useMemo(
    () =>
      selected.map((row) => ({
        productId: row.productId,
        variantId: row.variantId,
        quantity: row.quantity,
      })),
    [selected],
  );

  const loadDeal = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    setError(null);
    try {
      const deal: BundleDeal = await fetchBundleDeal(dealId);
      setTitle(deal.title);
      setSlug(deal.slug);
      setSlugTouched(true);
      setDescription(deal.description ?? '');
      setStatus(deal.status);
      setIsFeatured(deal.isFeatured);
      setDealPrice(String(deal.dealPrice));
      setImageUrl(deal.imageUrl ?? '');
      setPendingImageFile(null);
      setPendingImagePreview((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
      setValidFrom(deal.validFrom ? deal.validFrom.slice(0, 16) : '');
      setValidTo(deal.validTo ? deal.validTo.slice(0, 16) : '');

      const rows: SelectedRow[] = await Promise.all(
        (deal.items ?? []).map(async (item, index) => {
          const detail = await fetchAdminProduct(item.productId);
          const variants = detail.variants?.filter((v) => v.isActive) ?? [];
          return {
            key: `${item.productId}-${item.variantId ?? 'simple'}-${index}`,
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,
            productName: detail.name,
            productSku: detail.sku,
            thumbnail: detail.images?.[0]?.url,
            variantOptions: variants.map((v) => ({
              id: v.id,
              name: v.name,
              price: Number(v.price),
            })),
          };
        }),
      );
      setSelected(rows);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    if (isEdit) void loadDeal();
  }, [isEdit, loadDeal]);

  useEffect(() => {
    return () => {
      if (pendingImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(pendingImagePreview);
      }
    };
  }, [pendingImagePreview]);

  useEffect(() => {
    if (!title.trim() || slugTouched) return;
    setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    if (itemInputs.length < 3) {
      setPricing(null);
      return;
    }
    const dealPriceNum = dealPrice.trim() ? Number(dealPrice) : undefined;
    if (dealPrice.trim() && !Number.isFinite(dealPriceNum)) return;

    const timer = window.setTimeout(async () => {
      setPricingLoading(true);
      try {
        const preview = await previewBundlePricing({
          items: itemInputs,
          dealPrice: dealPriceNum,
        });
        setPricing(preview);
        if (!dealPrice.trim()) {
          setDealPrice(String(preview.compareAtTotal));
        }
      } catch {
        setPricing(null);
      } finally {
        setPricingLoading(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [itemInputs, dealPrice]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchAdminProducts({ search: search.trim(), limit: 12, status: 'active' });
        setSearchResults(res.data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const addProduct = async (product: AdminProductListRow) => {
    if (selected.some((s) => s.productId === product.id && !s.variantId)) return;
    try {
      const detail = await fetchAdminProduct(product.id);
      const variants = detail.variants?.filter((v) => v.isActive) ?? [];
      const isSimple = variants.length === 0;
      const defaultVariant = variants[0];
      const row: SelectedRow = {
        key: `${product.id}-${Date.now()}`,
        productId: product.id,
        variantId: isSimple ? product.id : defaultVariant?.id,
        quantity: 1,
        productName: detail.name,
        productSku: detail.sku,
        thumbnail: detail.images?.[0]?.url ?? product.images?.[0]?.url,
        variantOptions: isSimple
          ? [{ id: product.id, name: detail.name, price: Number(detail.basePrice) }]
          : variants.map((v) => ({
              id: v.id,
              name: v.name,
              price: Number(v.price),
            })),
      };
      setSelected((prev) => [...prev, row]);
      setSearch('');
      setSearchResults([]);
    } catch (e) {
      setToast(formatApiError(e));
    }
  };

  const onImageSelect = (file: File) => {
    setPendingImageFile(file);
    setPendingImagePreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const heroPreviewSrc =
    pendingImagePreview ?? (imageUrl ? resolveAdminImageUrl(imageUrl) : '');

  const canSave = selected.length >= 3 && title.trim() && dealPrice.trim() && Number(dealPrice) >= 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        status,
        isFeatured,
        dealPrice: Number(dealPrice),
        imageUrl: pendingImageFile ? undefined : imageUrl.trim() || undefined,
        validFrom: validFrom ? new Date(validFrom).toISOString() : undefined,
        validTo: validTo ? new Date(validTo).toISOString() : undefined,
        items: itemInputs,
      };

      if (isEdit && dealId) {
        const saved = await updateBundleDeal(dealId, body, pendingImageFile);
        setImageUrl(saved.imageUrl ?? '');
        setPendingImageFile(null);
        setPendingImagePreview((prev) => {
          if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
          return null;
        });
        setToast('Bundle deal updated.');
      } else {
        const created = await createBundleDeal(body, pendingImageFile);
        router.push(`/bundle-deals/${created.id}`);
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading bundle deal…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-8">
      {toast ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{toast}</div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      ) : null}

      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {isEdit ? 'Edit bundle deal' : 'New bundle deal'}
        </h1>
      </div>

      <section className="space-y-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-700">
        <h2 className="text-lg font-medium">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Title</span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Slug</span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Description</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-6">
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Status</span>
            <select
              className="mt-1 block rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={status}
              onChange={(e) => setStatus(e.target.value as BundleDealStatus)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured on deals page
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-700">
        <h2 className="text-lg font-medium">Schedule & image</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Valid from</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Valid to</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label className="block text-sm text-zinc-700 dark:text-zinc-300">Hero image</label>
          {heroPreviewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroPreviewSrc} alt="" className="mt-2 h-32 w-auto rounded-lg border object-cover" />
          ) : null}
          {pendingImageFile ? (
            <p className="mt-2 text-xs text-zinc-500">
              Selected: {pendingImageFile.name} — will upload when you save
            </p>
          ) : null}
          <input
            type="file"
            accept="image/*"
            className="mt-2 block text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageSelect(file);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Products ({selected.length} items)</h2>
          <span className={`text-sm ${selected.length < 3 ? 'text-amber-600' : 'text-zinc-500'}`}>
            Minimum 3 products required
          </span>
        </div>

        <div>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            placeholder="Search products by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searching ? <p className="mt-1 text-xs text-zinc-500">Searching…</p> : null}
          {searchResults.length > 0 ? (
            <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              {searchResults.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => void addProduct(p)}
                  >
                    {p.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-zinc-100 text-xs">—</span>
                    )}
                    <span>
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-zinc-500">{p.sku}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {selected.length === 0 ? (
          <p className="text-sm text-zinc-500">Add at least 3 products to compose this bundle.</p>
        ) : (
          <ul className="space-y-3">
            {selected.map((row, index) => (
              <li
                key={row.key}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
              >
                {row.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.thumbnail} alt="" className="h-12 w-12 rounded object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{row.productName}</p>
                  <p className="text-xs text-zinc-500">{row.productSku}</p>
                </div>
                {row.variantOptions.length > 1 ? (
                  <select
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    value={row.variantId ?? ''}
                    onChange={(e) => {
                      const variantId = e.target.value;
                      setSelected((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, variantId } : r)),
                      );
                    }}
                  >
                    {row.variantOptions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {formatRs(v.price)}
                      </option>
                    ))}
                  </select>
                ) : null}
                <label className="flex items-center gap-1 text-sm">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={99}
                    className="w-16 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                    value={row.quantity}
                    onChange={(e) => {
                      const quantity = Math.max(1, Number(e.target.value) || 1);
                      setSelected((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, quantity } : r)),
                      );
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => setSelected((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900/40">
        <h2 className="text-lg font-medium">Pricing</h2>
        {pricingLoading ? <p className="text-sm text-zinc-500">Calculating…</p> : null}
        {pricing ? (
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              Compare at: <span className="line-through text-zinc-500">{formatRs(pricing.compareAtTotal)}</span>
            </p>
            <p className="text-emerald-700 dark:text-emerald-400">
              You save: {formatRs(pricing.savingsAmount)} ({pricing.savingsPercent}%)
            </p>
          </div>
        ) : selected.length >= 3 ? null : (
          <p className="text-sm text-zinc-500">Add 3+ products to see pricing.</p>
        )}
        <label className="block text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Deal price</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className="mt-1 w-full max-w-xs rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            value={dealPrice}
            onChange={(e) => setDealPrice(e.target.value)}
            required
          />
        </label>
        {pricing && Number(dealPrice) > pricing.compareAtTotal ? (
          <p className="text-sm text-red-600">Deal price cannot exceed compare-at total.</p>
        ) : null}
      </section>

      <div className="flex gap-3">
        <button type="submit" disabled={!canSave || saving} className={adminUi.btnPrimary}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create bundle deal'}
        </button>
        <button type="button" className={adminUi.btnSecondary} onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
