'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categoryApi, type Category } from '@/lib/api-client';

function flattenCategories(cats: { data?: Category[] } | Category[]): Category[] {
  if (Array.isArray(cats)) return cats;
  return cats.data ?? [];
}

export function CategorySidebar() {
  const pathname = usePathname() ?? '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    categoryApi
      .getCategories()
      .then((res) => {
        if (!cancelled) setCategories(flattenCategories(res));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <aside className="w-56 shrink-0">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <ul className="mt-4 space-y-1">
          {[1, 2, 3].map((i) => (
            <li key={i} className="h-8 animate-pulse rounded bg-muted/70" />
          ))}
        </ul>
      </aside>
    );
  }

  return (
    <aside className="w-56 shrink-0">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Categories
      </h2>
      <ul className="mt-3 space-y-0.5">
        <li>
          <Link
            href="/products"
            className={`block rounded-md px-3 py-2 text-sm font-medium ${
              pathname === '/products'
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/90 hover:bg-muted'
            }`}
          >
            All products
          </Link>
        </li>
        {categories.map((cat) => {
          const isActive = pathname === `/categories/${cat.slug}`;
          return (
            <li key={cat.id}>
              <Link
                href={`/categories/${cat.slug}`}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/90 hover:bg-muted'
                }`}
              >
                {cat.name}
                {cat.productCount != null && (
                  <span className="ml-1.5 text-muted-foreground">
                    ({cat.productCount})
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
