'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchGa4Settings,
  toggleGa4Enabled,
  updateGa4Settings,
  type Ga4Settings,
} from '@/lib/api/analytics';
import { formatApiError } from '@/lib/api/error-message';

export function Ga4SettingsForm() {
  const [settings, setSettings] = useState<Ga4Settings | null>(null);
  const [measurementId, setMeasurementId] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [trackPageViews, setTrackPageViews] = useState(true);
  const [trackCartEvents, setTrackCartEvents] = useState(true);
  const [trackCheckoutSteps, setTrackCheckoutSteps] = useState(true);
  const [trackPurchases, setTrackPurchases] = useState(true);
  const [trackRefunds, setTrackRefunds] = useState(false);
  const [trackCustomEvents, setTrackCustomEvents] = useState(true);
  const [anonymizeIp, setAnonymizeIp] = useState(true);
  const [currency, setCurrency] = useState('PKR');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const applyToForm = useCallback((data: Ga4Settings) => {
    setSettings(data);
    setMeasurementId(data.measurementId ?? '');
    setDebugMode(data.debugMode);
    setTrackPageViews(data.trackPageViews);
    setTrackCartEvents(data.trackCartEvents);
    setTrackCheckoutSteps(data.trackCheckoutSteps);
    setTrackPurchases(data.trackPurchases);
    setTrackRefunds(data.trackRefunds);
    setTrackCustomEvents(data.trackCustomEvents);
    setAnonymizeIp(data.anonymizeIp);
    setCurrency(data.currency);
  }, []);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchGa4Settings();
      applyToForm(data);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [applyToForm]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const data = await updateGa4Settings({
        measurementId: measurementId.trim() || null,
        debugMode,
        trackPageViews,
        trackCartEvents,
        trackCheckoutSteps,
        trackPurchases,
        trackRefunds,
        trackCustomEvents,
        anonymizeIp,
        currency: currency.trim().toUpperCase() || 'PKR',
      });
      applyToForm(data);
      setSuccess('Settings saved.');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    if (!settings) return;
    setError(null);
    setSuccess(null);
    setToggling(true);
    try {
      const data = await toggleGa4Enabled(!settings.isEnabled);
      applyToForm(data);
      setSuccess(data.isEnabled ? 'GA4 tracking enabled.' : 'GA4 tracking disabled.');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-zinc-500">Loading analytics settings…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Google Analytics 4
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Configure enhanced ecommerce tracking for the storefront. Measurement ID is public; no
          secrets are stored.
        </p>
        {settings ? (
          <p className="mt-2 text-sm">
            Status:{' '}
            <span
              className={
                settings.isEnabled
                  ? 'font-medium text-emerald-700 dark:text-emerald-400'
                  : 'font-medium text-zinc-500'
              }
            >
              {settings.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Property</h2>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Measurement ID</span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
              value={measurementId}
              onChange={(e) => setMeasurementId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Currency</span>
            <input
              className="mt-1 w-24 rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm uppercase dark:border-zinc-600 dark:bg-zinc-900"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              maxLength={3}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
            />
            Debug mode (GA4 DebugView)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={anonymizeIp}
              onChange={(e) => setAnonymizeIp(e.target.checked)}
            />
            Anonymize IP
          </label>
        </section>

        <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Event toggles</h2>
          {[
            ['Page views', trackPageViews, setTrackPageViews],
            ['Cart events (add/remove/view)', trackCartEvents, setTrackCartEvents],
            ['Checkout steps (shipping, payment)', trackCheckoutSteps, setTrackCheckoutSteps],
            ['Purchases', trackPurchases, setTrackPurchases],
            ['Refunds', trackRefunds, setTrackRefunds],
            ['Custom events (track order, etc.)', trackCustomEvents, setTrackCustomEvents],
          ].map(([label, checked, setter]) => (
            <label key={label as string} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked as boolean}
                onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)}
              />
              {label as string}
            </label>
          ))}
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          <button
            type="button"
            disabled={toggling || !settings}
            onClick={() => void handleToggle()}
            className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-600"
          >
            {toggling
              ? '…'
              : settings?.isEnabled
                ? 'Disable tracking'
                : 'Enable tracking'}
          </button>
        </div>
      </form>
    </div>
  );
}
