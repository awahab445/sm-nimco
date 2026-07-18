'use client';

import type { ReactNode } from 'react';
import type { ProductFacets, FacetPanelAttribute, FacetPanelCategory, FacetPanelPrice } from '@/lib/api-client';
import type { PlpFilterState } from '@/lib/plp-url-state';
import { PlpDualRangePrice } from '@/components/products/plp-dual-range-price';

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="plp-filter-accordion group" open={defaultOpen}>
      <summary className="plp-filter-accordion__trigger">
        <span className="plp-filter-accordion__trigger-inner">
          <span className="plp-filter-accordion__title">{title}</span>
          <span className="plp-filter-accordion__icon" aria-hidden>
            <span className="plp-filter-accordion__toggle relative h-3 w-3">
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
              <span className="plp-filter-accordion__toggle-bar--vertical absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
            </span>
          </span>
        </span>
      </summary>
      <div className="plp-filter-accordion__body">{children}</div>
    </details>
  );
}

function toggle(list: string[], v: string): string[] {
  if (list.includes(v)) return list.filter((x) => x !== v);
  return [...list, v];
}

type Props = {
  filters: PlpFilterState;
  facets: ProductFacets | null;
  categoryNameById: Map<string, string>;
  onFiltersChange: (next: PlpFilterState) => void;
  /** When true, category facet panel is hidden (browse tree handles categories). */
  hideCategoryPanels?: boolean;
};

export function PlpFilterAccordions({
  filters,
  facets,
  categoryNameById,
  onFiltersChange,
  hideCategoryPanels = false,
}: Props) {
  const panels = (facets?.filterPanels ?? []).filter((p) => !(hideCategoryPanels && p.kind === 'category'));

  return (
    <div className="plp-filter-accordions">
      {panels.map((panel, idx) => {
        if (panel.kind === 'category') {
          return (
            <CategoryPanel
              key={panel.code}
              panel={panel}
              filters={filters}
              categoryNameById={categoryNameById}
              onFiltersChange={onFiltersChange}
              defaultOpen={idx === 0}
            />
          );
        }
        if (panel.kind === 'price') {
          return (
            <PricePanel key={panel.code} panel={panel} filters={filters} onFiltersChange={onFiltersChange} />
          );
        }
        if (panel.kind === 'attribute') {
          return (
            <AttributePanel
              key={panel.code}
              panel={panel}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

function CategoryPanel({
  panel,
  filters,
  categoryNameById,
  onFiltersChange,
  defaultOpen,
}: {
  panel: FacetPanelCategory;
  filters: PlpFilterState;
  categoryNameById: Map<string, string>;
  onFiltersChange: (next: PlpFilterState) => void;
  defaultOpen: boolean;
}) {
  const categories = panel.categories?.length
    ? panel.categories
    : Array.from(categoryNameById.entries()).map(([id, name]) => ({
        id,
        name,
        slug: '',
        count: 0,
      }));

  return (
    <AccordionSection title={panel.name} defaultOpen={defaultOpen}>
      <ul className="max-h-56 space-y-2.5 overflow-y-auto overscroll-contain pr-1">
        {categories.map((c) => {
          const checked = filters.categoryIds.includes(c.id);
          const label = c.name || categoryNameById.get(c.id) || 'Category';
          return (
            <li key={c.id}>
              <label className="plp-filter-option group/opt flex cursor-pointer items-center gap-3 text-sm text-foreground">
                <span
                  className={`plp-filter-checkbox ${checked ? 'is-checked' : ''}`}
                  aria-hidden
                >
                  <svg className="plp-filter-checkbox__tick" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onFiltersChange({
                      ...filters,
                      page: 1,
                      categoryIds: toggle(filters.categoryIds, c.id),
                    })
                  }
                  className="sr-only"
                />
                <span className="plp-filter-option__label min-w-0 flex-1 truncate">
                  {label}
                  {c.count > 0 ? <span className="plp-filter-option__count"> ({c.count})</span> : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </AccordionSection>
  );
}

function PricePanel({
  panel,
  filters,
  onFiltersChange,
}: {
  panel: FacetPanelPrice;
  filters: PlpFilterState;
  onFiltersChange: (next: PlpFilterState) => void;
}) {
  const pr = panel.priceRange ?? { min: 0, max: 1 };
  const loB = Math.min(pr.min, pr.max);
  const hiB = Math.max(pr.min, pr.max, loB + 1);

  return (
    <AccordionSection title={panel.name}>
      <PlpDualRangePrice
        boundsMin={loB}
        boundsMax={hiB}
        valueMin={filters.minPrice}
        valueMax={filters.maxPrice}
        onChange={(minP, maxP) =>
          onFiltersChange({
            ...filters,
            page: 1,
            minPrice: minP,
            maxPrice: maxP,
          })
        }
      />
    </AccordionSection>
  );
}

function AttributePanel({
  panel,
  filters,
  onFiltersChange,
}: {
  panel: FacetPanelAttribute;
  filters: PlpFilterState;
  onFiltersChange: (next: PlpFilterState) => void;
}) {
  const code = panel.code;
  const selected = filters.facetAttr[code] ?? [];

  return (
    <AccordionSection title={panel.name}>
      <ul className="max-h-48 space-y-2.5 overflow-y-auto overscroll-contain pr-1">
        {panel.options.length === 0 ? (
          <p className="text-xs text-muted-foreground">No options available.</p>
        ) : (
          panel.options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <li key={opt.value}>
                <label className="plp-filter-option group/opt flex cursor-pointer items-center gap-3 text-sm text-foreground">
                  <span
                    className={`plp-filter-checkbox ${checked ? 'is-checked' : ''}`}
                    aria-hidden
                  >
                    <svg className="plp-filter-checkbox__tick" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const nextList = toggle(selected, opt.value);
                      const nextAttr = { ...filters.facetAttr };
                      if (nextList.length) nextAttr[code] = nextList;
                      else delete nextAttr[code];
                      onFiltersChange({
                        ...filters,
                        page: 1,
                        facetAttr: nextAttr,
                      });
                    }}
                    className="sr-only"
                  />
                  <span className="plp-filter-option__label min-w-0 flex-1 truncate">
                    {opt.label}
                    <span className="plp-filter-option__count"> ({opt.count})</span>
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    </AccordionSection>
  );
}
