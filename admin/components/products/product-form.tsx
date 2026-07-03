'use client';

import { adminUi } from '@/lib/admin-ui';
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
  type UpdateProductBody,
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

function parseJsonObjectForEdit(raw: string, label: string): Record<string, unknown> {
  const t = raw.trim();
  if (!t) return {};
  return parseOptionalJsonObject(t, label) ?? {};
}

function buildCreateBody(fields: {
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  parsedCost?: number;
  parsedWeight?: number;
  status: ProductStatus;
  visibility: ProductVisibility;
  taxClassId: string;
  attributes?: Record<string, unknown>;
  metaData?: Record<string, unknown>;
}): CreateProductBody {
  return {
    sku: fields.sku,
    name: fields.name,
    type: 'configurable',
    basePrice: fields.price,
    status: fields.status,
    visibility: fields.visibility,
    ...(fields.slug ? { slug: fields.slug } : {}),
    ...(fields.description ? { description: fields.description } : {}),
    ...(fields.shortDescription ? { shortDescription: fields.shortDescription } : {}),
    ...(fields.parsedCost !== undefined ? { cost: fields.parsedCost } : {}),
    ...(fields.parsedWeight !== undefined ? { weight: fields.parsedWeight } : {}),
    ...(fields.taxClassId ? { taxClassId: fields.taxClassId } : {}),
    ...(fields.attributes !== undefined ? { attributes: fields.attributes } : {}),
    ...(fields.metaData !== undefined ? { metaData: fields.metaData } : {}),
  };
}

function buildUpdateBody(fields: {
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  parsedCost?: number;
  parsedWeight?: number;
  status: ProductStatus;
  visibility: ProductVisibility;
  taxClassId: string;
  attributes: Record<string, unknown>;
  metaData: Record<string, unknown>;
}): UpdateProductBody {
  return {
    sku: fields.sku,
    name: fields.name,
    type: 'configurable',
    basePrice: fields.price,
    status: fields.status,
    visibility: fields.visibility,
    slug: fields.slug,
    description: fields.description || null,
    shortDescription: fields.shortDescription || null,
    cost: fields.parsedCost ?? null,
    weight: fields.parsedWeight ?? null,
    taxClassId: fields.taxClassId || null,
    attributes: fields.attributes,
    metaData: fields.metaData,
  };
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
    } else if (mode === 'create') {
      setAttributesJson('{}');
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
    let editAttributes: Record<string, unknown> = {};
    let editMetaData: Record<string, unknown> = {};
    try {
      if (mode === 'edit') {
        editAttributes = parseJsonObjectForEdit(attributesJson, 'Attributes');
        editMetaData = parseJsonObjectForEdit(metaDataJson, 'Metadata');
      } else {
        attributes = parseOptionalJsonObject(attributesJson, 'Attributes');
        metaData = parseOptionalJsonObject(metaDataJson, 'Metadata');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      return;
    }

    const sharedFields = {
      sku: sku.trim(),
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      price,
      parsedCost,
      parsedWeight,
      status,
      visibility,
      taxClassId: taxClassId.trim(),
    };

    if (!sharedFields.sku || !sharedFields.name) {
      setError('SKU and name are required');
      return;
    }

    const body: CreateProductBody | UpdateProductBody =
      mode === 'edit'
        ? buildUpdateBody({
            ...sharedFields,
            slug: sharedFields.slug || initial?.slug || '',
            attributes: editAttributes,
            metaData: editMetaData,
          })
        : buildCreateBody({
            ...sharedFields,
            attributes,
            metaData,
          });

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const created = await createAdminProduct(body as CreateProductBody);
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
        const updated = await updateAdminProduct(productId, body as UpdateProductBody);
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
          <p className="mt-0.5 text-xs text-zinc-500">
            Optional JSON on the product (e.g. <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">brand</code>,{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">size</code>) must match filter option values configured under{' '}
            <strong>Store filters</strong> in the admin.
          </p>
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
          className={adminUi.btnPrimary}
        >
          {submitting ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
