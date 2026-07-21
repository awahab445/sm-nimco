'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import {
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
  fetchSocialLinks,
  saveSocialLinks,
  type SocialLinkInput,
  type SocialPlatform,
} from '@/lib/api/social-links';
import { formatApiError } from '@/lib/api/error-message';

type DraftLink = {
  key: string;
  platform: SocialPlatform;
  url: string;
  isActive: boolean;
};

function newDraft(platform: SocialPlatform = 'facebook'): DraftLink {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    platform,
    url: '',
    isActive: true,
  };
}

export function SocialLinksForm() {
  const [links, setLinks] = useState<DraftLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSocialLinks();
      setLinks(
        data.length
          ? data.map((link) => ({
              key: link.id,
              platform: link.platform,
              url: link.url,
              isActive: link.isActive,
            }))
          : [],
      );
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

  const updateLink = (key: string, patch: Partial<DraftLink>) => {
    setLinks((prev) => prev.map((link) => (link.key === key ? { ...link, ...patch } : link)));
  };

  const removeLink = (key: string) => {
    setLinks((prev) => prev.filter((link) => link.key !== key));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: SocialLinkInput[] = links
        .map((link, index) => ({
          platform: link.platform,
          url: link.url.trim(),
          isActive: link.isActive,
          sortOrder: index,
        }))
        .filter((link) => link.url.length > 0);

      for (const link of payload) {
        if (!/^https?:\/\//i.test(link.url)) {
          throw new Error(
            `${SOCIAL_PLATFORM_LABELS[link.platform]}: URL must start with http:// or https://`,
          );
        }
      }

      const saved = await saveSocialLinks(payload);
      setLinks(
        saved.map((link) => ({
          key: link.id,
          platform: link.platform,
          url: link.url,
          isActive: link.isActive,
        })),
      );
      setToast({ kind: 'success', message: 'Social links saved.' });
    } catch (err) {
      const message = formatApiError(err);
      setError(message);
      setToast({ kind: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        Loading social links…
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Social media links
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Manage footer &quot;Follow us&quot; icons. Inactive or empty URLs are hidden on the
              storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLinks((prev) => [...prev, newDraft()])}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
          >
            Add link
          </button>
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}

        {links.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No social links yet. Click &quot;Add link&quot; to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div
                key={link.key}
                className="grid gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 sm:grid-cols-[10rem_1fr_auto_auto]"
              >
                <label className="block text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Platform</span>
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateLink(link.key, { platform: e.target.value as SocialPlatform })
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  >
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {SOCIAL_PLATFORM_LABELS[platform]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs sm:col-span-1">
                  <span className="text-zinc-600 dark:text-zinc-400">URL</span>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(link.key, { url: e.target.value })}
                    placeholder="https://…"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </label>
                <label className="flex items-end gap-2 pb-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={link.isActive}
                    onChange={(e) => updateLink(link.key, { isActive: e.target.checked })}
                  />
                  Visible
                </label>
                <div className="flex items-end gap-2 pb-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      setLinks((prev) => {
                        const next = [...prev];
                        const tmp = next[index - 1];
                        next[index - 1] = next[index];
                        next[index] = tmp;
                        return next;
                      });
                    }}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-zinc-600"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === links.length - 1}
                    onClick={() => {
                      setLinks((prev) => {
                        const next = [...prev];
                        const tmp = next[index + 1];
                        next[index + 1] = next[index];
                        next[index] = tmp;
                        return next;
                      });
                    }}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-zinc-600"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLink(link.key)}
                    className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 dark:border-red-900/60 dark:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saving} className={adminUi.btnPrimary}>
            {saving ? 'Saving…' : 'Save social links'}
          </button>
        </div>
      </section>

      {toast ? (
        <p
          className={`text-sm ${
            toast.kind === 'success'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'
          }`}
        >
          {toast.message}
        </p>
      ) : null}
    </form>
  );
}
