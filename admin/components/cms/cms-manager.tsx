'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cmsApi,
  type CmsBlock,
  type CmsPage,
  type CmsSlider,
  type CmsSlide,
} from '@/lib/api/cms';
import { formatApiError } from '@/lib/api/error-message';
import { RichTextEditor } from './rich-text-editor';

type TabKey = 'pages' | 'blocks' | 'sliders';

type PageDraft = {
  title: string;
  slug: string;
  status: 'draft' | 'published';
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  contentHtml: string;
};

type SliderDraft = {
  name: string;
  identifier: string;
  isActive: boolean;
  autoplayMs: number | '';
  slides: Array<{
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
    sortOrder: number;
    isActive: boolean;
  }>;
};

const emptyPage: PageDraft = {
  title: '',
  slug: '',
  status: 'draft',
  excerpt: '',
  metaTitle: '',
  metaDescription: '',
  contentHtml: '',
};

const emptyBlock = {
  name: '',
  identifier: '',
  description: '',
  isActive: true,
  contentHtml: '',
  contentJsonText: '{"sections":[]}',
};

const emptySlider: SliderDraft = {
  name: '',
  identifier: '',
  isActive: true,
  autoplayMs: '',
  slides: [
    {
      title: '',
      subtitle: '',
      imageUrl: '',
      ctaLabel: '',
      ctaHref: '',
      sortOrder: 0,
      isActive: true,
    },
  ],
};

