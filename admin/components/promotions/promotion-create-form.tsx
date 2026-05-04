'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCustomerGroups, type CustomerGroup } from '@/lib/api/customer-groups';
import {
  createPromotion,
  type CreatePromotionBody,
  type PromotionScope,
  type PromotionType,
} from '@/lib/api/promotions';
import { formatApiError } from '@/lib/api/error-message';

function parseIdList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function PromotionCreateForm() {
  const router = useRouter();
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PromotionType>('percentage');
  const [scope, setScope] = useState<PromotionScope>('cart');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [isStackable, setIsStackable] = useState(false);
  const [isExclusive, setIsExclusive] = useState(true);
  const [appliesToAllGroups, setAppliesToAllGroups] = useState(true);
  const [eligibleGroupIds, setEligibleGroupIds] = useState<Set<string>>(new Set());
  const [excludedGroupIds, setExcludedGroupIds] = useState<Set<string>>(new Set());
  const [usageLimit, setUsageLimit] = useState('');
  const [usageLimitPerUser, setUsageLimitPerUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productIdsRaw, setProductIdsRaw] = useState('');
  const [variantIdsRaw, setVariantIdsRaw] = useState('');
  const [categoryIdsRaw, setCategoryIdsRaw] = useState('');
  const [conditionsJson, setConditionsJson] = useState('{}');
  const [metadataJson, setMetadataJson] = useState('{}');

  useEffect(() => {
    void fetchCustomerGroups()
      .then(setGroups)
      .catch(() => setGroups([]));
  }, []);

  function toggleEligible(id: string) {
    setEligibleGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExcluded(id: string) {
    setExcludedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError('Name is required.');
      return;
    }

    let conditions: CreatePromotionBody['conditions'];
    let metadata: Record<string, unknown> | undefined;
    try {
      const c = JSON.parse(conditionsJson) as unknown;
      if (c !== null && typeof c === 'object' && !Array.isArray(c)) {
        conditions = c as CreatePromotionBody['conditions'];
      } else {
        throw new Error('Conditions must be a JSON object');
      }
    } catch {
      setSubmitError('Conditions must be valid JSON object.');
      return;
    }
    try {
      const m = JSON.parse(metadataJson) as unknown;
      if (m !== null && typeof m === 'object' && !Array.isArray(m)) {
        metadata = m as Record<string, unknown>;
      } else {
        throw new Error('Metadata must be a JSON object');
      }
    } catch {
      setSubmitError('Metadata must be valid JSON object.');
      return;
    }

    const dv = discountValue.trim() === '' ? undefined : Number(discountValue);
    if (dv !== undefined && Number.isNaN(dv)) {
      setSubmitError('Discount value must be a number.');
      return;
    }

    const body: CreatePromotionBody = {
      name: name.trim(),
      type,
      scope,
      isStackable,
      isExclusive,
      appliesToAllGroups,
      discountType,
      conditions,
      metadata,
    };

    if (code.trim()) body.code = code.trim();
    if (description.trim()) body.description = description.trim();
    if (type === 'percentage' || type === 'fixed_amount') {
      if (dv !== undefined) body.discountValue = dv;
    }
    const ul = usageLimit.trim() === '' ? undefined : Number(usageLimit);
    const ulu = usageLimitPerUser.trim() === '' ? undefined : Number(usageLimitPerUser);
    if (ul !== undefined && !Number.isNaN(ul)) body.usageLimit = ul;
    if (ulu !== undefined && !Number.isNaN(ulu)) body.usageLimitPerUser = ulu;
    if (startDate) body.startDate = new Date(startDate).toISOString();
    if (endDate) body.endDate = new Date(endDate).toISOString();

    const pIds = parseIdList(productIdsRaw);
    const vIds = parseIdList(variantIdsRaw);
    const cIds = parseIdList(categoryIdsRaw);
    if (pIds.length) body.productIds = pIds;
    if (vIds.length) body.variantIds = vIds;
    if (cIds.length) body.categoryIds = cIds;

    if (!appliesToAllGroups && eligibleGroupIds.size > 0) {
      body.eligibleCustomerGroupIds = Array.from(eligibleGroupIds);
    }
    if (excludedGroupIds.size > 0) {
      body.excludedCustomerGroupIds = Array.from(excludedGroupIds);
    }

    setSaving(true);
    try {
      const created = await createPromotion(body);
      router.push(`/promotions/${created.id}`);
    } catch (err) {
      setSubmitError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  const showDiscountValue = type === 'percentage' || type === 'fixed_amount';

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/promotions"
        className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
      >
        ← Promotions
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New promotion
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Creates a <strong>draft</strong> via <span className="font-mono">POST /promotions</span>.
        Activate it from the detail page.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code (optional)"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PromotionType)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed amount</option>
              <option value="buy_x_get_y">Buy X get Y</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as PromotionScope)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="cart">Cart</option>
              <option value="product">Product</option>
              <option value="category">Category</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Discount type
            </label>
            <select
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as 'percentage' | 'fixed_amount')
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed amount</option>
            </select>
          </div>
          {showDiscountValue ? (
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Discount value
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={isStackable}
              onChange={(e) => setIsStackable(e.target.checked)}
            />
            Stackable
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={isExclusive}
              onChange={(e) => setIsExclusive(e.target.checked)}
            />
            Exclusive
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={appliesToAllGroups}
              onChange={(e) => setAppliesToAllGroups(e.target.checked)}
            />
            Applies to all customer groups
          </label>
        </div>

        {!appliesToAllGroups ? (
          <div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Eligible customer groups
            </p>
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
              {groups.length === 0 ? (
                <p className="text-sm text-zinc-500">No groups loaded.</p>
              ) : (
                groups.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={eligibleGroupIds.has(g.id)}
                      onChange={() => toggleEligible(g.id)}
                    />
                    {g.name}
                  </label>
                ))
              )}
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Excluded customer groups (optional)
          </p>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
            {groups.map((g) => (
              <label key={g.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={excludedGroupIds.has(g.id)}
                  onChange={() => toggleExcluded(g.id)}
                />
                {g.name}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Usage limit (total)
            </label>
            <input
              type="number"
              min={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Usage limit per user
            </label>
            <input
              type="number"
              min={1}
              value={usageLimitPerUser}
              onChange={(e) => setUsageLimitPerUser(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Start (local)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              End (local)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Product IDs
            </label>
            <textarea
              value={productIdsRaw}
              onChange={(e) => setProductIdsRaw(e.target.value)}
              placeholder="One UUID per line"
              rows={4}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Variant IDs
            </label>
            <textarea
              value={variantIdsRaw}
              onChange={(e) => setVariantIdsRaw(e.target.value)}
              placeholder="One UUID per line"
              rows={4}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Category IDs
            </label>
            <textarea
              value={categoryIdsRaw}
              onChange={(e) => setCategoryIdsRaw(e.target.value)}
              placeholder="One UUID per line"
              rows={4}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Conditions JSON</label>
          <textarea
            value={conditionsJson}
            onChange={(e) => setConditionsJson(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Metadata JSON</label>
          <textarea
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {submitError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        ) : null}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? 'Creating…' : 'Create promotion'}
          </button>
          <Link
            href="/promotions"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
