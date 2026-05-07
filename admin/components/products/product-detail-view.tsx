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
  uploadProductImage,
  updateVariant,
  type ProductDetail,
  type ProductImage,
  type ProductVariant,
} from '@/lib/api/products';
import { ProductForm } from './product-form';

type Tab = 'general' | 'variants' | 'images' | 'categories';
type VariantOptionKey = 'weight' | 'packType' | 'flavor' | 'quantityPack';
const WEIGHT_OPTIONS = ['100g', '250g', '500g', '1kg'] as const;
const PACK_TYPE_OPTIONS = ['Box', 'Pouch'] as const;
const FLAVOR_OPTIONS = ['Vanilla', 'Chocolate'] as const;
const QUANTITY_PACK_OPTIONS = ['Single Pack', 'Pack of 3', 'Pack of 6', 'Family Pack'] as const;

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
  const [cost, setCost] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [position, setPosition] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [optionWeight, setOptionWeight] = useState('');
  const [optionPackType, setOptionPackType] = useState('');
  const [optionFlavor, setOptionFlavor] = useState('');
  const [optionQuantityPack, setOptionQuantityPack] = useState('');
  const [customAttributesJson, setCustomAttributesJson] = useState('{}');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationNote, setGenerationNote] = useState<string | null>(null);

  function buildVariantAttributes(): Record<string, unknown> {
    const attrs: Record<string, unknown> = {};
    if (optionWeight.trim()) attrs.weight = optionWeight.trim();
    if (optionPackType.trim()) attrs.packType = optionPackType.trim();
    if (optionFlavor.trim()) attrs.flavor = optionFlavor.trim();
    if (optionQuantityPack.trim()) attrs.quantityPack = optionQuantityPack.trim();
    const raw = customAttributesJson.trim();
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        Object.assign(attrs, parsed as Record<string, unknown>);
      }
    }
    return attrs;
  }

  function toText(v: unknown): string {
    return typeof v === 'string' ? v : '';
  }

  function parseVariantOptions(attrs: Record<string, unknown> | undefined) {
    return {
      weight: toText(attrs?.weight),
      packType: toText(attrs?.packType),
      flavor: toText(attrs?.flavor),
      quantityPack: toText(attrs?.quantityPack),
    };
  }

  function variantLabelFromOptions(options: Partial<Record<VariantOptionKey, string>>): string {
    return [options.weight, options.packType, options.flavor, options.quantityPack]
      .filter((v) => !!v && v.trim())
      .join(' • ');
  }

  function parseWeightToKg(weight: string): number | undefined {
    const t = weight.trim().toLowerCase();
    if (!t) return undefined;
    if (t.endsWith('kg')) {
      const n = parseFloat(t.replace('kg', '').trim());
      return Number.isFinite(n) ? n : undefined;
    }
    if (t.endsWith('g')) {
      const n = parseFloat(t.replace('g', '').trim());
      return Number.isFinite(n) ? n / 1000 : undefined;
    }
    return undefined;
  }

  function buildComboSignature(options: Partial<Record<VariantOptionKey, string>>): string {
    return `${options.weight ?? ''}|${options.packType ?? ''}|${options.flavor ?? ''}|${options.quantityPack ?? ''}`;
  }

  function skuToken(v: string): string {
    return v
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function openCreate() {
    setEditing(null);
    setSku('');
    setName('');
    setPrice('0');
    setCost('');
    setWeightValue('');
    setPosition(String(product.variants.length));
    setIsActive(true);
    setOptionWeight('');
    setOptionPackType('');
    setOptionFlavor('');
    setOptionQuantityPack('');
    setCustomAttributesJson('{}');
    setErr(null);
    setOpen(true);
  }

  function openEdit(v: ProductVariant) {
    setEditing(v);
    setSku(v.sku);
    setName(v.name);
    setPrice(String(moneyToNumber(v.price)));
    setCost(v.cost != null ? String(moneyToNumber(v.cost)) : '');
    setWeightValue(v.weight != null ? String(moneyToNumber(v.weight)) : '');
    setPosition(String(v.position));
    setIsActive(v.isActive);
    const opts = parseVariantOptions(v.attributes);
    setOptionWeight(opts.weight);
    setOptionPackType(opts.packType);
    setOptionFlavor(opts.flavor);
    setOptionQuantityPack(opts.quantityPack);
    const custom = { ...(v.attributes ?? {}) };
    delete custom.weight;
    delete custom.packType;
    delete custom.flavor;
    delete custom.quantityPack;
    setCustomAttributesJson(JSON.stringify(custom, null, 2));
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
    const parsedCost = cost.trim() ? parseFloat(cost) : undefined;
    if (parsedCost !== undefined && (!Number.isFinite(parsedCost) || parsedCost < 0)) {
      setErr('Invalid cost');
      return;
    }
    const parsedWeight = weightValue.trim() ? parseFloat(weightValue) : undefined;
    if (parsedWeight !== undefined && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) {
      setErr('Invalid weight');
      return;
    }
    const parsedPosition = Math.max(0, parseInt(position, 10) || 0);
    let attributes: Record<string, unknown>;
    try {
      attributes = buildVariantAttributes();
    } catch {
      setErr('Custom attributes must be valid JSON object');
      return;
    }
    const derivedName = variantLabelFromOptions({
      weight: optionWeight,
      packType: optionPackType,
      flavor: optionFlavor,
      quantityPack: optionQuantityPack,
    });
    const finalName = name.trim() || derivedName || sku.trim();
    setSaving(true);
    try {
      if (editing) {
        await updateVariant(editing.id, {
          sku: sku.trim(),
          name: finalName,
          price: p,
          ...(parsedCost !== undefined ? { cost: parsedCost } : {}),
          ...(parsedWeight !== undefined ? { weight: parsedWeight } : {}),
          position: parsedPosition,
          isActive,
          attributes,
        });
      } else {
        await createVariant(product.id, {
          sku: sku.trim(),
          name: finalName,
          price: p,
          ...(parsedCost !== undefined ? { cost: parsedCost } : {}),
          ...(parsedWeight !== undefined ? { weight: parsedWeight } : {}),
          position: parsedPosition,
          isActive,
          attributes,
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

  async function generateAllCombinations() {
    setErr(null);
    setGenerationNote(null);
    if (!window.confirm('Generate all 64 variant combinations for this product? Existing combinations will be skipped.')) {
      return;
    }

    setGenerating(true);
    try {
      const existingSignatures = new Set(
        product.variants.map((v) =>
          buildComboSignature(parseVariantOptions(v.attributes as Record<string, unknown> | undefined)),
        ),
      );
      const existingSkus = new Set(product.variants.map((v) => v.sku.toUpperCase()));

      const combos: Array<Record<VariantOptionKey, string>> = [];
      for (const weight of WEIGHT_OPTIONS) {
        for (const packType of PACK_TYPE_OPTIONS) {
          for (const flavor of FLAVOR_OPTIONS) {
            for (const quantityPack of QUANTITY_PACK_OPTIONS) {
              combos.push({ weight, packType, flavor, quantityPack });
            }
          }
        }
      }

      let created = 0;
      let skipped = 0;

      for (let i = 0; i < combos.length; i++) {
        const options = combos[i];
        const signature = buildComboSignature(options);
        if (existingSignatures.has(signature)) {
          skipped++;
          continue;
        }

        const baseSku = [
          product.sku,
          skuToken(options.weight),
          skuToken(options.packType),
          skuToken(options.flavor),
          skuToken(options.quantityPack),
        ].join('-');
        let candidateSku = baseSku;
        let suffix = 1;
        while (existingSkus.has(candidateSku.toUpperCase())) {
          suffix += 1;
          candidateSku = `${baseSku}-${suffix}`;
        }

        await createVariant(product.id, {
          sku: candidateSku,
          name: variantLabelFromOptions(options),
          price: moneyToNumber(product.basePrice),
          weight: parseWeightToKg(options.weight),
          position: product.variants.length + created + i,
          isActive: true,
          attributes: options,
        });
        existingSkus.add(candidateSku.toUpperCase());
        existingSignatures.add(signature);
        created++;
      }

      setGenerationNote(`Generated ${created} variants, skipped ${skipped} existing.`);
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setGenerating(false);
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
          onClick={() => void generateAllCombinations()}
          disabled={generating}
          className="mr-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200"
        >
          {generating ? 'Generating…' : 'Generate all combinations'}
        </button>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add variant
        </button>
      </div>
      {generationNote ? (
        <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {generationNote}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Options</th>
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
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {variantLabelFromOptions(parseVariantOptions(v.attributes)) || '—'}
                </td>
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
                  placeholder="Optional (auto from selected options)"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
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
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Cost</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Weight (number)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Position</label>
                  <input
                    type="number"
                    min={0}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Variant options
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Weight</label>
                    <select
                      value={optionWeight}
                      onChange={(e) => setOptionWeight(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    >
                      <option value="">Select</option>
                      {WEIGHT_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Pack Type</label>
                    <select
                      value={optionPackType}
                      onChange={(e) => setOptionPackType(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    >
                      <option value="">Select</option>
                      {PACK_TYPE_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Flavor</label>
                    <select
                      value={optionFlavor}
                      onChange={(e) => setOptionFlavor(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    >
                      <option value="">Select</option>
                      {FLAVOR_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Quantity Packs</label>
                    <select
                      value={optionQuantityPack}
                      onChange={(e) => setOptionQuantityPack(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    >
                      <option value="">Select</option>
                      {QUANTITY_PACK_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Custom attributes JSON (optional)
                </label>
                <textarea
                  rows={4}
                  value={customAttributesJson}
                  onChange={(e) => setCustomAttributesJson(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
              <div className="rounded-md bg-zinc-50 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                Auto label: {variantLabelFromOptions({
                  weight: optionWeight,
                  packType: optionPackType,
                  flavor: optionFlavor,
                  quantityPack: optionQuantityPack,
                }) || '—'}
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
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const orderedImages = [...product.images].sort((a, b) => a.position - b.position);

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

  async function uploadMultipleImages() {
    setErr(null);
    if (uploadFiles.length === 0) {
      setErr('Select one or more image files first.');
      return;
    }
    setUploading(true);
    try {
      const startingPosition = product.images.length;
      for (let i = 0; i < uploadFiles.length; i++) {
        const uploaded = await uploadProductImage(uploadFiles[i]);
        await createProductImage(product.id, {
          url: uploaded.url,
          altText: product.name,
          isPrimary: product.images.length === 0 && i === 0,
          position: startingPosition + i,
        });
      }
      setUploadFiles([]);
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setUploading(false);
    }
  }

  async function reorderImagesByDrag(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    setErr(null);
    const sourceIndex = orderedImages.findIndex((i) => i.id === sourceId);
    const targetIndex = orderedImages.findIndex((i) => i.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const next = [...orderedImages];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);

    try {
      await Promise.all(
        next.map((img, idx) =>
          updateProductImage(img.id, { position: idx }),
        ),
      );
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
      <div className="mb-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Bulk upload images</p>
        <div
          className={`mt-2 rounded-lg border-2 border-dashed p-4 text-center text-sm transition-colors ${
            isDropZoneActive
              ? 'border-zinc-500 bg-zinc-100 dark:border-zinc-400 dark:bg-zinc-900'
              : 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropZoneActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDropZoneActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDropZoneActive(false);
            const files = Array.from(e.dataTransfer.files ?? []).filter((f) =>
              f.type.startsWith('image/'),
            );
            if (files.length > 0) {
              setUploadFiles(files);
            }
          }}
        >
          Drag and drop images here
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setUploadFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:file:bg-zinc-800 dark:file:text-zinc-100"
          />
          <button
            type="button"
            onClick={() => void uploadMultipleImages()}
            disabled={uploading || uploadFiles.length === 0}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {uploading ? 'Uploading…' : 'Upload selected'}
          </button>
        </div>
        {uploadFiles.length > 0 ? (
          <p className="mt-1 text-xs text-zinc-500">
            {uploadFiles.length} file{uploadFiles.length === 1 ? '' : 's'} selected
          </p>
        ) : null}
      </div>
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
            {orderedImages.map((img) => (
              <tr key={img.id}>
                <td
                  className={`px-3 py-2 ${draggingImageId === img.id ? 'opacity-60' : ''}`}
                  draggable
                  onDragStart={() => setDraggingImageId(img.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggingImageId) {
                      void reorderImagesByDrag(draggingImageId, img.id);
                    }
                    setDraggingImageId(null);
                  }}
                  onDragEnd={() => setDraggingImageId(null)}
                >
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
                  <td className="px-3 py-2 font-medium">
                    {pc.category?.name ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-zinc-600">
                    {pc.category?.slug ?? '—'}
                  </td>
                  <td className="px-3 py-2">{pc.position}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-red-700 underline dark:text-red-400"
                      onClick={() =>
                        void remove(pc.categoryId, pc.category?.name ?? 'category')
                      }
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