export function CmsManager() {
  const [tab, setTab] = useState<TabKey>('pages');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pages, setPages] = useState<CmsPage[]>([]);
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [sliders, setSliders] = useState<CmsSlider[]>([]);

  const [pageForm, setPageForm] = useState<PageDraft>(emptyPage);
  const [blockForm, setBlockForm] = useState(emptyBlock);
  const [sliderForm, setSliderForm] = useState<SliderDraft>(emptySlider);

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingSliderId, setEditingSliderId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, b, s] = await Promise.all([
        cmsApi.listPages(),
        cmsApi.listBlocks(),
        cmsApi.listSliders(),
      ]);
      setPages(p);
      setBlocks(b);
      setSliders(s);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pageSummary = useMemo(
    () => `${pages.length} page${pages.length === 1 ? '' : 's'}`,
    [pages.length],
  );

  const submitPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...pageForm,
        excerpt: pageForm.excerpt || undefined,
        metaTitle: pageForm.metaTitle || undefined,
        metaDescription: pageForm.metaDescription || undefined,
      };
      if (editingPageId) await cmsApi.updatePage(editingPageId, payload);
      else await cmsApi.createPage(payload);
      setPageForm(emptyPage);
      setEditingPageId(null);
      await load();
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  const submitBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let contentJson: Record<string, unknown> | undefined;
      if (blockForm.contentJsonText.trim()) {
        contentJson = JSON.parse(blockForm.contentJsonText);
      }
      const payload = {
        name: blockForm.name,
        identifier: blockForm.identifier,
        description: blockForm.description || undefined,
        isActive: blockForm.isActive,
        contentHtml: blockForm.contentHtml || undefined,
        contentJson,
      };
      if (editingBlockId) await cmsApi.updateBlock(editingBlockId, payload);
      else await cmsApi.createBlock(payload);
      setBlockForm(emptyBlock);
      setEditingBlockId(null);
      await load();
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  const submitSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        name: sliderForm.name,
        identifier: sliderForm.identifier,
        isActive: sliderForm.isActive,
        autoplayMs: sliderForm.autoplayMs === '' ? undefined : Number(sliderForm.autoplayMs),
        slides: sliderForm.slides.map((s) => ({
          title: s.title,
          subtitle: s.subtitle || undefined,
          imageUrl: s.imageUrl,
          ctaLabel: s.ctaLabel || undefined,
          ctaHref: s.ctaHref || undefined,
          sortOrder: Number(s.sortOrder) || 0,
          isActive: s.isActive,
        })),
      };
      if (editingSliderId) await cmsApi.updateSlider(editingSliderId, payload);
      else await cmsApi.createSlider(payload);
      setSliderForm(emptySlider);
      setEditingSliderId(null);
      await load();
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          CMS
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage static pages, reusable blocks, and banner sliders with rich text content.
        </p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {(['pages', 'blocks', 'sliders'] as TabKey[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-zinc-500">Loading CMS data...</p> : null}

      {tab === 'pages' ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitPage} className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {editingPageId ? 'Edit page' : 'Create page'}
            </h2>
            <Input label="Title" value={pageForm.title} onChange={(v) => setPageForm((s) => ({ ...s, title: v }))} required />
            <Input label="Slug" value={pageForm.slug} onChange={(v) => setPageForm((s) => ({ ...s, slug: v }))} required />
            <label className="block">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Status</span>
              <select
                value={pageForm.status}
                onChange={(e) => setPageForm((s) => ({ ...s, status: e.target.value as 'draft' | 'published' }))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>
            <TextArea label="Excerpt" value={pageForm.excerpt} onChange={(v) => setPageForm((s) => ({ ...s, excerpt: v }))} />
            <Input label="Meta title" value={pageForm.metaTitle} onChange={(v) => setPageForm((s) => ({ ...s, metaTitle: v }))} />
            <TextArea label="Meta description" value={pageForm.metaDescription} onChange={(v) => setPageForm((s) => ({ ...s, metaDescription: v }))} />
            <RichTextEditor
              label="Content"
              value={pageForm.contentHtml}
              onChange={(v) => setPageForm((s) => ({ ...s, contentHtml: v }))}
            />
            <ActionRow onReset={() => { setPageForm(emptyPage); setEditingPageId(null); }} />
          </form>

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{pageSummary}</h3>
            <div className="mt-3 space-y-2">
              {pages.map((p) => (
                <RowCard
                  key={p.id}
                  title={p.title}
                  subtitle={`/${p.slug} • ${p.status}`}
                  onEdit={() => {
                    setEditingPageId(p.id);
                    setPageForm({
                      title: p.title,
                      slug: p.slug,
                      status: p.status,
                      excerpt: p.excerpt ?? '',
                      metaTitle: p.metaTitle ?? '',
                      metaDescription: p.metaDescription ?? '',
                      contentHtml: p.contentHtml ?? '',
                    });
                  }}
                  onDelete={async () => {
                    await cmsApi.deletePage(p.id);
                    await load();
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'blocks' ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitBlock} className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {editingBlockId ? 'Edit block' : 'Create block'}
            </h2>
            <Input label="Name" value={blockForm.name} onChange={(v) => setBlockForm((s) => ({ ...s, name: v }))} required />
            <Input label="Identifier" value={blockForm.identifier} onChange={(v) => setBlockForm((s) => ({ ...s, identifier: v }))} required />
            <TextArea label="Description" value={blockForm.description} onChange={(v) => setBlockForm((s) => ({ ...s, description: v }))} />
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={blockForm.isActive}
                onChange={(e) => setBlockForm((s) => ({ ...s, isActive: e.target.checked }))}
              />
              Active
            </label>
            <RichTextEditor
              label="Block HTML content"
              value={blockForm.contentHtml}
              onChange={(v) => setBlockForm((s) => ({ ...s, contentHtml: v }))}
            />
            <TextArea
              label="Block JSON content (for structured layouts)"
              value={blockForm.contentJsonText}
              onChange={(v) => setBlockForm((s) => ({ ...s, contentJsonText: v }))}
              rows={6}
            />
            <ActionRow onReset={() => { setBlockForm(emptyBlock); setEditingBlockId(null); }} />
          </form>

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {blocks.length} block{blocks.length === 1 ? '' : 's'}
            </h3>
            <div className="mt-3 space-y-2">
              {blocks.map((b) => (
                <RowCard
                  key={b.id}
                  title={b.name}
                  subtitle={`${b.identifier} • ${b.isActive ? 'active' : 'inactive'}`}
                  onEdit={() => {
                    setEditingBlockId(b.id);
                    setBlockForm({
                      name: b.name,
                      identifier: b.identifier,
                      description: b.description ?? '',
                      isActive: b.isActive,
                      contentHtml: b.contentHtml ?? '',
                      contentJsonText: JSON.stringify(b.contentJson ?? {}, null, 2),
                    });
                  }}
                  onDelete={async () => {
                    await cmsApi.deleteBlock(b.id);
                    await load();
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'sliders' ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitSlider} className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {editingSliderId ? 'Edit slider' : 'Create slider'}
            </h2>
            <Input label="Name" value={sliderForm.name} onChange={(v) => setSliderForm((s) => ({ ...s, name: v }))} required />
            <Input label="Identifier" value={sliderForm.identifier} onChange={(v) => setSliderForm((s) => ({ ...s, identifier: v }))} required />
            <Input
              label="Autoplay (ms)"
              value={String(sliderForm.autoplayMs)}
              onChange={(v) => setSliderForm((s) => ({ ...s, autoplayMs: v ? Number(v) : '' }))}
              type="number"
            />
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={sliderForm.isActive}
                onChange={(e) => setSliderForm((s) => ({ ...s, isActive: e.target.checked }))}
              />
              Active
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Slides</p>
                <button
                  type="button"
                  onClick={() =>
                    setSliderForm((s) => ({
                      ...s,
                      slides: [
                        ...s.slides,
                        {
                          title: '',
                          subtitle: '',
                          imageUrl: '',
                          ctaLabel: '',
                          ctaHref: '',
                          sortOrder: s.slides.length,
                          isActive: true,
                        },
                      ],
                    }))
                  }
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                >
                  Add slide
                </button>
              </div>
              {sliderForm.slides.map((slide, idx) => (
                <SlideFields
                  key={`${idx}-${slide.title}`}
                  slide={slide}
                  onChange={(next) =>
                    setSliderForm((s) => ({
                      ...s,
                      slides: s.slides.map((current, i) => (i === idx ? next : current)),
                    }))
                  }
                  onRemove={() =>
                    setSliderForm((s) => ({
                      ...s,
                      slides: s.slides.filter((_, i) => i !== idx),
                    }))
                  }
                />
              ))}
            </div>
            <ActionRow onReset={() => { setSliderForm(emptySlider); setEditingSliderId(null); }} />
          </form>

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {sliders.length} slider{sliders.length === 1 ? '' : 's'}
            </h3>
            <div className="mt-3 space-y-2">
              {sliders.map((s) => (
                <RowCard
                  key={s.id}
                  title={s.name}
                  subtitle={`${s.identifier} • slides: ${s.slides.length}`}
                  onEdit={() => {
                    setEditingSliderId(s.id);
                    setSliderForm({
                      name: s.name,
                      identifier: s.identifier,
                      isActive: s.isActive,
                      autoplayMs: s.autoplayMs ?? '',
                      slides: s.slides.map((slide) => ({
                        title: slide.title,
                        subtitle: slide.subtitle ?? '',
                        imageUrl: slide.imageUrl,
                        ctaLabel: slide.ctaLabel ?? '',
                        ctaHref: slide.ctaHref ?? '',
                        sortOrder: slide.sortOrder,
                        isActive: slide.isActive,
                      })),
                    });
                  }}
                  onDelete={async () => {
                    await cmsApi.deleteSlider(s.id);
                    await load();
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <input
        value={value}
        required={required}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </label>
  );
}

function RowCard({
  title,
  subtitle,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onEdit} className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700">
          Edit
        </button>
        <button
          type="button"
          onClick={() => void onDelete()}
          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 dark:border-red-900/50 dark:text-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function ActionRow({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
      >
        Reset
      </button>
    </div>
  );
}

function SlideFields({
  slide,
  onChange,
  onRemove,
}: {
  slide: SliderDraft['slides'][number];
  onChange: (next: SliderDraft['slides'][number]) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <Input label="Title" value={slide.title} onChange={(v) => onChange({ ...slide, title: v })} required />
      <Input label="Image URL" value={slide.imageUrl} onChange={(v) => onChange({ ...slide, imageUrl: v })} required />
      <Input label="Subtitle" value={slide.subtitle} onChange={(v) => onChange({ ...slide, subtitle: v })} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input label="CTA label" value={slide.ctaLabel} onChange={(v) => onChange({ ...slide, ctaLabel: v })} />
        <Input label="CTA href" value={slide.ctaHref} onChange={(v) => onChange({ ...slide, ctaHref: v })} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          label="Sort order"
          type="number"
          value={String(slide.sortOrder)}
          onChange={(v) => onChange({ ...slide, sortOrder: Number(v) || 0 })}
        />
        <label className="flex items-end gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={slide.isActive}
            onChange={(e) => onChange({ ...slide, isActive: e.target.checked })}
          />
          Active
        </label>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 dark:border-red-900/50 dark:text-red-300"
      >
        Remove slide
      </button>
    </div>
  );
}
