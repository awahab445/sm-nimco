'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { categoryApi, type CategoryTreeItem } from '@/lib/api-client';

function sortByPosition<T extends { position?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function CategoryMegaNav() {
  const [roots, setRoots] = useState<CategoryTreeItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    categoryApi
      .getCategories({ tree: true })
      .then((res) => {
        if (cancelled) return;
        const tree = Array.isArray(res) ? res : [];
        setRoots(sortByPosition(tree as CategoryTreeItem[]));
      })
      .catch(() => {
        if (!cancelled) setRoots([]);
      });
    return () => {
      cancelled = true;
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), 150);
  };

  if (roots.length === 0) return null;

  return (
    <nav
      className="border-t border-border/80 bg-muted/25"
      aria-label="Product categories"
    >
      <div className="mx-auto flex w-full max-w-[100rem] items-center gap-0.5 overflow-x-auto px-4 py-2 sm:px-8 lg:px-12 xl:px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/products"
          className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          All products
        </Link>
        {roots.map((cat) => {
          const children = sortByPosition(cat.children ?? []);
          const hasChildren = children.length > 0;
          const isOpen = openId === cat.id;

          return (
            <div
              key={cat.id}
              className="relative shrink-0"
              onMouseEnter={() => {
                cancelClose();
                setOpenId(cat.id);
              }}
              onMouseLeave={scheduleClose}
            >
              <Link
                href={`/categories/${cat.slug}`}
                className={`block rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isOpen
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {cat.name}
              </Link>
              {hasChildren && isOpen && (
                <div
                  className="absolute left-0 top-full z-40 min-w-[240px] pt-1"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="block border-b border-border pb-2 text-sm font-semibold text-foreground hover:text-primary"
                    >
                      All in {cat.name}
                    </Link>
                    <ul className="mt-2 max-h-72 space-y-0.5 overflow-y-auto">
                      {children.map((ch) => (
                        <li key={ch.id}>
                          <Link
                            href={`/categories/${ch.slug}`}
                            className="block rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            {ch.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
