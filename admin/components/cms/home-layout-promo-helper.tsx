'use client';

import { useMemo, useState } from 'react';

export type PromoBannerDraft = {
  id: string;
  type: 'promo_banner';
  title: string;
  eyebrow?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  backgroundColor?: string;
  productImageUrl?: string;
  textAlign?: 'left' | 'center' | 'right';
  buttonStyle?: 'primary' | 'secondary';
  tone?: 'primary' | 'muted';
};

const SAMPLE_STRIP: PromoBannerDraft[] = [
  {
    id: 'promo-mosaic-a',
    type: 'promo_banner',
    eyebrow: 'Nutrition',
    title: 'For life',
    backgroundColor: '#d4efe3',
    productImageUrl: '/themes/mehfil-shereen/banner1.jpeg',
    ctaLabel: 'Shop now',
    ctaHref: '/products',
    textAlign: 'left',
    buttonStyle: 'primary',
  },
  {
    id: 'promo-mosaic-b',
    type: 'promo_banner',
    eyebrow: 'Lookbook 2021',
    title: 'Make love this look',
    imageUrl: '/themes/mehfil-shereen/texture.png',
    textAlign: 'center',
  },
  {
    id: 'promo-mosaic-c',
    type: 'promo_banner',
    eyebrow: 'Vitamin',
    title: 'For children',
    subtitle: 'Up to 50% off',
    backgroundColor: '#f5e9b8',
    productImageUrl: '/themes/mehfil-shereen/banner1.jpeg',
    ctaLabel: 'Shop now',
    ctaHref: '/products',
    textAlign: 'left',
    buttonStyle: 'secondary',
  },
];

function parseLayout(jsonText: string): { sections: Record<string, unknown>[]; ok: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonText || '{}') as { sections?: unknown };
    if (!Array.isArray(parsed.sections)) {
      return { sections: [], ok: false, error: 'JSON must include a sections array.' };
    }
    return { sections: parsed.sections as Record<string, unknown>[], ok: true };
  } catch {
    return { sections: [], ok: false, error: 'Invalid JSON — fix Block JSON before editing banners.' };
  }
}

function isPromo(section: Record<string, unknown>): section is PromoBannerDraft & Record<string, unknown> {
  return section.type === 'promo_banner';
}

type HomeLayoutPromoHelperProps = {
  contentJsonText: string;
  onChange: (nextJsonText: string) => void;
};

/**
 * Structured editor for consecutive `promo_banner` sections in home-page-layout JSON.
 * Storefront groups consecutive promo_banner blocks into a 3-up mosaic row.
 */
