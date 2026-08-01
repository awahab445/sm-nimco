'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchCourierZones,
  updateCourierZone,
  type CourierZone,
} from '@/lib/api/courier-zones';
import {
  fetchStoreOrderSettings,
  updateStoreOrderSettings,
} from '@/lib/api/store-settings';
import { formatApiError } from '@/lib/api/error-message';

type ZoneDraft = {
  rateLessThan10kg: string;
  rateGreaterOrEqual10kg: string;
};

export function CourierZoneRatesPanel() {
  const [zones, setZones] = useState<CourierZone[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ZoneDraft>>({});
  const [gstPct, setGstPct] = useState('18');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingGst, setSavingGst] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [list, settings] = await Promise.all([
        fetchCourierZones(),
        fetchStoreOrderSettings(),
      ]);
      setZones(list);
      setGstPct(String(settings.shippingGstPercentage ?? 18));
      const next: Record<string, ZoneDraft> = {};
      for (const z of list) {
        next[z.id] = {
          rateLessThan10kg: String(z.rateLessThan10kg),
          rateGreaterOrEqual10kg: String(z.rateGreaterOrEqual10kg),
        };
      }
      setDrafts(next);
    } catch (e) {
      setError(formatApiError(e));
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async list fetch on mount
    void load();
  }, [load]);

  function updateDraft(
    id: string,
    field: keyof ZoneDraft,
    value: string,
  ) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function saveGst() {
    setError(null);
    setSuccess(null);
    const pct = parseFloat(gstPct);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      setError('Shipping GST % must be between 0 and 100.');
      return;
    }
    setSavingGst(true);
    try {
      const data = await updateStoreOrderSettings({
        shippingGstPercentage: pct,
      });
      setGstPct(String(data.shippingGstPercentage));
      setSuccess('Shipping GST saved.');
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSavingGst(false);
    }
  }

  async function saveAll() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      for (const zone of zones) {
        const draft = drafts[zone.id];
        if (!draft) continue;
        const rateLessThan10kg = parseFloat(draft.rateLessThan10kg);
        const rateGreaterOrEqual10kg = parseFloat(draft.rateGreaterOrEqual10kg);
        if (
          ![rateLessThan10kg, rateGreaterOrEqual10kg].every(
            (n) => Number.isFinite(n) && n >= 0,
          )
        ) {
          throw new Error(
            `Zone ${zone.code}: both rates must be non-negative numbers.`,
          );
        }
        await updateCourierZone(zone.id, {
          rateLessThan10kg,
          rateGreaterOrEqual10kg,
        });
      }
      setSuccess('Courier zone rates saved.');
      await load();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Shipping GST (%)
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Applied on top of courier zone base fees (e.g. 18 → fee × 1.18). Included
          in storefront delivery charges.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              GST percentage
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={gstPct}
              onChange={(e) => setGstPct(e.target.value)}
              className="mt-1 w-28 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <button
            type="button"
            onClick={() => void saveGst()}
            disabled={savingGst || loading}
            className={adminUi.btnPrimary}
          >
            {savingGst ? 'Saving…' : 'Save GST'}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Courier zone per-kg rates
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Dual tiers: order weight &lt; 10kg uses Rate &lt; 10kg; weight ≥ 10kg
              uses Rate ≥ 10kg. Fee = weight × rate, then GST.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void saveAll()}
            disabled={saving || loading || zones.length === 0}
            className={adminUi.btnPrimary}
          >
            {saving ? 'Saving…' : 'Save rates'}
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading zones…</p>
          ) : zones.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No courier zones found. Run{' '}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
                npm run seed:cities
              </code>{' '}
              in backend.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2">Zone</th>
                  <th className="px-3 py-2">Rate &lt; 10kg (per kg)</th>
                  <th className="px-3 py-2">Rate ≥ 10kg (per kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {zones.map((zone) => {
                  const draft = drafts[zone.id] ?? {
                    rateLessThan10kg: '',
                    rateGreaterOrEqual10kg: '',
                  };
                  return (
                    <tr key={zone.id}>
                      <td className="px-3 py-2 font-medium">
                        {zone.name}
                        <span className="ml-2 text-xs text-zinc-400">
                          ({zone.code})
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draft.rateLessThan10kg}
                          onChange={(e) =>
                            updateDraft(
                              zone.id,
                              'rateLessThan10kg',
                              e.target.value,
                            )
                          }
                          className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draft.rateGreaterOrEqual10kg}
                          onChange={(e) =>
                            updateDraft(
                              zone.id,
                              'rateGreaterOrEqual10kg',
                              e.target.value,
                            )
                          }
                          className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
