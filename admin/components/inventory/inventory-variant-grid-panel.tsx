'use client';

import { adminUi } from '@/lib/admin-ui';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DEFAULT_WAREHOUSE_ID,
  bulkAdjustInventoryStock,
  fetchProductInventoryMatrix,
} from '@/lib/api/inventory';
import { formatApiError } from '@/lib/api/error-message';
import { fetchAdminProducts } from '@/lib/api/products';

type GridRow = {
  targetId: string;
  sku: string;
  name: string;
  quantity: number;
  quantityDelta: string;
};

export function InventoryVariantGridPanel() {
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; sku: string; name: string }>>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState(DEFAULT_WAREHOUSE_ID);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [defaultReason, setDefaultReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  async function searchProducts() {
    setLoadingProducts(true);
    setMatrixError(null);
    try {
      const res = await fetchAdminProducts({
        page: 1,
        limit: 50,
        ...(productSearch.trim() ? { search: productSearch.trim() } : {}),
      });
      setProducts(res.data.map((p) => ({ id: p.id, sku: p.sku, name: p.name })));
    } catch (e) {
      setMatrixError(formatApiError(e));
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadMatrix(productId: string) {
    setMatrixError(null);
    setUpdateSuccess(null);
    setRows([]);
    if (!productId) return;

    setLoadingMatrix(true);
    try {
      const res = await fetchProductInventoryMatrix(productId, warehouseId.trim() || undefined);
      setRows(
        res.data.rows.map((row) => ({
          targetId: row.targetId,
          sku: row.sku,
          name: row.name,
          quantity: row.quantity,
          quantityDelta: '',
        })),
      );
    } catch (e) {
      setMatrixError(formatApiError(e));
    } finally {
      setLoadingMatrix(false);
    }
  }

  useEffect(() => {
    if (selectedProductId) {
      void loadMatrix(selectedProductId);
    }
  }, [selectedProductId, warehouseId]);

  function updateRowDelta(targetId: string, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.targetId === targetId ? { ...row, quantityDelta: value } : row)),
    );
  }

  async function submitBulkUpdate() {
    setUpdateError(null);
    setUpdateSuccess(null);

    const items = rows
      .map((row) => {
        const trimmed = row.quantityDelta.trim();
        if (!trimmed) return null;
        const quantity = parseInt(trimmed, 10);
        if (!Number.isFinite(quantity) || quantity === 0) return null;
        return { variantId: row.targetId, quantity };
      })
      .filter((item): item is { variantId: string; quantity: number } => item !== null);

    if (!items.length) {
      setUpdateError('Enter at least one non-zero quantity delta.');
      return;
    }

    setUpdating(true);
    try {
      const res = await bulkAdjustInventoryStock({
        warehouseId: warehouseId.trim() || DEFAULT_WAREHOUSE_ID,
        defaultReason: defaultReason.trim() || undefined,
        items,
      });
      setUpdateSuccess(`Updated ${res.data.updated.length} variant(s).`);
      if (selectedProductId) {
        await loadMatrix(selectedProductId);
      }
    } catch (e) {
      setUpdateError(formatApiError(e));
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Product variant grid</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Select a product to load all variants and apply signed quantity deltas in one request.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Find product</label>
            <div className="mt-1 flex gap-2">
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name or SKU"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                type="button"
                onClick={() => void searchProducts()}
                disabled={loadingProducts}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              >
                {loadingProducts ? 'Searching…' : 'Search'}
              </button>
            </div>
          </div>

          {products.length > 0 ? (
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Warehouse ID</label>
            <input
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Default reason (optional)
            </label>
            <input
              value={defaultReason}
              onChange={(e) => setDefaultReason(e.target.value)}
              placeholder="Applied to rows without their own reason"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        {matrixError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {matrixError}
          </p>
        ) : null}

        {loadingMatrix ? (
          <p className="mt-6 text-sm text-zinc-500">Loading variant stock…</p>
        ) : null}

        {rows.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2">Variant / SKU</th>
                  <th className="px-3 py-2">Current stock</th>
                  <th className="px-3 py-2">Quantity delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {rows.map((row) => (
                  <tr key={row.targetId}>
                    <td className="px-3 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{row.name}</div>
                      <div className="font-mono text-xs text-zinc-500">{row.sku}</div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-zinc-900 dark:text-zinc-50">{row.quantity}</td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        step={1}
                        value={row.quantityDelta}
                        onChange={(e) => updateRowDelta(row.targetId, e.target.value)}
                        placeholder="e.g. 10 or -2"
                        className="w-full min-w-[8rem] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void submitBulkUpdate()}
                disabled={updating}
                className={adminUi.btnPrimary}
              >
                {updating ? 'Updating…' : 'Update all variants'}
              </button>
              <button
                type="button"
                onClick={() => selectedProductId && void loadMatrix(selectedProductId)}
                disabled={loadingMatrix || !selectedProductId}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
              >
                Reload grid
              </button>
              {selectedProductId ? (
                <Link
                  href={`/products/${selectedProductId}`}
                  className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
                >
                  Open product detail
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        {updateError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {updateError}
          </p>
        ) : null}
        {updateSuccess ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {updateSuccess}
          </p>
        ) : null}
      </section>
    </div>
  );
}
