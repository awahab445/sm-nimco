'use client';

import { useCallback, useEffect, useState } from 'react';
import { RichTextEditor } from '@/components/cms/rich-text-editor';
import { adminUi } from '@/lib/admin-ui';
import { formatApiError } from '@/lib/api/error-message';
import {
  POLICY_PAGE_LABELS,
  POLICY_PAGE_SLUGS,
  policyPagesApi,
  type PolicyPageSlug,
} from '@/lib/api/policy-pages';

type PolicyFormState = {
  title: string;
  excerpt: string;
  contentHtml: string;
};

function emptyForm(title: string): PolicyFormState {
  return { title, excerpt: '', contentHtml: '' };
}

export function PolicyPagesForm() {
  const [activeSlug, setActiveSlug] = useState<PolicyPageSlug>('shipping-returns');
  const [forms, setForms] = useState<Record<PolicyPageSlug, PolicyFormState>>(() =>
    Object.fromEntries(
      POLICY_PAGE_SLUGS.map((slug) => [slug, emptyForm(POLICY_PAGE_LABELS[slug])]),
    ) as Record<PolicyPageSlug, PolicyFormState>,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        POLICY_PAGE_SLUGS.map((slug) => policyPagesApi.getBySlug(slug)),
      );
      setForms((prev) => {
        const next = { ...prev };
        POLICY_PAGE_SLUGS.forEach((slug, index) => {
          const result = results[index];
          if (result.status === 'fulfilled') {
            const page = result.value;
            next[slug] = {
              title: page.title || POLICY_PAGE_LABELS[slug],
              excerpt: page.excerpt ?? '',
              contentHtml: page.contentHtml ?? '',
            };
          }
        });
        return next;
      });
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeForm = forms[activeSlug];

  function updateActiveForm(patch: Partial<PolicyFormState>) {
    setForms((prev) => ({
      ...prev,
      [activeSlug]: { ...prev[activeSlug], ...patch },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const saved = await policyPagesApi.saveBySlug(activeSlug, {
        title: activeForm.title.trim() || POLICY_PAGE_LABELS[activeSlug],
        excerpt: activeForm.excerpt.trim() || undefined,
        contentHtml: activeForm.contentHtml,
        metaTitle: activeForm.title.trim() || POLICY_PAGE_LABELS[activeSlug],
        metaDescription: activeForm.excerpt.trim() || undefined,
      });
      setForms((prev) => ({
        ...prev,
        [activeSlug]: {
          title: saved.title,
          excerpt: saved.excerpt ?? '',
          contentHtml: saved.contentHtml ?? '',
        },
      }));
      setToast({ kind: 'success', message: `${POLICY_PAGE_LABELS[activeSlug]} saved.` });
    } catch (e) {
      const message = formatApiError(e);
      setError(message);
      setToast({ kind: 'error', message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading policy pages…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Policy pages</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Edit Shipping &amp; Returns, Privacy Policy, and Terms &amp; Conditions. Changes publish
          immediately to the storefront.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {toast ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            toast.kind === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {POLICY_PAGE_SLUGS.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => setActiveSlug(slug)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeSlug === slug
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {POLICY_PAGE_LABELS[slug]}
          </button>
        ))}
      </div>

      <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <label htmlFor="policy-title" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Page title
          </label>
          <input
            id="policy-title"
            type="text"
            value={activeForm.title}
            onChange={(e) => updateActiveForm({ title: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          />
        </div>

        <div>
          <label htmlFor="policy-excerpt" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Short summary (optional)
          </label>
          <textarea
            id="policy-excerpt"
            rows={2}
            value={activeForm.excerpt}
            onChange={(e) => updateActiveForm({ excerpt: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          />
        </div>

        <RichTextEditor
          label="Page content"
          value={activeForm.contentHtml}
          onChange={(contentHtml) => updateActiveForm({ contentHtml })}
        />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className={adminUi.btnPrimary}
          >
            {saving ? 'Saving…' : `Save ${POLICY_PAGE_LABELS[activeSlug]}`}
          </button>
          <a
            href={`/${activeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            View live page
          </a>
        </div>
      </div>
    </div>
  );
}
