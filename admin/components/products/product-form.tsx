'use client';

import { useEffect, useState } from 'react';
import {
  createAdminProduct,
  createProductImage,
  updateAdminProduct,
  uploadProductImage,
  type CreateProductBody,
  type ProductDetail,
  type ProductStatus,
  type ProductType,
  type ProductVisibility,
  moneyToNumber,
} from '@/lib/api/products';
import { formatApiError } from '@/lib/api/error-message';

const STATUSES: ProductStatus[] = ['draft', 'active', 'disabled'];
const VIS: ProductVisibility[] = ['catalog', 'search', 'both', 'none'];

function parseOptionalJsonObject(raw: string, label: string): Record<string, unknown> | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const parsed = JSON.parse(t) as unknown;
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

type ProductFormProps = {
  mode: 'create' | 'edit';
  initial?: ProductDetail | null;
  productId?: string;
  onCancel?: () => void;
  onSaved?: (p: ProductDetail) => void;
};

export function ProductForm({ mode, initial, productId, onCancel, onSaved }: ProductFormProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<ProductType>('configurable');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [basePrice, setBasePrice] = useState('0');
  const [cost, setCost] = useState('');
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<ProductStatus>('draft');
  const [visibility, setVisibility] = useState<ProductVisibility>('both');
  const [taxClassId, setTaxClassId] = useState('');
  const [attributesJson, setAttributesJson] = useState('{}');
  const [metaDataJson, setMetaDataJson] = useState('{}');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setSku(initial.sku);
      setName(initial.name);
      setSlug(initial.slug);
      setType('configurable');
      setDescription(initial.description ?? '');
      setShortDescription(initial.shortDescription ?? '');
      setBasePrice(String(moneyToNumber(initial.basePrice)));
      setCost(initial.cost != null ? String(moneyToNumber(initial.cost)) : '');
      setWeight(initial.weight != null ? String(moneyToNumber(initial.weight)) : '');
      setStatus(initial.status as ProductStatus);
      setVisibility(initial.visibility as ProductVisibility);
      setTaxClassId(initial.taxClassId ?? '');
      setAttributesJson(JSON.stringify(initial.attributes ?? {}, null, 2));
      setMetaDataJson(JSON.stringify(initial.metaData ?? {}, null, 2));
    }
  }, [mode, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = parseFloat(basePrice);
    if (!Number.isFinite(price) || price < 0) {
      setError('Base price must be a valid non-negative number');
      return;
    }
    const parsedCost = cost.trim() ? parseFloat(cost) : undefined;
    if (parsedCost !== undefined && (!Number.isFinite(parsedCost) || parsedCost < 0)) {
      setError('Cost must be a valid non-negative number');
      return;
    }
    const parsedWeight = weight.trim() ? parseFloat(weight) : undefined;
    if (parsedWeight !== undefined && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) {
      setError('Weight must be a valid non-negative number');
      return;
    }
    let attributes: Record<string, unknown> | undefined;
    let metaData: Record<string, unknown> | undefined;
    try {
      attributes = parseOptionalJsonObject(attributesJson, 'Attributes');
      metaData = parseOptionalJsonObject(metaDataJson, 'Metadata');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      return;
    }

    const body: CreateProductBody = {
      sku: sku.trim(),
      name: name.trim(),
      type: 'configurable',
      basePrice: price,
      status,
      visibility,
      ...(slug.trim() ? { slug: slug.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(shortDescription.trim() ? { shortDescription: shortDescription.trim() } : {}),
      ...(parsedCost !== undefined ? { cost: parsedCost } : {}),
      ...(parsedWeight !== undefined ? { weight: parsedWeight } : {}),
      ...(taxClassId.trim() ? { taxClassId: taxClassId.trim() } : {}),
      ...(attributes !== undefined ? { attributes } : {}),
      ...(metaData !== undefined ? { metaData } : {}),
    };

    if (!body.sku || !body.name) {
      setError('SKU and name are required');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const created = await createAdminProduct(body);
        if (imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            const uploaded = await uploadProductImage(imageFiles[i]);
            await createProductImage(created.id, {
              url: uploaded.url,
              altText: name.trim() || undefined,
              isPrimary: i === 0,
              position: i,
            });
          }
        }
        onSaved?.(created);
      } else if (productId && initial) {
        const slugOut = slug.trim() || initial.slug;
        const updated = await updateAdminProduct(productId, {
          ...body,
          slug: slugOut,
        });
        if (imageFiles.length > 0) {
          const hasExistingImages = (initial.images?.length ?? 0) > 0;
          for (let i = 0; i < imageFiles.length; i++) {
            const uploaded = await uploadProductImage(imageFiles[i]);
            await createProductImage(productId, {
              url: uploaded.url,
              altText: name.trim() || undefined,
              isPrimary: !hasExistingImages && i === 0,
              position: (initial.images?.length ?? 0) + i,
            });
          }
        }
        onSaved?.(updated);
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            SKU <span className="text-red-600">*</span>
          </label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            disabled={mode === 'edit'}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={mode === 'create' ? 'Auto from name if empty' : ''}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
          <input
            value={type}
            disabled
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm disabled:opacity-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <p className="mt-1 text-xs text-zinc-500">Variants-based catalog uses configurable products.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as ProductVisibility)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {VIS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Base price <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Cost</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Weight</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tax class ID</label>
        <input
          value={taxClassId}
          onChange={(e) => setTaxClassId(e.target.value)}
          placeholder="Optional UUID"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Short description</label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Product image
        </label>
        {mode === 'edit' && initial?.images?.[0]?.url ? (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={initial.images[0].url}
              alt={initial.images[0].altText ?? initial.name}
              className="h-20 w-20 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
            />
          </div>
        ) : null}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:file:bg-zinc-800 dark:file:text-zinc-100"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Optional. You can select multiple files. On new product, first image is primary.
        </p>
        {imageFiles.length > 0 ? (
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Selected: {imageFiles.length} file{imageFiles.length === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Attributes (JSON)</label>
          <textarea
            value={attributesJson}
            onChange={(e) => setAttributesJson(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Metadata (JSON)</label>
          <textarea
            value={metaDataJson}
            onChange={(e) => setMetaDataJson(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
