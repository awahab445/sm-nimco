'use client';

import { adminUi } from '@/lib/admin-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminCategoryListItem } from '@/lib/api/categories';
import {
  createAdminCategory,
  fetchCategoryProducts,
  syncCategoryProducts,
  updateAdminCategory,
  uploadCategoryImage,
  type CreateCategoryBody,
  type UpdateCategoryBody,
} from '@/lib/api/categories';
import { fetchAllAdminProducts, type AdminProductListRow } from '@/lib/api/products';
import { formatApiError } from '@/lib/api/error-message';

function descendantIds(flat: AdminCategoryListItem[], rootId: string): Set<string> {
  const byParent = new Map<string, string[]>();
  for (const c of flat) {
    const key = c.parentId ?? '__root__';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c.id);
  }
  const out = new Set<string>();
  const stack = [...(byParent.get(rootId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    out.add(id);
    for (const ch of byParent.get(id) ?? []) stack.push(ch);
  }
  return out;
}

type Mode = 'create' | 'edit';

type CategoryFormModalProps = {
  open: boolean;
  mode: Mode;
  editing: AdminCategoryListItem | null;
  categories: AdminCategoryListItem[];
  onClose: () => void;
  onSaved: () => void;
};

function ImageField({
  id,
  label,
  hint,
  value,
  onChange,
  onUploadError,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onUploadError: (msg: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadCategoryImage(file);
      onChange(uploaded.url);
    } catch (err) {
      onUploadError(formatApiError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/categories/… or https://…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          autoComplete="off"
        />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="shrink-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {value.trim() ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value.trim()}
          alt=""
          className="mt-2 aspect-[21/9] h-auto w-full max-w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
        />
      ) : null}
    </div>
  );
}

export function CategoryFormModal({
  open,
  mode,
  editing,
  categories,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [position, setPosition] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const [allProducts, setAllProducts] = useState<AdminProductListRow[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productsLoading, setProductsLoading] = useState(false);

  const excludedParentIds = useMemo(() => {
    if (mode !== 'edit' || !editing) return new Set<string>();
    const d = descendantIds(categories, editing.id);
    d.add(editing.id);
    return d;
  }, [mode, editing, categories]);

  const parentOptions = useMemo(() => {
    return categories
      .filter((c) => !excludedParentIds.has(c.id))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, excludedParentIds]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const active = allProducts.filter((p) => p.status === 'active');
    if (!q) return active;
    return active.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [allProducts, productSearch]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setProductSearch('');
    if (mode === 'edit' && editing) {
      setName(editing.name);
      setSlug(editing.slug);
      setDescription(editing.description ?? '');
      setBannerUrl(editing.bannerUrl ?? '');
      setParentId(editing.parentId ?? '');
      setPosition(String(editing.position));
      setIsActive(editing.isActive);
      setIsFeatured(editing.isFeatured);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setBannerUrl('');
      setParentId('');
      setPosition('0');
      setIsActive(true);
      setIsFeatured(false);
      setSelectedProductIds(new Set());
    }
  }, [open, mode, editing]);

  useEffect(() => {
    if (!open || mode !== 'edit' || !editing) return;
    let cancelled = false;
    setProductsLoading(true);
    void Promise.all([
      fetchAllAdminProducts({ status: 'active' }),
      fetchCategoryProducts(editing.id),
    ])
      .then(([products, mapped]) => {
        if (cancelled) return;
        setAllProducts(products);
        setSelectedProductIds(new Set(mapped.map((p) => p.id)));
      })
      .catch((err) => {
        if (!cancelled) setError(formatApiError(err));
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, mode, editing]);

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const pos = Math.max(0, parseInt(position, 10) || 0);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const body: CreateCategoryBody = {
          name: trimmedName,
          position: pos,
          isFeatured,
          ...(slug.trim() ? { slug: slug.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(bannerUrl.trim() ? { bannerUrl: bannerUrl.trim() } : {}),
          ...(parentId ? { parentId } : {}),
        };
        await createAdminCategory(body);
      } else if (editing) {
        const slugOut = slug.trim() || editing.slug;
        const body: UpdateCategoryBody = {
          name: trimmedName,
          slug: slugOut,
          description: description.trim(),
          bannerUrl: bannerUrl.trim() || null,
          position: pos,
          isActive,
          isFeatured,
          parentId: parentId ? parentId : null,
        };
        await updateAdminCategory(editing.id, body);
        await syncCategoryProducts(editing.id, [...selectedProductIds]);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={() => !submitting && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2
          id="category-form-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {mode === 'create' ? 'New category' : 'Edit category'}
        </h2>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="cat-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="cat-slug" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Slug
            </label>
            <input
              id="cat-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Leave blank to auto-generate from name"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="cat-desc" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <ImageField
            id="cat-banner"
            label="Category banner image"
            hint="Used on homepage category cards and the category page header."
            value={bannerUrl}
            onChange={setBannerUrl}
            onUploadError={setError}
          />

          <div>
            <label htmlFor="cat-parent" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Parent category
            </label>
            <select
              id="cat-parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="">— None (top level) —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cat-pos" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Sort position
            </label>
            <input
              id="cat-pos"
              type="number"
              min={0}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
            />
            Show on homepage (Featured Category)
          </label>

          {mode === 'edit' ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
              />
              Active (visible on storefront when parent chain is active)
            </label>
          ) : null}

          {mode === 'edit' && editing ? (
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Mapped products
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Select active products to appear on this category page. {selectedProductIds.size}{' '}
                selected.
              </p>
              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name, SKU, or slug…"
                className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                {productsLoading ? (
                  <p className="p-3 text-sm text-zinc-500">Loading products…</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="p-3 text-sm text-zinc-500">No active products match.</p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredProducts.map((p) => (
                      <li key={p.id}>
                        <label className="flex cursor-pointer items-start gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.has(p.id)}
                            onChange={() => toggleProduct(p.id)}
                            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                          />
                          <span className="min-w-0">
                            <span className="block font-medium text-zinc-900 dark:text-zinc-50">
                              {p.name}
                            </span>
                            <span className="text-xs text-zinc-500">{p.sku}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={adminUi.btnPrimary}
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
