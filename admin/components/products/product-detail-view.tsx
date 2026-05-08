'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminCategories, type AdminCategoryListItem } from '@/lib/api/categories';
import { formatApiError } from '@/lib/api/error-message';
import {
  assignProductCategory,
  createProductImage,
  deleteVariant,
  deleteAdminProduct,
  deleteProductImage,
  fetchAdminProduct,
  fetchProductOptionsCatalog,
  fetchProductOptionsForProduct,
  saveProductOptionsForProduct,
  createVariantCombinations,
  moneyToNumber,
  removeProductCategory,
  updateVariant,
  updateProductImage,
  uploadProductImage,
  type ProductDetail,
  type ProductImage,
  type ProductVariant,
  type ProductOption,
  type ProductOptionOnProduct,
} from '@/lib/api/products';
import {
  DEFAULT_WAREHOUSE_ID,
  fetchProductInventoryMatrix,
  setProductInventoryQuantities,
} from '@/lib/api/inventory';
import { ProductForm } from './product-form';

type Tab = 'general' | 'variants' | 'inventory' | 'images' | 'categories';

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
    { id: 'inventory', label: 'Inventory' },
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
          <div className="space-y-6">
            <ProductForm
              mode="edit"
              productId={product.id}
              initial={product}
              onSaved={(p) => setProduct(p)}
            />
            <ProductOptionsPanel
              product={product}
              onChanged={() => void load()}
              onCreateCombinations={() => setTab('variants')}
            />
          </div>
        ) : null}

        {tab === 'variants' ? (
          <VariantsPanel product={product} onChanged={() => void load()} />
        ) : null}

        {tab === 'images' ? (
          <ImagesPanel product={product} onChanged={() => void load()} />
        ) : null}

        {tab === 'inventory' ? (
          <InventoryMatrixPanel product={product} />
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

function InventoryMatrixPanel({ product }: { product: ProductDetail }) {
  const [warehouseId, setWarehouseId] = useState(DEFAULT_WAREHOUSE_ID);
  const [rows, setRows] = useState<
    Array<{
      targetId: string;
      type: 'product' | 'variant';
      sku: string;
      name: string;
      isActive: boolean;
      quantity: number;
      reservedQuantity: number;
      availableQuantity: number;
      lowStockThreshold: number;
      nextQuantity: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [applyAllQty, setApplyAllQty] = useState('');
  const [csvInput, setCsvInput] = useState('');

  async function load() {
    setLoading(true);
    setErr(null);
    setNote(null);
    try {
      const res = await fetchProductInventoryMatrix(product.id, warehouseId);
      setRows(
        res.data.rows.map((r) => ({
          ...r,
          nextQuantity: String(r.quantity),
        })),
      );
    } catch (e) {
      setErr(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [product.id]);

  async function saveAll() {
    setErr(null);
    setNote(null);
    const items: Array<{ targetId: string; quantity: number }> = [];
    for (const row of rows) {
      const n = parseInt(row.nextQuantity, 10);
      if (!Number.isFinite(n) || n < 0) {
        setErr(`Invalid quantity for ${row.sku}`);
        return;
      }
      if (n !== row.quantity) {
        items.push({ targetId: row.targetId, quantity: n });
      }
    }
    if (items.length === 0) {
      setNote('No changes to save.');
      return;
    }
    setSaving(true);
    try {
      const res = await setProductInventoryQuantities(product.id, {
        warehouseId: warehouseId.trim() || DEFAULT_WAREHOUSE_ID,
        items,
      });
      setNote(`Updated ${res.data.updated.length} inventory row(s).`);
      await load();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  function applySameQuantityToAll() {
    setErr(null);
    setNote(null);
    const n = parseInt(applyAllQty, 10);
    if (!Number.isFinite(n) || n < 0) {
      setErr('Enter a valid non-negative quantity for "apply to all".');
      return;
    }
    setRows((prev) => prev.map((r) => ({ ...r, nextQuantity: String(n) })));
    setNote(`Applied quantity ${n} to all rows. Click Save all to persist.`);
  }

  function applyCsvToMatrix() {
    setErr(null);
    setNote(null);
    const raw = csvInput.trim();
    if (!raw) {
      setErr('Paste CSV data first.');
      return;
    }

    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => !!l);
    if (lines.length === 0) {
      setErr('CSV is empty.');
      return;
    }

    const updates = new Map<string, number>(); // key: targetId or sku (upper)
    let invalidCount = 0;
    let headerSkipped = false;

    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 2) {
        invalidCount += 1;
        continue;
      }

      const keyRaw = parts[0];
      const qtyRaw = parts[1];
      const keyLower = keyRaw.toLowerCase();
      if (
        !headerSkipped &&
        (keyLower === 'sku' || keyLower === 'targetid' || keyLower === 'variantid') &&
        (qtyRaw.toLowerCase() === 'quantity' || qtyRaw.toLowerCase() === 'qty')
      ) {
        headerSkipped = true;
        continue;
      }

      const qty = parseInt(qtyRaw, 10);
      if (!keyRaw || !Number.isFinite(qty) || qty < 0) {
        invalidCount += 1;
        continue;
      }

      updates.set(keyRaw, qty);
      updates.set(keyRaw.toUpperCase(), qty);
    }

    if (updates.size === 0) {
      setErr('No valid CSV rows found. Use: SKU,Quantity');
      return;
    }

    let matched = 0;
    setRows((prev) =>
      prev.map((r) => {
        const byTargetId = updates.get(r.targetId);
        const bySku = updates.get(r.sku) ?? updates.get(r.sku.toUpperCase());
        const next = byTargetId ?? bySku;
        if (next === undefined) return r;
        matched += 1;
        return { ...r, nextQuantity: String(next) };
      }),
    );

    if (matched === 0) {
      setErr('No CSV rows matched matrix rows. Use SKU or targetId in first column.');
      return;
    }
    setNote(
      `CSV applied to ${matched} row(s)${invalidCount > 0 ? `, skipped ${invalidCount} invalid row(s)` : ''}. Click Save all to persist.`,
    );
  }

  function exportMatrixCsv() {
    setErr(null);
    setNote(null);
    if (rows.length === 0) {
      setErr('No rows available to export.');
      return;
    }
    const escapeCell = (value: string) => {
      const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
      const escaped = value.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const lines = ['SKU,Quantity'];
    for (const row of rows) {
      lines.push(`${escapeCell(row.sku)},${row.quantity}`);
    }
    const csv = `${lines.join('\n')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.sku || product.id}-inventory.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNote(`Exported ${rows.length} row(s) to CSV.`);
  }

  return (
    <div>
      {err ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}
      {note ? (
        <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {note}
        </p>
      ) : null}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Warehouse ID</label>
          <input
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 sm:w-72"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={applyAllQty}
              onChange={(e) => setApplyAllQty(e.target.value)}
              placeholder="Qty for all"
              className="w-28 rounded-lg border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
            <button
              type="button"
              onClick={() => applySameQuantityToAll()}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
            >
              Apply to all
            </button>
          </div>
          <button
            type="button"
            onClick={() => exportMatrixCsv()}
            disabled={loading || rows.length === 0}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            {loading ? 'Loading…' : 'Reload'}
          </button>
          <button
            type="button"
            onClick={() => void saveAll()}
            disabled={saving || loading}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? 'Saving…' : 'Save all'}
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">CSV paste/import</p>
        <p className="mt-1 text-xs text-zinc-500">
          Paste CSV with 2 columns: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">SKU,Quantity</code> or <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">targetId,Quantity</code>.
        </p>
        <textarea
          rows={4}
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          placeholder={'SKU,Quantity\nABC-RED-S,25\nABC-RED-M,30'}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => applyCsvToMatrix()}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Apply CSV to matrix
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">On hand</th>
              <th className="px-3 py-2 font-medium">Reserved</th>
              <th className="px-3 py-2 font-medium">Available</th>
              <th className="px-3 py-2 font-medium">New quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.targetId}>
                <td className="px-3 py-2">{row.sku}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.type === 'variant' ? 'Variant' : 'Simple'}</td>
                <td className="px-3 py-2">{row.quantity}</td>
                <td className="px-3 py-2">{row.reservedQuantity}</td>
                <td className="px-3 py-2">{row.availableQuantity}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={row.nextQuantity}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.targetId === row.targetId ? { ...r, nextQuantity: e.target.value } : r,
                        ),
                      )
                    }
                    className="w-28 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkOptionCode, setBulkOptionCode] = useState('');
  const [bulkOptionValue, setBulkOptionValue] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  function variantOptionsLabel(v: ProductVariant): string {
    if (v.optionValues && v.optionValues.length > 0) {
      return v.optionValues
        .slice()
        .sort((a, b) => a.option.name.localeCompare(b.option.name))
        .map((ov) => `${ov.option.name}: ${ov.value.value}`)
        .join(' • ');
    }
    const attrs = v.attributes as Record<string, unknown> | undefined;
    const optionValues = (attrs?.optionValues as Record<string, unknown> | undefined) || undefined;
    if (!optionValues) return '—';
    return Object.entries(optionValues)
      .map(([k, val]) => `${k}: ${String(val)}`)
      .join(' • ');
  }

  function optionValueForVariant(v: ProductVariant, optionCode: string): string | undefined {
    if (v.optionValues && v.optionValues.length > 0) {
      return v.optionValues.find((ov) => ov.option.code === optionCode)?.value.value;
    }
    const attrs = v.attributes as Record<string, unknown> | undefined;
    const optionValues = (attrs?.optionValues as Record<string, unknown> | undefined) || undefined;
    const raw = optionValues?.[optionCode];
    return raw != null ? String(raw) : undefined;
  }

  const bulkOptions = (() => {
    if (product.options && product.options.length > 0) {
      return product.options
        .map((po) => ({
          code: po.option.code,
          label: po.option.name,
          values: po.values.map((x) => x.value.value),
        }))
        .filter((o) => o.values.length > 0);
    }
    const map = new Map<string, Set<string>>();
    for (const v of product.variants) {
      const attrs = (v.attributes as Record<string, unknown> | undefined) ?? {};
      const ov = (attrs.optionValues as Record<string, unknown> | undefined) ?? {};
      for (const [code, value] of Object.entries(ov)) {
        if (!map.has(code)) map.set(code, new Set());
        map.get(code)?.add(String(value));
      }
    }
    return Array.from(map.entries()).map(([code, values]) => ({
      code,
      label: code,
      values: Array.from(values),
    }));
  })();

  const selectedBulkOption = bulkOptions.find((o) => o.code === bulkOptionCode);

  function openEdit(v: ProductVariant) {
    setEditing(v);
    setPrice(String(moneyToNumber(v.price)));
    setActive(v.isActive);
    setErr(null);
    setNote(null);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const nextPrice = parseFloat(price);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      setErr('Invalid price');
      return;
    }
    setSaving(true);
    setErr(null);
    setNote(null);
    try {
      await updateVariant(editing.id, {
        price: nextPrice,
        isActive: active,
      });
      setEditing(null);
      onChanged();
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally {
      setSaving(false);
    }
  }

  async function remove(v: ProductVariant) {
    if (!window.confirm(`Delete variant "${v.name}" (${v.sku})?`)) return;
    setErr(null);
    setNote(null);
    try {
      await deleteVariant(v.id);
      onChanged();
    } catch (e2) {
      setErr(formatApiError(e2));
    }
  }

  async function applyBulkPrice(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNote(null);
    if (!bulkOptionCode || !bulkOptionValue) {
      setErr('Select option and value first');
      return;
    }
    const nextPrice = parseFloat(bulkPrice);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      setErr('Invalid bulk price');
      return;
    }
    const matches = product.variants.filter(
      (v) => optionValueForVariant(v, bulkOptionCode) === bulkOptionValue,
    );
    if (matches.length === 0) {
      setErr('No matching variants found for selected option/value');
      return;
    }
    setBulkSaving(true);
    try {
      await Promise.all(
        matches.map((v) =>
          updateVariant(v.id, {
            price: nextPrice,
          }),
        ),
      );
      setNote(`Updated price for ${matches.length} variant(s) with ${bulkOptionCode} = ${bulkOptionValue}.`);
      onChanged();
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally {
      setBulkSaving(false);
    }
  }

  return (
    <div>
      {err ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}
      {note ? (
        <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {note}
        </p>
      ) : null}
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Variants are generated from the selected product options on the General tab.
      </p>
      {bulkOptions.length > 0 ? (
        <form
          onSubmit={(e) => void applyBulkPrice(e)}
          className="mb-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
        >
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Bulk price by option value
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Option</label>
              <select
                value={bulkOptionCode}
                onChange={(e) => {
                  setBulkOptionCode(e.target.value);
                  setBulkOptionValue('');
                }}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              >
                <option value="">Select option</option>
                {bulkOptions.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Value</label>
              <select
                value={bulkOptionValue}
                onChange={(e) => setBulkOptionValue(e.target.value)}
                disabled={!selectedBulkOption}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900"
              >
                <option value="">Select value</option>
                {(selectedBulkOption?.values ?? []).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">New price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={bulkSaving}
                className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {bulkSaving ? 'Applying…' : 'Apply to matching variants'}
              </button>
            </div>
          </div>
        </form>
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
                  {variantOptionsLabel(v)}
                </td>
                <td className="px-3 py-2">{moneyToNumber(v.price).toFixed(2)}</td>
                <td className="px-3 py-2">{v.isActive ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="mr-3 underline" onClick={() => openEdit(v)}>
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
      {editing ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button type="button" className="absolute inset-0 bg-zinc-900/50" aria-label="Close" onClick={() => setEditing(null)} />
          <form
            onSubmit={(e) => void submitEdit(e)}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Edit variant</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">SKU</label>
                <input
                  value={editing.sku}
                  disabled
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900"
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
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Active
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-600">
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

function ProductOptionsPanel({
  product,
  onChanged,
  onCreateCombinations,
}: {
  product: ProductDetail;
  onChanged: () => void;
  onCreateCombinations: () => void;
}) {
  const [catalog, setCatalog] = useState<ProductOption[]>([]);
  const [rows, setRows] = useState<Array<{
    optionId: string;
    isRequired: boolean;
    valueIds: string[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    setNote(null);
    Promise.all([
      fetchProductOptionsCatalog(),
      fetchProductOptionsForProduct(product.id),
    ])
      .then(([opts, productOpts]) => {
        if (cancelled) return;
        setCatalog(opts);
        setRows(
          (productOpts ?? [])
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((po: ProductOptionOnProduct) => ({
              optionId: po.optionId,
              isRequired: po.isRequired,
              valueIds: po.values.map((v) => v.valueId),
            })),
        );
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(formatApiError(e));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const selectedOptionIds = new Set(rows.map((r) => r.optionId));
  const availableOptions = catalog.filter((o) => !selectedOptionIds.has(o.id) && o.isActive);

  function optionById(id: string) {
    return catalog.find((o) => o.id === id);
  }

  function updateRow(idx: number, patch: Partial<(typeof rows)[number]>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  async function save() {
    setErr(null);
    setNote(null);
    if (rows.length === 0) {
      setErr('Select at least one option');
      return;
    }
    for (const r of rows) {
      if (r.valueIds.length === 0) {
        setErr('Each selected option must have at least one value selected');
        return;
      }
    }
    setSaving(true);
    try {
      await saveProductOptionsForProduct(product.id, {
        options: rows.map((r, i) => ({
          optionId: r.optionId,
          isRequired: r.isRequired,
          position: i,
          valueIds: r.valueIds,
        })),
      });
      setNote('Saved options for this product.');
      onChanged();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function createCombinations() {
    setErr(null);
    setNote(null);
    setCreating(true);
    try {
      const res = await createVariantCombinations(product.id);
      setNote(`Created ${res.created} variants, skipped ${res.skipped} existing.`);
      onChanged();
      onCreateCombinations();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-zinc-500">Loading product options…</div>;
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Product options</h3>
          <p className="text-xs text-zinc-500">
            Select options and values for this product, then click <span className="font-medium">Create combination</span> to generate variants.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
          >
            {saving ? 'Saving…' : 'Save options'}
          </button>
          <button
            type="button"
            onClick={() => void createCombinations()}
            disabled={creating}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {creating ? 'Creating…' : 'Create combination'}
          </button>
        </div>
      </div>

      {err ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}
      {note ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {note}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {rows.map((r, idx) => {
          const opt = optionById(r.optionId);
          if (!opt) return null;
          const activeValues = opt.values.filter((v) => v.isActive);
          return (
            <div key={r.optionId} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {opt.name} <span className="text-xs text-zinc-500">({opt.code})</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={r.isRequired}
                      onChange={(e) => updateRow(idx, { isRequired: e.target.checked })}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    className="text-sm underline text-red-700 dark:text-red-400"
                    onClick={() => setRows((prev) => prev.filter((x) => x.optionId !== r.optionId))}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {activeValues.map((v) => {
                  const checked = r.valueIds.includes(v.id);
                  return (
                    <label
                      key={v.id}
                      className="flex items-center gap-2 rounded-md border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          updateRow(idx, {
                            valueIds: e.target.checked
                              ? Array.from(new Set(r.valueIds.concat([v.id])))
                              : r.valueIds.filter((id) => id !== v.id),
                          });
                        }}
                      />
                      <span className="truncate">{v.value}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value=""
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              setRows((prev) => prev.concat([{ optionId: id, isRequired: false, valueIds: [] }]));
            }}
          >
            <option value="">Add option…</option>
            {availableOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.code})
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 sm:w-[320px]">
            Manage the option catalog via API (`/admin/product-options`). UI for catalog management can be added next.
          </p>
        </div>
      </div>
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
