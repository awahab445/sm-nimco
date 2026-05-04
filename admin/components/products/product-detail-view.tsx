'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminCategories, type AdminCategoryListItem } from '@/lib/api/categories';
import { formatApiError } from '@/lib/api/error-message';
import {
  assignProductCategory,
  createProductImage,
  createVariant,
  deleteAdminProduct,
  deleteProductImage,
  deleteVariant,
  fetchAdminProduct,
  moneyToNumber,
  removeProductCategory,
  updateProductImage,
  updateVariant,
  type ProductDetail,
  type ProductImage,
  type ProductVariant,
} from '@/lib/api/products';
import { ProductForm } from './product-form';

type Tab = 'general' | 'variants' | 'images' | 'categories';

export function ProductDetailView({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('general');
  const [categories, setCategories] = useState<AdminCategoryListItem[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const p = await fetchAdminProduct(productId);
      setProduct(p);
    } catch (e) {
      setError(formatApiError(e));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchAdminCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function handleDeleteProduct() {
    if (!product) return;
    if (
      !window.confirm(
        `Archive “${product.name}”? It will be hidden from the storefront (soft delete).`,
      )
    ) {
      return;
    }
    setActionError(null);
    try {
      await deleteAdminProduct(product.id);
      router.push('/products');
    } catch (e) {
      setActionError(formatApiError(e));
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'variants', label: 'Variants' },
    { id: 'images', label: 'Images' },
    { id: 'categories', label: 'Categories' },
  ];

  if (loading) {
    return <div className="text-sm text-zinc-500">Loading product…</div>;
  }

  if (error || !product) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Product not found.'}{' '}
        <Link href="/products" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/products" className="text-sm text-zinc-600 underline dark:text-zinc-400">
            ← Products
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{product.name}</h1>
          <p className="text-sm text-zinc-500">
            {product.sku} · {product.slug}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleDeleteProduct()}
          className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
        >
          Archive product
        </button>
      </div>

      {actionError ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {actionError}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-3 py-2 text-sm font-medium ${
              tab === t.id
                ? 'bg-white text-zinc-900 ring-1 ring-zinc-200 ring-b-0 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-800'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-b-xl border border-t-0 border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        {tab === 'general' ? (
          <ProductForm
            mode="edit"
            productId={product.id}
            initial={product}
            onSaved={(p) => setProduct(p)}
          />
        ) : null}

        {tab === 'variants' ? (
          <VariantsPanel product={product} onChanged={() => void load()} />
        ) : null}

        {tab === 'images' ? (
          <ImagesPanel product={product} onChanged={() => void load()} />
        ) : null}

        {tab === 'categories' ? (
          <CategoriesPanel
            product={product}
            categories={categories}
            onChanged={() => void load()}
          />
        ) : null}
      </div>
    </div>
  );
}

function VariantsPanel({
  product,
  onChanged,
}: {
  product: ProductDetail;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setSku('');
    setName('');
    setPrice('0');
    setErr(null);
    setOpen(true);
  }

  function openEdit(v: ProductVariant) {
    setEditing(v);
    setSku(v.sku);
    setName(v.name);
    setPrice(String(moneyToNumber(v.price)));
    setErr(null);
    setOpen(true);
  }

  async function submitVariant(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const p = parseFloat(price);
    if (!Number.isFinite(p) || p < 0) {
      setErr('Invalid price');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateVariant(editing.id, { sku: sku.trim(), name: name.trim(), price: p });
      } else {
        await createVariant(product.id, { sku: sku.trim(), name: name.trim(), price: p });
      }
      setOpen(false);
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(v: ProductVariant) {
    if (!window.confirm(`Delete variant “${v.name}” (${v.sku})?`)) return;
    setErr(null);
    try {
      await deleteVariant(v.id);
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    }
  }

  return (
    <div>
      {err ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add variant
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Active</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {product.variants.map((v) => (
              <tr key={v.id}>
                <td className="px-3 py-2">{v.sku}</td>
                <td className="px-3 py-2">{v.name}</td>
                <td className="px-3 py-2">{moneyToNumber(v.price).toFixed(2)}</td>
                <td className="px-3 py-2">{v.isActive ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="mr-2 underline" onClick={() => openEdit(v)}>
                    Edit
                  </button>
                  <button type="button" className="text-red-700 underline dark:text-red-400" onClick={() => void remove(v)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button type="button" className="absolute inset-0 bg-zinc-900/50" aria-label="Close" onClick={() => setOpen(false)} />
          <form
            onSubmit={(e) => void submitVariant(e)}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              {editing ? 'Edit variant' : 'New variant'}
            </h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">SKU</label>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled={!!editing}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-600">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function ImagesPanel({
  product,
  onChanged,
}: {
  product: ProductDetail;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductImage | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [position, setPosition] = useState('0');
  const [isPrimary, setIsPrimary] = useState(false);
  const [variantId, setVariantId] = useState('');
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setUrl('');
    setAltText('');
    setPosition('0');
    setIsPrimary(false);
    setVariantId('');
    setErr(null);
    setOpen(true);
  }

  function openEdit(img: ProductImage) {
    setEditing(img);
    setUrl(img.url);
    setAltText(img.altText ?? '');
    setPosition(String(img.position));
    setIsPrimary(img.isPrimary);
    setVariantId(img.variantId ?? '');
    setErr(null);
    setOpen(true);
  }

  async function submitImage(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!url.trim()) {
      setErr('URL required');
      return;
    }
    setSaving(true);
    try {
      const pos = Math.max(0, parseInt(position, 10) || 0);
      if (editing) {
        await updateProductImage(editing.id, {
          url: url.trim(),
          altText: altText.trim() || undefined,
          position: pos,
          isPrimary,
        });
      } else {
        await createProductImage(product.id, {
          url: url.trim(),
          altText: altText.trim() || undefined,
          position: pos,
          isPrimary,
          variantId: variantId || undefined,
        });
      }
      setOpen(false);
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(img: ProductImage) {
    if (!window.confirm('Remove this image?')) return;
    try {
      await deleteProductImage(img.id);
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    }
  }

  return (
    <div>
      {err ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add image
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 w-14" />
              <th className="px-3 py-2 font-medium">URL</th>
              <th className="px-3 py-2 font-medium">Alt</th>
              <th className="px-3 py-2 font-medium">Primary</th>
              <th className="px-3 py-2 font-medium">Variant</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {product.images.map((img) => (
              <tr key={img.id}>
                <td className="px-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-10 w-10 rounded object-cover bg-zinc-100" />
                </td>
                <td className="max-w-[200px] truncate px-3 py-2">{img.url}</td>
                <td className="px-3 py-2">{img.altText ?? '—'}</td>
                <td className="px-3 py-2">{img.isPrimary ? 'Yes' : '—'}</td>
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {img.variantId
                    ? product.variants.find((v) => v.id === img.variantId)?.sku ?? img.variantId
                    : '—'}
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="mr-2 underline" onClick={() => openEdit(img)}>
                    Edit
                  </button>
                  <button type="button" className="text-red-700 underline dark:text-red-400" onClick={() => void remove(img)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button type="button" className="absolute inset-0 bg-zinc-900/50" aria-label="Close" onClick={() => setOpen(false)} />
          <form
            onSubmit={(e) => void submitImage(e)}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="font-semibold">{editing ? 'Edit image' : 'New image'}</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium">Image URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Alt text</label>
                <input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Position</label>
                <input
                  type="number"
                  min={0}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Variant (optional)</label>
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  disabled={!!editing}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900"
                >
                  <option value="">Product-level image</option>
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.sku} — {v.name}
                    </option>
                  ))}
                </select>
                {editing ? (
                  <p className="mt-1 text-xs text-zinc-500">Variant cannot be changed here; delete and re-add if needed.</p>
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
                Primary image
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-600">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function CategoriesPanel({
  product,
  categories,
  onChanged,
}: {
  product: ProductDetail;
  categories: AdminCategoryListItem[];
  onChanged: () => void;
}) {
  const [pick, setPick] = useState('');
  const [position, setPosition] = useState('0');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const assignedIds = new Set(product.categories.map((c) => c.categoryId));
  const available = categories.filter((c) => !assignedIds.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));

  async function assign() {
    setErr(null);
    if (!pick) {
      setErr('Choose a category');
      return;
    }
    setBusy(true);
    try {
      await assignProductCategory(product.id, pick, Math.max(0, parseInt(position, 10) || 0));
      setPick('');
      setPosition('0');
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(catId: string, name: string) {
    if (!window.confirm(`Remove category “${name}” from this product?`)) return;
    setErr(null);
    try {
      await removeProductCategory(product.id, catId);
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    }
  }

  return (
    <div>
      {err ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Add category</label>
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          >
            <option value="">Select…</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-28">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Position</label>
          <input
            type="number"
            min={0}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void assign()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Assign
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Slug</th>
              <th className="px-3 py-2 font-medium">Position</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {product.categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-500">
                  No categories yet. Assign categories from Module C.
                </td>
              </tr>
            ) : (
              product.categories.map((pc) => (
                <tr key={pc.categoryId}>
                  <td className="px-3 py-2 font-medium">{pc.category.name}</td>
                  <td className="px-3 py-2 text-zinc-600">{pc.category.slug}</td>
                  <td className="px-3 py-2">{pc.position}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-red-700 underline dark:text-red-400"
                      onClick={() => void remove(pc.categoryId, pc.category.name)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
