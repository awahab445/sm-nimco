'use client';

import { adminUi } from '@/lib/admin-ui';
import { useState } from 'react';
import Link from 'next/link';
import {
  DEFAULT_WAREHOUSE_ID,
  adjustInventoryStock,
  fetchInventoryStatus,
  type InventoryStatusData,
} from '@/lib/api/inventory';
import { formatApiError } from '@/lib/api/error-message';
import { fetchAdminProduct, fetchAdminProducts } from '@/lib/api/products';

export function InventorySingleLookupPanel() {
  const [variantId, setVariantId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; sku: string; name: string }>>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [variantsForProduct, setVariantsForProduct] = useState<Array<{ id: string; sku: string; name: string }>>([]);
  const [variantChoice, setVariantChoice] = useState('');
  const [warehouseId, setWarehouseId] = useState(DEFAULT_WAREHOUSE_ID);
  const [status, setStatus] = useState<InventoryStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  async function searchProducts() {
    setLoadingProducts(true);
    setStatusError(null);
    try {
      const res = await fetchAdminProducts({
        page: 1,
        limit: 50,
        ...(productSearch.trim() ? { search: productSearch.trim() } : {}),
      });
      setProducts(res.data.map((p) => ({ id: p.id, sku: p.sku, name: p.name })));
    } catch (e) {
      setStatusError(formatApiError(e));
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadProductVariants(productId: string) {
    setStatusError(null);
    setVariantsForProduct([]);
    setVariantChoice('');
    setVariantId('');
    if (!productId) return;
    try {
      const p = await fetchAdminProduct(productId);
      const vars = (p.variants ?? []).map((v) => ({ id: v.id, sku: v.sku, name: v.name }));
      setVariantsForProduct(vars);
      if (vars.length === 0) {
        setVariantChoice('__product__');
        setVariantId(productId);
      }
    } catch (e) {
      setStatusError(formatApiError(e));
    }
  }

  function applyVariantChoice(choice: string, productId: string) {
    setVariantChoice(choice);
    if (choice === '__product__') {
      setVariantId(productId);
      return;
    }
    setVariantId(choice);
  }

  async function loadStatus() {
    setStatusError(null);
    const id = variantId.trim();
    if (!id) {
      setStatusError('Enter a variant ID or simple product ID.');
      return;
    }
    setLoadingStatus(true);
    try {
      const res = await fetchInventoryStatus(id, warehouseId.trim() || undefined);
      setStatus(res.data);
    } catch (e) {
      setStatusError(formatApiError(e));
    } finally {
      setLoadingStatus(false);
    }
  }

  async function submitAdjust(e: React.FormEvent) {
    e.preventDefault();
    setAdjustError(null);
    setAdjustSuccess(null);
    const id = variantId.trim();
    if (!id) {
      setAdjustError('Enter a variant ID or simple product ID first.');
      return;
    }
    const delta = parseInt(adjQty, 10);
    if (!Number.isFinite(delta)) {
      setAdjustError('Adjustment must be a whole number (e.g. 10 or -2).');
      return;
    }
    setAdjusting(true);
    try {
      const res = await adjustInventoryStock({
        variantId: id,
        quantity: delta,
        reason: adjReason.trim() || undefined,
        warehouseId: warehouseId.trim() || DEFAULT_WAREHOUSE_ID,
      });
      setAdjustSuccess(
        `Updated: on-hand ${res.data.previousQuantity} → ${res.data.newQuantity} (available ${res.data.availableQuantity}).`,
      );
      setAdjQty('');
      setAdjReason('');
      await loadStatus();
    } catch (e) {
      setAdjustError(formatApiError(e));
    } finally {
      setAdjusting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Lookup</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Look up stock by variant ID from{' '}
          <Link href="/products" className="font-medium underline">
            Products
          </Link>
          , or the product ID for simple products.
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
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
            {products.length > 0 ? (
              <div className="mt-2">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setSelectedProductId(pid);
                    void loadProductVariants(pid);
                  }}
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
            {selectedProductId ? (
              <div className="mt-2">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Variant (or simple product stock)
                </label>
                <select
                  value={variantChoice}
                  onChange={(e) => applyVariantChoice(e.target.value, selectedProductId)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  {variantsForProduct.length === 0 ? (
                    <option value="__product__">Simple product stock</option>
                  ) : (
                    <>
                      <option value="">Select variant</option>
                      {variantsForProduct.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.sku} — {v.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Variant or product ID
            </label>
            <input
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              placeholder="e.g. uuid from product detail → variants"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Warehouse ID</label>
            <input
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <button
            type="button"
            onClick={() => void loadStatus()}
            disabled={loadingStatus}
            className={adminUi.btnPrimary}
          >
            {loadingStatus ? 'Loading…' : 'Load status'}
          </button>
        </div>

        {statusError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {statusError}
          </p>
        ) : null}

        {status ? (
          <dl className="mt-6 grid gap-3 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800 sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">On hand</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{status.quantity}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Reserved</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{status.reservedQuantity}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Available</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{status.availableQuantity}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Low-stock threshold</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{status.lowStockThreshold}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Adjust stock</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Enter a signed integer: positive to receive stock, negative to shrink.
        </p>
        <form onSubmit={(e) => void submitAdjust(e)} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Quantity delta</label>
            <input
              type="number"
              step={1}
              value={adjQty}
              onChange={(e) => setAdjQty(e.target.value)}
              placeholder="e.g. 25 or -3"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Reason (optional)</label>
            <input
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              placeholder="e.g. PO #1234, cycle count correction"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <button
            type="submit"
            disabled={adjusting}
            className={adminUi.btnPrimary}
          >
            {adjusting ? 'Applying…' : 'Apply adjustment'}
          </button>
        </form>

        {adjustError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {adjustError}
          </p>
        ) : null}
        {adjustSuccess ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {adjustSuccess}
          </p>
        ) : null}
      </section>
    </div>
  );
}
