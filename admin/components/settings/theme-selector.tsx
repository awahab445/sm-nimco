'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatApiError } from '@/lib/api/error-message';
import { fetchThemeSettings, updateThemeSettings } from '@/lib/api/theme';

const THEME_OPTIONS = [
  {
    id: 'essa-chemicals',
    label: 'Essa Chemicals',
    description: 'Kalles-inspired retail look with charcoal CTAs and orange accents',
    primary: '#222222',
    secondary: '#ff4800',
    background: '#ffffff',
  },
  {
    id: 'mehfil-e-shireen',
    label: 'Mehfil-e-Shireen',
    description: 'Gold CTAs with navy anchors and patterned canvas',
    primary: '#b8944a',
    secondary: '#141c2c',
    background: '#ffffff',
  },
  {
    id: 'ember',
    label: 'Ember',
    description: 'Warm accent for fashion, home, and lifestyle',
    primary: '#c2410c',
    secondary: '#ffedd5',
    background: '#fafaf9',
  },
  {
    id: 'tailwind',
    label: 'Tailwind',
    description: 'Fresh blue-and-white household cleaning brand',
    primary: '#4f90f1',
    secondary: '#eef4fe',
    background: '#F5F5F5',
  },
] as const;

export function ThemeSelector() {
  const [activeTheme, setActiveTheme] = useState<string>('tailwind');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchThemeSettings();
      setActiveTheme(data.theme);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleSelect(themeId: string) {
    if (themeId === activeTheme || saving) return;
    setSaving(true);
    setError(null);
    try {
      const data = await updateThemeSettings(themeId);
      setActiveTheme(data.theme);
      setToast({ kind: 'success', message: 'Store theme updated successfully.' });
    } catch (err) {
      const message = formatApiError(err);
      setError(message);
      setToast({ kind: 'error', message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Store theme</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Choose the active color palette for your storefront. Changes apply globally on the next page load.
        </p>
      </div>

      {toast ? (
        <p
          className={
            toast.kind === 'success'
              ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
          }
        >
          {toast.message}
        </p>
      ) : null}

      {error && !toast ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading theme settings…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {THEME_OPTIONS.map((theme) => {
            const selected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                disabled={saving}
                onClick={() => void handleSelect(theme.id)}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all disabled:opacity-60 ${
                  selected
                    ? 'border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100'
                    : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500'
                }`}
              >
                <div className="mb-4 flex gap-2">
                  <span
                    className="h-10 flex-1 rounded-lg border border-black/5 shadow-inner"
                    style={{ backgroundColor: theme.primary }}
                    aria-hidden
                  />
                  <span
                    className="h-10 w-10 rounded-lg border border-black/5 shadow-inner"
                    style={{ backgroundColor: theme.secondary }}
                    aria-hidden
                  />
                  <span
                    className="h-10 w-10 rounded-lg border border-black/5 shadow-inner"
                    style={{ backgroundColor: theme.background }}
                    aria-hidden
                  />
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{theme.label}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{theme.description}</p>
                <p className="mt-1 font-mono text-[10px] text-zinc-400">{theme.id}</p>
                {selected ? (
                  <span className="mt-3 inline-flex rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                    Active
                  </span>
                ) : (
                  <span className="mt-3 inline-flex text-xs font-medium text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100">
                    Select theme
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
