'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categoryApi, type CategoryTreeItem } from '@/lib/api-client';

interface CategoryTilesSectionProps {
  title: string;
  subtitle?: string;
  limit?: number;
}

function takeRoots(tree: CategoryTreeItem[], max: number): CategoryTreeItem[] {
  const roots = [...tree].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return roots.slice(0, max);
}

export function CategoryTilesSection({ title, subtitle, limit = 8 }: CategoryTilesSectionProps) {
  const [roots, setRoots] = useState<CategoryTreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    categoryApi
      .getCategories({ tree: true })
      .then((res) => {
        if (cancelled) return;
        const tree = Array.isArray(res) ? res : [];
        setRoots(takeRoots(tree as CategoryTreeItem[], limit));
      })
      .catch(() => {
        if (!cancelled) setRoots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <section className="space-y-6">
      <div className="max-w-7xl">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted md:h-32" />
          ))}
        </div>
      ) : roots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Categories will appear here once they are created in the admin.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {roots.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex min-h-[7rem] flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:min-h-[8rem]"
            >
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary">{cat.name}</h3>
                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{cat.description}</p>
                )}
              </div>
              {cat.productCount != null && (
                <span className="text-xs text-muted-foreground">{cat.productCount} products</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
