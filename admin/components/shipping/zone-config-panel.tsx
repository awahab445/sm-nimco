'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchZoneConfig,
  updateZoneConfig,
  type NationwideShippingMethodConfig,
  type ShippingWeightRule,
  type ZoneConfigJson,
} from '@/lib/api/zone-config';
import { formatApiError } from '@/lib/api/error-message';

type MethodKey = keyof ZoneConfigJson;

const METHOD_KEYS: MethodKey[] = ['economy_shipping', 'overland_shipping'];

const METHOD_LABELS: Record<MethodKey, string> = {
  economy_shipping: 'Economy Shipping',
  overland_shipping: 'Overland Shipping',
};

function cloneConfig(config: ZoneConfigJson): ZoneConfigJson {
  return JSON.parse(JSON.stringify(config)) as ZoneConfigJson;
}

function isEconomyOverflowRule(rule: ShippingWeightRule): boolean {
  return (
    rule.maxBillableKg == null &&
    rule.baseCost != null &&
    rule.costPerExtraKg != null
  );
}

function isOverlandOverflowRule(rule: ShippingWeightRule): boolean {
  return rule.maxBillableKg == null && rule.costPerKg != null;
}

function RuleRow({
  rule,
  index,
  methodKey,
  economyFlatRule,
  onChange,
  onRemove,
}: {
  rule: ShippingWeightRule;
  index: number;
  methodKey: MethodKey;
  economyFlatRule?: ShippingWeightRule;
  onChange: (index: number, rule: ShippingWeightRule) => void;
  onRemove: (index: number) => void;
}) {
  const isOpenTier = rule.maxBillableKg == null;
  const showEconomyOverflow =
    methodKey === 'economy_shipping' &&
    (isEconomyOverflowRule(rule) ||
      (isOpenTier && rule.costPerKg == null && rule.cost == null));
  const showOverlandOverflow =
    methodKey === 'overland_shipping' &&
    (isOverlandOverflowRule(rule) ||
      (isOpenTier && !showEconomyOverflow));

  const inputClass =
    'w-28 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900';

  return (
    <tr>
      <td className="px-3 py-2 text-xs text-zinc-500">{index + 1}</td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          placeholder="∞"
          value={rule.maxBillableKg ?? ''}
          onChange={(e) =>
            onChange(index, {
              ...rule,
              maxBillableKg:
                e.target.value.trim() === ''
                  ? null
                  : Number(e.target.value),
            })
          }
          className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
      </td>
      {!showEconomyOverflow && !showOverlandOverflow ? (
        <td className="px-3 py-2">
          <input
            type="number"
            min={0}
            step="0.01"
            value={rule.cost ?? ''}
            onChange={(e) =>
              onChange(index, {
                ...rule,
                cost:
                  e.target.value.trim() === ''
                    ? undefined
                    : Number(e.target.value),
              })
            }
            className={inputClass}
          />
        </td>
      ) : (
        <td className="px-3 py-2 text-xs text-zinc-400">—</td>
      )}
      {showEconomyOverflow ? (
        <>
          <td className="px-3 py-2">
            <span className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
              {economyFlatRule?.cost ?? rule.baseCost ?? '—'}
            </span>
            <p className="text-[10px] text-zinc-400">From flat tier</p>
          </td>
          <td className="px-3 py-2">
            <span className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
              {economyFlatRule?.maxBillableKg ?? rule.includedKg ?? '—'}
            </span>
            <p className="text-[10px] text-zinc-400">From flat tier</p>
          </td>
          <td className="px-3 py-2">
            <input
              type="number"
              min={0}
              step="0.01"
              value={rule.costPerExtraKg ?? ''}
              onChange={(e) =>
                onChange(index, {
                  ...rule,
                  costPerExtraKg:
                    e.target.value.trim() === ''
                      ? undefined
                      : Number(e.target.value),
                })
              }
              className={inputClass}
            />
          </td>
        </>
      ) : showOverlandOverflow ? (
        <td className="px-3 py-2" colSpan={3}>
          <input
            type="number"
            min={0}
            step="0.01"
            value={rule.costPerKg ?? ''}
            onChange={(e) =>
              onChange(index, {
                ...rule,
                costPerKg:
                  e.target.value.trim() === ''
                    ? undefined
                    : Number(e.target.value),
              })
            }
            className={inputClass}
          />
        </td>
      ) : (
        <>
          <td className="px-3 py-2 text-xs text-zinc-400">—</td>
          <td className="px-3 py-2 text-xs text-zinc-400">—</td>
          <td className="px-3 py-2 text-xs text-zinc-400">—</td>
        </>
      )}
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-xs text-red-600 hover:underline dark:text-red-400"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

function MethodPanel({
  methodKey,
  method,
  onChange,
}: {
  methodKey: MethodKey;
  method: NationwideShippingMethodConfig;
  onChange: (next: NationwideShippingMethodConfig) => void;
}) {
  const updateRule = (index: number, rule: ShippingWeightRule) => {
    const rules = [...method.rules];
    rules[index] = rule;

    if (methodKey === 'economy_shipping') {
      const flatRule = rules.find(
        (r) => r.maxBillableKg != null && r.cost != null,
      );
      const overflowIdx = rules.findIndex(
        (r) =>
          r.maxBillableKg == null &&
          r.baseCost != null &&
          r.costPerExtraKg != null,
      );
      if (flatRule && overflowIdx >= 0) {
        rules[overflowIdx] = {
          ...rules[overflowIdx],
          baseCost: flatRule.cost,
          includedKg: flatRule.maxBillableKg ?? rules[overflowIdx].includedKg,
        };
      }
    }

    onChange({ ...method, rules });
  };

  const removeRule = (index: number) => {
    onChange({ ...method, rules: method.rules.filter((_, i) => i !== index) });
  };

  const economyFlatRule = method.rules.find(
    (r) => r.maxBillableKg != null && r.cost != null,
  );

  const addRule = () => {
    const nextRule: ShippingWeightRule =
      methodKey === 'economy_shipping'
        ? {
            maxBillableKg: null,
            baseCost: economyFlatRule?.cost ?? 275,
            includedKg: economyFlatRule?.maxBillableKg ?? 3,
            costPerExtraKg: 76,
          }
        : { maxBillableKg: null, costPerKg: 70 };
    onChange({
      ...method,
      rules: [...method.rules, nextRule],
    });
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {METHOD_LABELS[methodKey]}
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Billable weight = Math.ceil(cart kg), minimum {method.minBillableKg ?? 1}{' '}
        kg. Same nationwide rate for every Pakistani city.
        {methodKey === 'economy_shipping'
          ? ' Above the flat tier: base cost + (billable kg − included kg) × per extra kg.'
          : ' Above the flat tier: full billable weight × per kg (no flat base added).'}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-600">Display name</label>
          <input
            type="text"
            value={method.name}
            onChange={(e) => onChange({ ...method, name: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">
            Est. delivery days
          </label>
          <input
            type="number"
            min={0}
            value={method.estimatedDays ?? ''}
            onChange={(e) =>
              onChange({
                ...method,
                estimatedDays:
                  e.target.value.trim() === ''
                    ? undefined
                    : Number(e.target.value),
              })
            }
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-600">Description</label>
          <input
            type="text"
            value={method.description ?? ''}
            onChange={(e) =>
              onChange({ ...method, description: e.target.value })
            }
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Max billable kg</th>
              <th className="px-3 py-2">Flat cost (PKR)</th>
              <th className="px-3 py-2">Base cost (PKR)</th>
              <th className="px-3 py-2">Included kg</th>
              <th className="px-3 py-2">
                {methodKey === 'economy_shipping'
                  ? 'Per extra kg (PKR)'
                  : 'Full weight per kg (PKR)'}
              </th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {method.rules.map((rule, index) => (
              <RuleRow
                key={`${methodKey}-rule-${index}`}
                rule={rule}
                index={index}
                methodKey={methodKey}
                economyFlatRule={
                  methodKey === 'economy_shipping' ? economyFlatRule : undefined
                }
                onChange={updateRule}
                onRemove={removeRule}
              />
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRule}
        className={`${adminUi.btnSecondary} mt-3`}
      >
        Add tier
      </button>
    </section>
  );
}

export function ZoneConfigPanel() {
  const [config, setConfig] = useState<ZoneConfigJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchZoneConfig();
      setConfig(cloneConfig(data));
    } catch (e) {
      setError(formatApiError(e));
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load of admin config from API.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount
    void load();
  }, [load]);

  async function save() {
    if (!config) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const saved = await updateZoneConfig(config);
      setConfig(cloneConfig(saved));
      setSuccess('Nationwide shipping rates saved.');
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading shipping config…</p>;
  }

  if (!config) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {error ?? 'Failed to load zone config.'}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-500">
          Checkout uses these Economy & Overland tiers nationwide. Zone A–E
          courier rates are no longer applied at checkout.
        </p>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className={adminUi.btnPrimary}
        >
          {saving ? 'Saving…' : 'Save rates'}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      ) : null}

      {METHOD_KEYS.map((key) => (
        <MethodPanel
          key={key}
          methodKey={key}
          method={config[key]}
          onChange={(next) => setConfig({ ...config, [key]: next })}
        />
      ))}
    </div>
  );
}
