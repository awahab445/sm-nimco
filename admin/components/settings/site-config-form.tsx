'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchSiteConfig,
  updateSiteConfig,
  type SiteConfig,
} from '@/lib/api/site-config';
import { formatApiError } from '@/lib/api/error-message';

const DEFAULT_LOGO_WIDTH = 36;
const DEFAULT_LOGO_HEIGHT = 36;
const DEFAULT_ANNOUNCEMENT_TEXT = 'Free Delivery on orders of Rs. 1500 or more!';
const ANNOUNCEMENT_MAX_LENGTH = 180;

export function SiteConfigForm() {
  const [settings, setSettings] = useState<SiteConfig | null>(null);
  const [logoWidth, setLogoWidth] = useState<number>(DEFAULT_LOGO_WIDTH);
  const [logoHeight, setLogoHeight] = useState<number>(DEFAULT_LOGO_HEIGHT);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPathInput, setLogoPathInput] = useState('');
  const [announcementText, setAnnouncementText] = useState(DEFAULT_ANNOUNCEMENT_TEXT);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const announcementCharsUsed = announcementText.length;
  const announcementCharsRemaining = ANNOUNCEMENT_MAX_LENGTH - announcementCharsUsed;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSiteConfig();
      setSettings(data);
      setLogoWidth(data.logoWidth || DEFAULT_LOGO_WIDTH);
      setLogoHeight(data.logoHeight || DEFAULT_LOGO_HEIGHT);
      setPreviewUrl(data.logoUrl);
      setLogoPathInput(data.logoUrl ?? '');
      setAnnouncementText(data.announcementText || DEFAULT_ANNOUNCEMENT_TEXT);
      setShowAnnouncement(data.showAnnouncement);
    } catch (e) {
      setError(formatApiError(e));
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

  const preview = useMemo(() => {
    if (logoFile) {
      return URL.createObjectURL(logoFile);
    }
    return previewUrl;
  }, [logoFile, previewUrl]);

  useEffect(() => {
    return () => {
      if (preview && logoFile) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, logoFile]);

  function onFileSelected(file: File | null) {
    if (!file) return;
    const isImage = /^image\//i.test(file.type);
    if (!isImage) {
      setToast({ kind: 'error', message: 'Please select an image file.' });
      return;
    }
    setLogoFile(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const data = await updateSiteConfig({
        logoWidth,
        logoHeight,
        logoUrl: logoPathInput.trim() || undefined,
        announcementText,
        showAnnouncement,
        logoFile,
      });
      setSettings(data);
      setLogoWidth(data.logoWidth || DEFAULT_LOGO_WIDTH);
      setLogoHeight(data.logoHeight || DEFAULT_LOGO_HEIGHT);
      setPreviewUrl(data.logoUrl);
      setLogoPathInput(data.logoUrl ?? '');
      setAnnouncementText(data.announcementText || DEFAULT_ANNOUNCEMENT_TEXT);
      setShowAnnouncement(data.showAnnouncement);
      setLogoFile(null);
      setToast({ kind: 'success', message: 'Site logo settings saved.' });
    } catch (e) {
      const message = formatApiError(e);
      setError(message);
      setToast({ kind: 'error', message });
    } finally {
      setSaving(false);
    }
  }

  async function onRemoveCustomLogo() {
    const confirmed = window.confirm(
      'Remove custom logo?\n\nThis will revert the storefront logo to the default static logo.',
    );
    if (!confirmed) return;

    setRemovingLogo(true);
    setError(null);
    setToast(null);
    try {
      const data = await updateSiteConfig({ removeLogo: true });
      setSettings(data);
      setPreviewUrl(null);
      setLogoPathInput('');
      setLogoFile(null);
      setToast({
        kind: 'success',
        message: 'Custom logo removed. Storefront will use the default static logo.',
      });
    } catch (e) {
      const message = formatApiError(e);
      setError(message);
      setToast({ kind: 'error', message });
    } finally {
      setRemovingLogo(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-zinc-500">Loading site settings...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      {toast ? (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100'
              : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/90 dark:text-red-100'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Site settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Upload a custom storefront logo and adjust logo dimensions for the navbar.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Logo upload</h2>
          <label
            className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0] ?? null;
              onFileSelected(file);
            }}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
            />
            <span className="font-medium">Drag and drop a logo image here</span>
            <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              or click to select a file
            </span>
          </label>

          {preview ? (
            <div className="mt-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Preview
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Logo preview"
                className="max-h-24 w-auto object-contain"
                width={logoWidth || DEFAULT_LOGO_WIDTH}
                height={logoHeight || DEFAULT_LOGO_HEIGHT}
              />
            </div>
          ) : null}

          <label className="mt-4 block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">
              Existing public logo path or URL (optional)
            </span>
            <input
              type="text"
              value={logoPathInput}
              onChange={(e) => setLogoPathInput(e.target.value)}
              placeholder="/logo.png or https://cdn.example.com/logo.png"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
            <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
              Use a leading slash for files in frontend public folder (e.g. /logo.png). Upload
              takes priority when both are provided.
            </span>
          </label>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Logo Width (px)</span>
            <input
              type="number"
              min={16}
              max={512}
              value={logoWidth}
              onChange={(e) => setLogoWidth(Number(e.target.value || DEFAULT_LOGO_WIDTH))}
              placeholder={String(DEFAULT_LOGO_WIDTH)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Logo Height (px)</span>
            <input
              type="number"
              min={16}
              max={512}
              value={logoHeight}
              onChange={(e) => setLogoHeight(Number(e.target.value || DEFAULT_LOGO_HEIGHT))}
              placeholder={String(DEFAULT_LOGO_HEIGHT)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:col-span-2">
            Defaults fallback to {DEFAULT_LOGO_WIDTH}px x {DEFAULT_LOGO_HEIGHT}px when values are
            not configured.
          </p>
        </section>

        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Announcement banner / news ticker
          </h2>
          <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={showAnnouncement}
              onChange={(e) => setShowAnnouncement(e.target.checked)}
            />
            Show announcement bar at top of storefront
          </label>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Announcement text</span>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder={DEFAULT_ANNOUNCEMENT_TEXT}
              rows={3}
              maxLength={ANNOUNCEMENT_MAX_LENGTH}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
            <span
              className={`mt-1 block text-xs ${
                announcementCharsRemaining <= 20
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {announcementCharsUsed}/{ANNOUNCEMENT_MAX_LENGTH} characters
              {announcementCharsRemaining <= 20 ? ' (near limit)' : ''}
            </span>
          </label>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={adminUi.btnPrimary}
          >
            {saving ? 'Saving...' : 'Save settings'}
          </button>
          <button
            type="button"
            onClick={() => {
              setLogoWidth(DEFAULT_LOGO_WIDTH);
              setLogoHeight(DEFAULT_LOGO_HEIGHT);
            }}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          >
            Reset to default size (36x36)
          </button>
          <button
            type="button"
            disabled={removingLogo || (!settings?.logoUrl && !logoFile)}
            onClick={() => void onRemoveCustomLogo()}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300"
          >
            {removingLogo ? 'Removing...' : 'Remove custom logo'}
          </button>
          {settings?.updatedAt ? (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Last updated: {new Date(settings.updatedAt).toLocaleString()}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
