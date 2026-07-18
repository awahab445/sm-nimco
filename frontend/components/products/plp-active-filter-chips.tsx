'use client';

import type { PlpFilterState } from '@/lib/plp-url-state';

type Chip = { key: string; label: string; onRemove: () => void };

type Props = {
  filters: PlpFilterState;
  categoryNameById: Map<string, string>;
  onChange: (next: PlpFilterState) => void;
  onClearAll?: () => void;
};

export function PlpActiveFilterChips({ filters, categoryNameById, onChange, onClearAll }: Props) {
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
      label: categoryNameById.get(id) ?? id.slice(0, 8),
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

  const clearAll =
    onClearAll ??
    (() =>
      onChange({
        page: 1,
        search: filters.search,
        categoryIds: [],
        facetAttr: {},
        minPrice: undefined,
        maxPrice: undefined,
      }));

  return (
    <div className="plp-active-chips mb-6 flex flex-wrap items-center gap-x-0 gap-y-2">
      <span className="plp-active-chips__count mr-4 border-r border-border/60 pr-4 text-sm text-muted-foreground">
        Filters <span className="plp-active-chips__count-num">({chips.length})</span>
      </span>
      {chips.map((c, idx) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          className={`plp-active-chip group relative mr-4 inline-flex items-center gap-2 pr-4 text-sm text-foreground ${
            idx < chips.length - 1 ? 'border-r border-border/60' : ''
          }`}
        >
          <span className="plp-active-chip__remove" aria-hidden />
          <span>{c.label}</span>
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button type="button" onClick={clearAll} className="plp-active-chips__clear ml-1 text-sm">
        Clear all
      </button>
    </div>
  );
}
