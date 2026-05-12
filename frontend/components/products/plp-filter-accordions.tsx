'use client';

import type { ProductFacets, FacetPanelAttribute, FacetPanelCategory, FacetPanelPrice } from '@/lib/api-client';
import type { PlpFilterState } from '@/lib/plp-url-state';
import { PlpDualRangePrice } from '@/components/products/plp-dual-range-price';

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group border-b border-border py-1 last:border-b-0"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="text-muted-foreground transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="pb-3 pt-1">{children}</div>
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
};

export function PlpFilterAccordions({ filters, facets, categoryNameById, onFiltersChange }: Props) {
  const panels = facets?.filterPanels ?? [];

  return (
    <div className="rounded-xl border border-border bg-card">
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
      <ul className="max-h-52 space-y-1.5 overflow-y-auto overscroll-contain pr-1">
        {categories.map((c) => {
          const checked = filters.categoryIds.includes(c.id);
          const label = c.name || categoryNameById.get(c.id) || 'Category';
          return (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
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
                  className="rounded border-input"
                />
                <span className="min-w-0 flex-1 truncate">
                  {label}
                  {c.count > 0 ? <span className="text-muted-foreground"> ({c.count})</span> : null}
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
      <ul className="max-h-44 space-y-1.5 overflow-y-auto overscroll-contain pr-1">
        {panel.options.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Add options under <strong>Store filters</strong> in the admin, or set{' '}
            <code className="rounded bg-muted px-1">{code}</code> on product attributes.
          </p>
        ) : (
          panel.options.map((opt) => (
            <li key={opt.value}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
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
                  className="rounded border-input"
                />
                <span className="min-w-0 flex-1 truncate">
                  {opt.label}
                  <span className="text-muted-foreground"> ({opt.count})</span>
                </span>
              </label>
            </li>
          ))
        )}
      </ul>
    </AccordionSection>
  );
}
