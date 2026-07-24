'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export type PlpSortOption =
  | 'featured'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc';

export type PlpListingMode = 'list' | 'grid-2' | 'grid-3' | 'grid-4';

export const PLP_SORT_OPTIONS: { value: PlpSortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'name-asc', label: 'Alphabetically, A-Z' },
  { value: 'name-desc', label: 'Alphabetically, Z-A' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
];

export function sortProducts<T extends { name: string; basePrice?: number | string }>(
  items: T[],
  sort: PlpSortOption,
): T[] {
  if (sort === 'featured') return items;
  const copy = [...items];
  const priceOf = (p: T) => {
    const n = typeof p.basePrice === 'string' ? parseFloat(p.basePrice) : Number(p.basePrice ?? 0);
    return Number.isFinite(n) ? n : 0;
  };
  copy.sort((a, b) => {
    if (sort === 'name-asc') return a.name.localeCompare(b.name);
    if (sort === 'name-desc') return b.name.localeCompare(a.name);
    if (sort === 'price-asc') return priceOf(a) - priceOf(b);
    if (sort === 'price-desc') return priceOf(b) - priceOf(a);
    return 0;
  });
  return copy;
}

export function plpListingClass(mode: PlpListingMode): string {
  switch (mode) {
    case 'list':
      return 'flex flex-col gap-6 sm:gap-8';
    case 'grid-2':
      /* Mobile 2-col: tight column gap so media fills cells without letterboxing */
      return 'grid grid-cols-2 gap-x-2 gap-y-8 sm:gap-x-5 sm:gap-y-10 [&>*]:min-w-0';
    case 'grid-3':
      return 'grid grid-cols-2 gap-x-2 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 [&>*]:min-w-0';
    case 'grid-4':
    default:
      return 'grid grid-cols-2 gap-x-2 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 [&>*]:min-w-0';
  }
}

function FilterFunnelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" width="16" height="16" aria-hidden fill="currentColor">
      <path d="M324.4 64C339.6 64 352 76.37 352 91.63C352 98.32 349.6 104.8 345.2 109.8L240 230V423.6C240 437.1 229.1 448 215.6 448C210.3 448 205.2 446.3 200.9 443.1L124.7 385.6C116.7 379.5 112 370.1 112 360V230L6.836 109.8C2.429 104.8 0 98.32 0 91.63C0 76.37 12.37 64 27.63 64H324.4zM144 224V360L208 408.3V223.1C208 220.1 209.4 216.4 211.1 213.5L314.7 95.1H37.26L140 213.5C142.6 216.4 143.1 220.1 143.1 223.1L144 224zM496 400C504.8 400 512 407.2 512 416C512 424.8 504.8 432 496 432H336C327.2 432 320 424.8 320 416C320 407.2 327.2 400 336 400H496zM320 256C320 247.2 327.2 240 336 240H496C504.8 240 512 247.2 512 256C512 264.8 504.8 272 496 272H336C327.2 272 320 264.8 320 256zM496 80C504.8 80 512 87.16 512 96C512 104.8 504.8 112 496 112H400C391.2 112 384 104.8 384 96C384 87.16 391.2 80 400 80H496z" />
    </svg>
  );
}

function SortChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 19 12" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        points="17 2 9.5 10 2 2"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

type SortControlProps = {
  value: PlpSortOption;
  onChange: (next: PlpSortOption) => void;
};

