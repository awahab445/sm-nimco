'use client';

import Link from 'next/link';

export type PlpPageItem = number | 'ellipsis';

/** Kalles-style window: nearby pages + first/last with ellipsis gaps. */
export function buildPlpPageItems(current: number, total: number): PlpPageItem[] {
  if (total <= 1) return [1];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  if (current <= 2) {
    pages.add(2);
    pages.add(3);
  }
  if (current >= total - 1) {
    pages.add(total - 1);
    pages.add(total - 2);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: PlpPageItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) out.push('ellipsis');
    out.push(sorted[i]!);
  }
  return out;
}

type Props = {
  page: number;
  totalPages: number;
  /** Build href for a 1-based page number */
  hrefForPage: (page: number) => string;
  className?: string;
};

export function PlpPagination({ page, totalPages, hrefForPage, className }: Props) {
  if (totalPages <= 1) return null;

  const items = buildPlpPageItems(page, totalPages);

  return (
    <div className={`plp-pagination ${className ?? ''}`.trim()}>
      <nav className="plp-pagination__nav" role="navigation" aria-label="Pagination">
        <ul className="plp-pagination__list" role="list">
          {page > 1 ? (
            <li>
              <Link
                href={hrefForPage(page - 1)}
                rel="prev"
                className="plp-pagination__item plp-pagination__item--arrow"
                aria-label="Previous page"
              >
                Prev
              </Link>
            </li>
          ) : null}

          {items.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <li key={`e-${idx}`}>
                  <span className="plp-pagination__item plp-pagination__item--ellipsis" aria-hidden>
                    &hellip;
                  </span>
                </li>
              );
            }

            const isCurrent = item === page;
            return (
              <li key={item}>
                {isCurrent ? (
                  <span className="plp-pagination__item plp-pagination__item--current" aria-current="page">
                    {item}
                  </span>
                ) : (
                  <Link
                    href={hrefForPage(item)}
                    className="plp-pagination__item"
                    aria-label={`Go to page ${item}`}
                  >
                    {item}
                  </Link>
                )}
              </li>
            );
          })}

          {page < totalPages ? (
            <li>
              <Link
                href={hrefForPage(page + 1)}
                rel="next"
                className="plp-pagination__item plp-pagination__item--arrow"
                aria-label="Next page"
              >
                Next
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </div>
  );
}
