'use client';

import type { PlpFilterState } from '@/lib/plp-url-state';

type Chip = { key: string; label: string; onRemove: () => void };

type Props = {
  filters: PlpFilterState;
  categoryNameById: Map<string, string>;
  onChange: (next: PlpFilterState) => void;
};

export function PlpActiveFilterChips({ filters, categoryNameById, onChange }: Props) {
  const chips: Chip[] = [];

  if (filters.search?.trim()) {
    chips.push({
      key: 'search',
      label: `Search: ${filters.search}`,
      onRemove: () =>
        onChange({
          ...filters,
          page: 1,
          search: undefined,
        }),
    });
  }

  for (const id of filters.categoryIds) {
    chips.push({
      key: `cat-${id}`,
      label: `Category: ${categoryNameById.get(id) ?? id.slice(0, 8)}…`,
      onRemove: () =>
        onChange({
          ...filters,
          page: 1,
          categoryIds: filters.categoryIds.filter((x) => x !== id),
        }),
    });
  }

  for (const [code, values] of Object.entries(filters.facetAttr)) {
    for (const v of values) {
      chips.push({
        key: `${code}-${v}`,
        label: `${code}: ${v}`,
        onRemove: () => {
          const nextAttr = { ...filters.facetAttr };
          const list = (nextAttr[code] ?? []).filter((x) => x !== v);
          if (list.length) nextAttr[code] = list;
          else delete nextAttr[code];
          onChange({ ...filters, page: 1, facetAttr: nextAttr });
        },
      });
    }
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    const lo = filters.minPrice != null && Number.isFinite(filters.minPrice) ? Math.round(filters.minPrice) : '…';
    const hi = filters.maxPrice != null && Number.isFinite(filters.maxPrice) ? Math.round(filters.maxPrice) : '…';
    chips.push({
      key: 'price',
      label: `Price: ${lo}–${hi}`,
      onRemove: () =>
        onChange({
          ...filters,
          page: 1,
          minPrice: undefined,
          maxPrice: undefined,
        }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-secondary/60 bg-brand-secondary/40 px-3 py-1 text-xs font-medium text-brand-text transition-colors hover:bg-brand-secondary/60"
        >
          <span>{c.label}</span>
          <span className="text-muted-foreground" aria-hidden>
            ×
          </span>
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
    </div>
  );
}