export function HomeLayoutPromoHelper({ contentJsonText, onChange }: HomeLayoutPromoHelperProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const parsed = useMemo(() => parseLayout(contentJsonText), [contentJsonText]);

  const promoSections = useMemo(
    () =>
      parsed.sections
        .map((s, index) => ({ section: s, index }))
        .filter(({ section }) => isPromo(section)),
    [parsed.sections],
  );

  const writeSections = (nextSections: Record<string, unknown>[]) => {
    try {
      const base = JSON.parse(contentJsonText || '{}') as Record<string, unknown>;
      const next = { ...base, sections: nextSections };
      onChange(JSON.stringify(next, null, 2));
      setLocalError(null);
    } catch {
      setLocalError('Could not write JSON.');
    }
  };

  const updatePromoAt = (sectionIndex: number, patch: Partial<PromoBannerDraft>) => {
    if (!parsed.ok) return;
    const next = parsed.sections.map((s, i) => {
      if (i !== sectionIndex || !isPromo(s)) return s;
      const merged = { ...s, ...patch, type: 'promo_banner' as const };
      // Drop empty optional strings so JSON stays clean
      for (const key of [
        'eyebrow',
        'subtitle',
        'ctaLabel',
        'ctaHref',
        'imageUrl',
        'backgroundColor',
        'productImageUrl',
      ] as const) {
        if (typeof merged[key] === 'string' && merged[key].trim() === '') {
          delete merged[key];
        }
      }
      return merged;
    });
    writeSections(next);
  };

  const removePromoAt = (sectionIndex: number) => {
    if (!parsed.ok) return;
    writeSections(parsed.sections.filter((_, i) => i !== sectionIndex));
  };

  const insertSampleStripAfterHero = () => {
    if (!parsed.ok) {
      setLocalError(parsed.error ?? 'Invalid JSON');
      return;
    }
    const withoutOldMosaic = parsed.sections.filter((s) => {
      if (!isPromo(s)) return true;
      const id = String(s.id ?? '');
      return !id.startsWith('promo-mosaic-');
    });
    const heroIdx = withoutOldMosaic.findIndex((s) => s.type === 'hero_slider');
    const insertAt = heroIdx >= 0 ? heroIdx + 1 : 0;
    const next = [
      ...withoutOldMosaic.slice(0, insertAt),
      ...SAMPLE_STRIP.map((b) => ({ ...b })),
      ...withoutOldMosaic.slice(insertAt),
    ];
    writeSections(next);
  };

  const addBlankPromo = () => {
    if (!parsed.ok) {
      setLocalError(parsed.error ?? 'Invalid JSON');
      return;
    }
    const id = `promo-${Date.now().toString(36)}`;
    writeSections([
      ...parsed.sections,
      {
        id,
        type: 'promo_banner',
        title: 'New promo',
        eyebrow: 'Eyebrow',
        backgroundColor: '#f0f0f0',
        textAlign: 'left',
        buttonStyle: 'primary',
        ctaLabel: 'Shop now',
        ctaHref: '/products',
      },
    ]);
  };

  return (
    <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-3 text-xs text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
      <div>
        <p className="font-medium">Homepage promo banners (3-up mosaic)</p>
        <p className="mt-1 text-[11px] leading-relaxed opacity-90">
          Place <span className="font-mono">promo_banner</span> sections <strong>one after another</strong> in{' '}
          <span className="font-mono">sections</span>. The storefront groups consecutive banners into one row
          (3 equal columns on desktop, stacked on mobile). Put them right after{' '}
          <span className="font-mono">hero_slider</span> for the Kalles strip under the main banner.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={insertSampleStripAfterHero}
          className="rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
        >
          Insert sample 3-up strip after hero
        </button>
        <button
          type="button"
          onClick={addBlankPromo}
          className="rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
        >
          Add blank promo banner
        </button>
      </div>

      {(localError || (!parsed.ok && parsed.error)) && (
        <p className="text-[11px] text-red-700 dark:text-red-300">{localError || parsed.error}</p>
      )}

      {parsed.ok && promoSections.length === 0 ? (
        <p className="text-[11px] opacity-80">No promo_banner sections yet. Insert the sample strip or add one.</p>
      ) : null}

      {promoSections.map(({ section, index }, n) => (
        <div
          key={String(section.id ?? index)}
          className="space-y-2 rounded-md border border-emerald-200/80 bg-white p-2.5 dark:border-emerald-900/40 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">
              Banner {n + 1}
              <span className="ml-1 font-mono font-normal text-zinc-500">{String(section.id)}</span>
            </p>
            <button
              type="button"
              onClick={() => removePromoAt(index)}
              className="text-[11px] text-red-700 dark:text-red-300"
            >
              Remove
            </button>
          </div>
          <PromoField
            label="Eyebrow"
            value={String(section.eyebrow ?? '')}
            onChange={(v) => updatePromoAt(index, { eyebrow: v })}
          />
          <PromoField
            label="Heading"
            value={String(section.title ?? '')}
            onChange={(v) => updatePromoAt(index, { title: v })}
          />
          <PromoField
            label="Subtitle (optional)"
            value={String(section.subtitle ?? '')}
            onChange={(v) => updatePromoAt(index, { subtitle: v })}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <PromoField
              label="CTA label"
              value={String(section.ctaLabel ?? '')}
              onChange={(v) => updatePromoAt(index, { ctaLabel: v })}
            />
            <PromoField
              label="CTA href"
              value={String(section.ctaHref ?? '')}
              onChange={(v) => updatePromoAt(index, { ctaHref: v })}
            />
          </div>
          <PromoField
            label="Background color (hex)"
            value={String(section.backgroundColor ?? '')}
            onChange={(v) => updatePromoAt(index, { backgroundColor: v })}
            placeholder="#d4efe3"
          />
          <PromoField
            label="Background image URL"
            value={String(section.imageUrl ?? '')}
            onChange={(v) => updatePromoAt(index, { imageUrl: v })}
            placeholder="/themes/… or uploaded URL"
          />
          <PromoField
            label="Product overlay image URL"
            value={String(section.productImageUrl ?? '')}
            onChange={(v) => updatePromoAt(index, { productImageUrl: v })}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-[11px] text-zinc-600 dark:text-zinc-400">
              Text align
              <select
                className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                value={String(section.textAlign ?? 'left')}
                onChange={(e) =>
                  updatePromoAt(index, {
                    textAlign: e.target.value as PromoBannerDraft['textAlign'],
                  })
                }
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
            <label className="block text-[11px] text-zinc-600 dark:text-zinc-400">
              Button style
              <select
                className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                value={String(section.buttonStyle ?? 'primary')}
                onChange={(e) =>
                  updatePromoAt(index, {
                    buttonStyle: e.target.value as PromoBannerDraft['buttonStyle'],
                  })
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromoField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-[11px] text-zinc-600 dark:text-zinc-400">
      {label}
      <input
        className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
