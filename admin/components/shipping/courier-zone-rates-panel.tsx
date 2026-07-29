'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchCourierZones,
  updateCourierZone,
  type CourierZone,
} from '@/lib/api/courier-zones';
import { formatApiError } from '@/lib/api/error-message';

type ZoneDraft = {
  rateUpTo5kg: string;
  rateUpTo10kg: string;
  perKgOver10kg: string;
};

export function CourierZoneRatesPanel() {
  const [zones, setZones] = useState<CourierZone[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ZoneDraft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchCourierZones();
      setZones(list);
      const next: Record<string, ZoneDraft> = {};
      for (const z of list) {
        next[z.id] = {
          rateUpTo5kg: String(z.rateUpTo5kg),
          rateUpTo10kg: String(z.rateUpTo10kg),
          perKgOver10kg: String(z.perKgOver10kg),
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

  async function saveAll() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      for (const zone of zones) {
        const draft = drafts[zone.id];
        if (!draft) continue;
        const rateUpTo5kg = parseFloat(draft.rateUpTo5kg);
        const rateUpTo10kg = parseFloat(draft.rateUpTo10kg);
        const perKgOver10kg = parseFloat(draft.perKgOver10kg);
        if (
          ![rateUpTo5kg, rateUpTo10kg, perKgOver10kg].every(
            (n) => Number.isFinite(n) && n >= 0,
          )
        ) {
          throw new Error(
            `Zone ${zone.code}: all rates must be non-negative numbers.`,
          );
        }
        await updateCourierZone(zone.id, {
          rateUpTo5kg,
          rateUpTo10kg,
          perKgOver10kg,
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
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Courier zone weight tiers
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Rates for Zones A–E: ≤5kg flat, ≤10kg flat, and per-kg overage above
            10kg. Seeded from <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">cities-data</code>.
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
            No courier zones found. Run <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">prisma db seed</code> to
            import from cities-data.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Zone</th>
                <th className="px-3 py-2">≤5kg rate</th>
                <th className="px-3 py-2">≤10kg rate</th>
                <th className="px-3 py-2">Per kg &gt;10kg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {zones.map((zone) => {
                const draft = drafts[zone.id] ?? {
                  rateUpTo5kg: '',
                  rateUpTo10kg: '',
                  perKgOver10kg: '',
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
                        value={draft.rateUpTo5kg}
                        onChange={(e) =>
                          updateDraft(zone.id, 'rateUpTo5kg', e.target.value)
                        }
                        className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={draft.rateUpTo10kg}
                        onChange={(e) =>
                          updateDraft(zone.id, 'rateUpTo10kg', e.target.value)
                        }
                        className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={draft.perKgOver10kg}
                        onChange={(e) =>
                          updateDraft(zone.id, 'perKgOver10kg', e.target.value)
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
  );
}
