'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createShippingMethod, fetchShippingZone, type ShippingMethodType } from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';

const DEFAULT_CONFIG: Record<ShippingMethodType, string> = {
  flat_rate: JSON.stringify({ cost: 0 }, null, 2),
  weight_based: JSON.stringify(
    { baseCost: 0, costPerKg: 0, minWeight: 0, maxWeight: 100 },
    null,
    2,
  ),
  amount_based: JSON.stringify({ freeAbove: 0, costBelow: 0 }, null, 2),
  courier_api: JSON.stringify({ provider: '', serviceType: '' }, null, 2),
};

export function MethodNewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const zoneIdParam = searchParams.get('zoneId')?.trim() ?? '';

  const [zoneName, setZoneName] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ShippingMethodType>('flat_rate');
  const [configJson, setConfigJson] = useState(DEFAULT_CONFIG.flat_rate);
  const [priority, setPriority] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxOrderAmount, setMaxOrderAmount] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [courierConfigJson, setCourierConfigJson] = useState('{}');
  const [metadataJson, setMetadataJson] = useState('{}');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!zoneIdParam) return;
    void fetchShippingZone(zoneIdParam)
      .then((z) => setZoneName(z.name))
      .catch(() => setZoneName(null));
  }, [zoneIdParam]);

  useEffect(() => {
    setConfigJson(DEFAULT_CONFIG[type]);
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!zoneIdParam) {
      setError('Missing zoneId in URL. Open this page from a zone (New method).');
      return;
    }
    if (!code.trim() || !name.trim()) {
      setError('Code and name are required.');
      return;
    }
    let config: Record<string, unknown>;
    let courierConfig: Record<string, unknown>;
    let metadata: Record<string, unknown>;
    try {
      config = JSON.parse(configJson) as Record<string, unknown>;
      if (typeof config !== 'object' || config === null || Array.isArray(config)) {
        throw new Error('invalid');
      }
    } catch {
      setError('Config must be a JSON object.');
      return;
    }
    try {
      courierConfig = JSON.parse(courierConfigJson) as Record<string, unknown>;
      if (
        typeof courierConfig !== 'object' ||
        courierConfig === null ||
        Array.isArray(courierConfig)
      ) {
        throw new Error('invalid');
      }
    } catch {
      setError('Courier config must be a JSON object.');
      return;
    }
    try {
      metadata = JSON.parse(metadataJson) as Record<string, unknown>;
      if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
        throw new Error('invalid');
      }
    } catch {
      setError('Metadata must be a JSON object.');
      return;
    }

    const pr = Number(priority);
    const body = {
      zoneId: zoneIdParam,
      code: code.trim(),
      name: name.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      type,
      config,
      priority: Number.isNaN(pr) ? 0 : pr,
      isActive,
      ...(Object.keys(courierConfig).length ? { courierConfig } : {}),
      metadata,
    };

    const mo = minOrderAmount.trim() === '' ? undefined : Number(minOrderAmount);
    const mxo = maxOrderAmount.trim() === '' ? undefined : Number(maxOrderAmount);
    const mw = minWeight.trim() === '' ? undefined : Number(minWeight);
    const mxw = maxWeight.trim() === '' ? undefined : Number(maxWeight);
    if (mo !== undefined && !Number.isNaN(mo)) Object.assign(body, { minOrderAmount: mo });
    if (mxo !== undefined && !Number.isNaN(mxo)) Object.assign(body, { maxOrderAmount: mxo });
    if (mw !== undefined && !Number.isNaN(mw)) Object.assign(body, { minWeight: mw });
    if (mxw !== undefined && !Number.isNaN(mxw)) Object.assign(body, { maxWeight: mxw });

    setSaving(true);
    try {
      const m = await createShippingMethod(body);
      router.push(`/shipping/methods/${m.id}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={zoneIdParam ? `/shipping/zones/${zoneIdParam}` : '/shipping'}
        className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
      >
        ← {zoneName ?? 'Zone'}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New shipping method
      </h1>
      {!zoneIdParam ? (
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          Add <span className="font-mono">?zoneId=…</span> to the URL (use “New method” on a zone).
        </p>
      ) : (
        <p className="mt-1 font-mono text-xs text-zinc-500">zoneId: {zoneIdParam}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Code *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ShippingMethodType)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="flat_rate">flat_rate</option>
              <option value="weight_based">weight_based</option>
              <option value="amount_based">amount_based</option>
              <option value="courier_api">courier_api</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
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
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Config JSON</label>
          <textarea
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            rows={10}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Priority</label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Min order amount
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Max order amount
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={maxOrderAmount}
              onChange={(e) => setMaxOrderAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Min weight</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={minWeight}
              onChange={(e) => setMinWeight(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Max weight</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={maxWeight}
              onChange={(e) => setMaxWeight(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Courier config JSON (optional)
          </label>
          <textarea
            value={courierConfigJson}
            onChange={(e) => setCourierConfigJson(e.target.value)}
            rows={4}
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

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={saving || !zoneIdParam}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? 'Creating…' : 'Create method'}
        </button>
      </form>
    </div>
  );
}