export function PlpSortControl({ value, onChange }: SortControlProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = PLP_SORT_OPTIONS.find((o) => o.value === value) ?? PLP_SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="plp-sort relative" ref={rootRef}>
      <button
        type="button"
        className="plp-sort__trigger inline-flex max-w-full items-center gap-2.5 text-sm transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        suppressHydrationWarning
      >
        <span className="hidden truncate md:inline">{current.label}</span>
        <span className="md:hidden">Sort</span>
        <SortChevron className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          className="plp-sort__menu absolute right-0 z-30 mt-2 min-w-[13.5rem] border border-border/70 bg-background py-2 shadow-[0_8px_24px_color-mix(in_srgb,var(--foreground)_10%,transparent)]"
          role="listbox"
          aria-label="Sort products"
        >
          <p className="mb-1 border-b border-border/50 px-4 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">
            Sort by
          </p>
          {PLP_SORT_OPTIONS.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={`plp-sort__option block w-full px-4 py-2 text-left text-sm transition-colors ${
                  selected ? 'plp-sort__option--active' : ''
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type LayoutSwitchProps = {
  value: PlpListingMode;
  onChange: (next: PlpListingMode) => void;
};

/** Kalles-style column / list glyphs (border + bar shadows). */
export function PlpLayoutSwitch({ value, onChange }: LayoutSwitchProps) {
  /** Below lg: only list + 2-col are shown (matches Kalles mobile toolbar). */
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const modes: { mode: PlpListingMode; label: string; icon: string; btnClass: string }[] = [
    { mode: 'list', label: 'List view', icon: 'plp-view-icon plp-view-icon--list', btnClass: 'inline-flex' },
    {
      mode: 'grid-2',
      label: '2-column grid',
      icon: 'plp-view-icon plp-view-icon--2',
      btnClass: 'inline-flex',
    },
    {
      mode: 'grid-3',
      label: '3-column grid',
      icon: 'plp-view-icon plp-view-icon--3',
      btnClass: 'hidden lg:inline-flex',
    },
    {
      mode: 'grid-4',
      label: '4-column grid',
      icon: 'plp-view-icon plp-view-icon--4',
      btnClass: 'hidden lg:inline-flex',
    },
  ];

  const isActive = (mode: PlpListingMode) => {
    if (value === mode) return true;
    // grid-3/4 collapse to 2 cols below lg — keep the 2-col switch highlighted
    if (!isDesktop && mode === 'grid-2' && (value === 'grid-3' || value === 'grid-4')) {
      return true;
    }
    return false;
  };

  return (
    <div className="plp-layout-switch flex items-center gap-2.5" role="group" aria-label="Listing layout">
      {modes.map(({ mode, label, icon, btnClass }) => {
        const active = isActive(mode);
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`${btnClass} items-center justify-center`}
            aria-pressed={active}
            aria-label={label}
            suppressHydrationWarning
          >
            <span className={`${icon}${active ? ' is-active' : ''}`} />
          </button>
        );
      })}
    </div>
  );
}

type ToolbarProps = {
  sortBy: PlpSortOption;
  onSortChange: (next: PlpSortOption) => void;
  listingMode: PlpListingMode;
  onListingModeChange: (next: PlpListingMode) => void;
  /** Mobile filter trigger */
  onOpenFilters?: () => void;
  filterCount?: number;
  resultSummary?: ReactNode;
  showFilterButton?: boolean;
  filterExpanded?: boolean;
  filterControlsId?: string;
};

/**
 * Kalles shop-control: Filter | Layout (center) | Sort
 */
export function PlpToolbar({
  sortBy,
  onSortChange,
  listingMode,
  onListingModeChange,
  onOpenFilters,
  filterCount = 0,
  resultSummary,
  showFilterButton = false,
  filterExpanded,
  filterControlsId,
}: ToolbarProps) {
  return (
    <div className="plp-toolbar mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-3 border-b border-border/60 pb-4 sm:gap-x-5">
      <div className="plp-toolbar__start flex min-w-0 flex-wrap items-center gap-3 justify-self-start sm:gap-4">
        {showFilterButton && onOpenFilters ? (
          <button
            type="button"
            onClick={onOpenFilters}
            className="plp-toolbar__filter-btn inline-flex items-center gap-1.5 text-sm transition-colors lg:hidden"
            aria-expanded={filterExpanded}
            aria-controls={filterControlsId}
          >
            <FilterFunnelIcon className="h-4 w-4 shrink-0" />
            <span>Filter</span>
            {filterCount > 0 ? (
              <span className="plp-toolbar__filter-count">({filterCount})</span>
            ) : null}
          </button>
        ) : null}
        {resultSummary ? <div className="plp-toolbar__results min-w-0">{resultSummary}</div> : null}
      </div>

      <div className="plp-toolbar__center justify-self-center">
        <PlpLayoutSwitch value={listingMode} onChange={onListingModeChange} />
      </div>

      <div className="plp-toolbar__end justify-self-end">
        <PlpSortControl value={sortBy} onChange={onSortChange} />
      </div>
    </div>
  );
}
