'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCustomerGroups, type CustomerGroup } from '@/lib/api/customer-groups';
import {
  fetchPromotion,
  fetchPromotionLogs,
  patchPromotion,
  validatePromotion,
  type Promotion,
  type PromotionLifecycleStatus,
  type PromotionLog,
  type ValidateCartItem,
} from '@/lib/api/promotions';
import { formatApiError } from '@/lib/api/error-message';

const SAMPLE_ITEMS: ValidateCartItem[] = [
  {
    productId: '00000000-0000-4000-8000-000000000001',
    variantId: '00000000-0000-4000-8000-000000000002',
    quantity: 1,
    price: 99,
    categoryIds: [],
  },
];

function statusPill(status: PromotionLifecycleStatus) {
  const map: Record<PromotionLifecycleStatus, string> = {
    draft: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
    active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
    expired: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
    disabled: 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

export function PromotionDetailView({ promotionId }: { promotionId: string }) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [logs, setLogs] = useState<PromotionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<PromotionLifecycleStatus>('draft');
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [valSubtotal, setValSubtotal] = useState('99');
  const [valItemsJson, setValItemsJson] = useState(JSON.stringify(SAMPLE_ITEMS, null, 2));
  const [valCustomerId, setValCustomerId] = useState('');
  const [valCustomerGroupId, setValCustomerGroupId] = useState('');
  const [valCoupon, setValCoupon] = useState('');
  const [valResult, setValResult] = useState<string | null>(null);
  const [valRunning, setValRunning] = useState(false);

  const groupName = useCallback(
    (id: string) => groups.find((g) => g.id === id)?.name ?? id.slice(0, 8),
    [groups],
  );

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const p = await fetchPromotion(promotionId);
      setPromotion(p);
      setStatusDraft(p.status);
      setValCoupon(p.code ?? '');
    } catch (e) {
      setError(formatApiError(e));
      setPromotion(null);
    } finally {
      setLoading(false);
    }
  }, [promotionId]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const list = await fetchPromotionLogs(promotionId);
      setLogs(list);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [promotionId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchCustomerGroups().then(setGroups).catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    if (promotion) void loadLogs();
  }, [promotion, loadLogs]);

  async function saveStatus(e: React.FormEvent) {
    e.preventDefault();
    setStatusError(null);
    if (!promotion) return;
    if (statusDraft === promotion.status) {
      setStatusError('Status unchanged.');
      return;
    }
    if (promotion.status === 'expired') {
      setStatusError('Expired promotions are managed by the system job; clone or create a new rule.');
      return;
    }
    if (
      !window.confirm(
        `Set status to "${statusDraft}" for ${promotion.name}?`,
      )
    ) {
      return;
    }
    if (statusDraft !== 'draft' && statusDraft !== 'active' && statusDraft !== 'disabled') {
      setStatusError('Select draft, active, or disabled.');
      return;
    }
    setStatusSaving(true);
    try {
      const updated = await patchPromotion(promotionId, { status: statusDraft });
      setPromotion(updated);
      setStatusDraft(updated.status);
    } catch (err) {
      setStatusError(formatApiError(err));
    } finally {
      setStatusSaving(false);
    }
  }

  async function runValidate() {
    setValResult(null);
    let items: ValidateCartItem[];
    try {
      const parsed = JSON.parse(valItemsJson) as unknown;
      if (!Array.isArray(parsed)) throw new Error('Items must be a JSON array');
      items = parsed as ValidateCartItem[];
    } catch {
      setValResult('Invalid items JSON.');
      return;
    }
    const subtotal = Number(valSubtotal);
    if (Number.isNaN(subtotal)) {
      setValResult('Subtotal must be a number.');
      return;
    }
    setValRunning(true);
    try {
      const res = await validatePromotion(promotionId, {
        subtotal,
        items,
        ...(valCustomerId.trim() ? { customerId: valCustomerId.trim() } : {}),
        ...(valCustomerGroupId.trim() ? { customerGroupId: valCustomerGroupId.trim() } : {}),
        ...(valCoupon.trim() ? { couponCode: valCoupon.trim() } : {}),
      });
      setValResult(
        res.eligible
          ? `Eligible. Discount: ${res.discountAmount ?? 0}`
          : `Not eligible${res.reason ? `: ${res.reason}` : ''}`,
      );
    } catch (err) {
      setValResult(formatApiError(err));
    } finally {
      setValRunning(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (error || !promotion) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Not found.'}
      </p>
    );
  }

  const canPatchStatus =
    promotion.status === 'draft' ||
    promotion.status === 'active' ||
    promotion.status === 'disabled';

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/promotions"
        className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
      >
        ← Promotions
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {promotion.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400">
            {promotion.code ?? 'No coupon code'} · {promotion.id}
          </p>
        </div>
        {statusPill(promotion.status)}
      </div>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Lifecycle</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Draft promotions are not evaluated on the storefront until set to{' '}
          <span className="font-mono">active</span>.
        </p>
        {canPatchStatus ? (
          <form onSubmit={saveStatus} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Status</label>
              <select
                value={statusDraft}
                onChange={(e) =>
                  setStatusDraft(e.target.value as PromotionLifecycleStatus)
                }
                className="mt-1 block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={statusSaving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {statusSaving ? 'Saving…' : 'Save status'}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            This promotion is <strong>expired</strong>. Status cannot be changed here.
          </p>
        )}
        {statusError ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{statusError}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Configuration</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Type</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">{promotion.type}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Scope</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">{promotion.scope}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Discount</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {promotion.discountValue != null
                ? promotion.discountType === 'percentage'
                  ? `${promotion.discountValue}%`
                  : String(promotion.discountValue)
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Flags</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">
              stackable: {String(promotion.isStackable)} · exclusive:{' '}
              {String(promotion.isExclusive)} · all groups:{' '}
              {String(promotion.appliesToAllGroups)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Usage</dt>
            <dd className="tabular-nums text-zinc-800 dark:text-zinc-200">
              {promotion.currentUsage}
              {promotion.usageLimit != null ? ` / ${promotion.usageLimit}` : ''} (total)
              {promotion.usageLimitPerUser != null
                ? ` · ${promotion.usageLimitPerUser} per user`
                : ''}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Window</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">
              {promotion.startDate
                ? new Date(promotion.startDate).toLocaleString()
                : '—'}{' '}
              →{' '}
              {promotion.endDate ? new Date(promotion.endDate).toLocaleString() : '—'}
            </dd>
          </div>
        </dl>
        {promotion.description ? (
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{promotion.description}</p>
        ) : null}
      </section>

      {promotion.promotionProducts?.length ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Product / category targets
          </h2>
          <ul className="mt-2 space-y-1 font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {promotion.promotionProducts.map((row) => (
              <li key={row.id}>
                {row.productId && `product:${row.productId} `}
                {row.variantId && `variant:${row.variantId} `}
                {row.categoryId && `category:${row.categoryId}`}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {promotion.promotionCustomerGroups?.length ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Customer groups
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {promotion.promotionCustomerGroups.map((row) => (
              <li key={row.id}>
                {row.isExcluded ? 'Exclude' : 'Eligible'}: {groupName(row.customerGroupId)}
                <span className="ml-1 font-mono text-xs text-zinc-500">({row.customerGroupId})</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Conditions & metadata</h2>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {JSON.stringify(promotion.conditions ?? {}, null, 2)}
        </pre>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {JSON.stringify(promotion.metadata ?? {}, null, 2)}
        </pre>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Test validate</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Calls <span className="font-mono">POST /promotions/:id/validate</span> with a synthetic cart.
          The promotion must be <strong>active</strong> and inside its date window to come back eligible.
          Use real product and variant UUIDs from your catalog for meaningful results.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Subtotal</label>
            <input
              value={valSubtotal}
              onChange={(e) => setValSubtotal(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Coupon code (optional)
            </label>
            <input
              value={valCoupon}
              onChange={(e) => setValCoupon(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Customer ID
            </label>
            <input
              value={valCustomerId}
              onChange={(e) => setValCustomerId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Customer group ID
            </label>
            <input
              value={valCustomerGroupId}
              onChange={(e) => setValCustomerGroupId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Items JSON</label>
          <textarea
            value={valItemsJson}
            onChange={(e) => setValItemsJson(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void runValidate()}
            disabled={valRunning}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {valRunning ? 'Running…' : 'Run validate'}
          </button>
        </div>
        {valResult ? (
          <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {valResult}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Application logs</h2>
          <button
            type="button"
            onClick={() => void loadLogs()}
            className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          {logsLoading ? (
            <div className="p-6 text-center text-sm text-zinc-500">Loading logs…</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">No log rows yet.</div>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">When</th>
                  <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                  <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">Discount</th>
                  <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{log.status}</td>
                    <td className="px-4 py-2 tabular-nums">{log.discountAmount}</td>
                    <td className="px-4 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {log.cartId && `cart ${log.cartId.slice(0, 8)}… `}
                      {log.orderId && `order ${log.orderId.slice(0, 8)}… `}
                      {log.couponCode ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
