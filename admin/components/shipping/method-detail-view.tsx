'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  deleteShippingMethod,
  fetchShippingMethod,
  updateShippingMethod,
  type ShippingMethod,
  type ShippingMethodType,
} from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';
import { MethodCustomerGroupsPanel } from './method-customer-groups-panel';

export function MethodDetailView({ methodId }: { methodId: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<ShippingMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ShippingMethodType>('flat_rate');
  const [configJson, setConfigJson] = useState('{}');
  const [priority, setPriority] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxOrderAmount, setMaxOrderAmount] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [courierConfigJson, setCourierConfigJson] = useState('{}');
  const [metadataJson, setMetadataJson] = useState('{}');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const m = await fetchShippingMethod(methodId);
      setMethod(m);
      setCode(m.code);
      setName(m.name);
      setDescription(m.description ?? '');
      setType(m.type);
      setConfigJson(JSON.stringify(m.config ?? {}, null, 2));
      setPriority(String(m.priority));
      setIsActive(m.isActive);
      setMinOrderAmount(m.minOrderAmount != null ? String(m.minOrderAmount) : '');
      setMaxOrderAmount(m.maxOrderAmount != null ? String(m.maxOrderAmount) : '');
      setMinWeight(m.minWeight != null ? String(m.minWeight) : '');
      setMaxWeight(m.maxWeight != null ? String(m.maxWeight) : '');
      setCourierConfigJson(JSON.stringify(m.courierConfig ?? {}, null, 2));
      setMetadataJson(JSON.stringify(m.metadata ?? {}, null, 2));
    } catch (e) {
      setError(formatApiError(e));
      setMethod(null);
    } finally {
      setLoading(false);
    }
  }, [methodId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    let config: Record<string, unknown>;
    let courierConfig: Record<string, unknown>;
    let metadata: Record<string, unknown>;
    try {
      config = JSON.parse(configJson) as Record<string, unknown>;
      if (typeof config !== 'object' || config === null || Array.isArray(config)) {
        throw new Error('invalid');
      }
    } catch {
      setFormError('Config must be a JSON object.');
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
      setFormError('Courier config must be a JSON object.');
      return;
    }
    try {
      metadata = JSON.parse(metadataJson) as Record<string, unknown>;
      if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
        throw new Error('invalid');
      }
    } catch {
      setFormError('Metadata must be a JSON object.');
      return;
    }

    const pr = Number(priority);
    const body: Parameters<typeof updateShippingMethod>[1] = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      config,
      priority: Number.isNaN(pr) ? 0 : pr,
      isActive,
      courierConfig,
      metadata,
    };

    const mo = minOrderAmount.trim() === '' ? undefined : Number(minOrderAmount);
    const mxo = maxOrderAmount.trim() === '' ? undefined : Number(maxOrderAmount);
    const mw = minWeight.trim() === '' ? undefined : Number(minWeight);
    const mxw = maxWeight.trim() === '' ? undefined : Number(maxWeight);
    if (mo !== undefined && !Number.isNaN(mo)) body.minOrderAmount = mo;
    if (mxo !== undefined && !Number.isNaN(mxo)) body.maxOrderAmount = mxo;
    if (mw !== undefined && !Number.isNaN(mw)) body.minWeight = mw;
    if (mxw !== undefined && !Number.isNaN(mxw)) body.maxWeight = mxw;

    setSaving(true);
    try {
      const updated = await updateShippingMethod(methodId, body);
      setMethod(updated);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    if (!method) return;
    if (
      !window.confirm(
        `Delete method “${method.name}”? Fails if used on any order.`,
      )
    ) {
      return;
    }
    try {
      await deleteShippingMethod(methodId);
      router.push(`/shipping/zones/${method.zoneId}`);
    } catch (err) {
      setDeleteError(formatApiError(err));
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (error || !method) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Not found.'}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href={`/shipping/zones/${method.zoneId}`}
          className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
        >
          ← Zone
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {method.name}
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">{method.id}</p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Method</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Code</label>
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
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
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
            Courier config JSON
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

        {formError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? 'Saving…' : 'Save method'}
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 dark:border-red-800 dark:text-red-300"
          >
            Delete method
          </button>
        </div>
        {deleteError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
        ) : null}
      </form>

      <MethodCustomerGroupsPanel methodId={methodId} />
    </div>
  );
}
