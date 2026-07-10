import Link from 'next/link';
import type { CategoryTreeItem } from '@/lib/api-client';
import { fetchCategoryTree } from '@/lib/catalog/catalog.server';

interface CategoryTilesSectionProps {
  title: string;
  subtitle?: string;
  limit?: number;
}

function takeRoots(tree: CategoryTreeItem[], max: number): CategoryTreeItem[] {
  const roots = [...tree].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return roots.slice(0, max);
}

export async function CategoryTilesSection({
  title,
  subtitle,
  limit = 8,
}: CategoryTilesSectionProps) {
  const tree = await fetchCategoryTree();
  const roots = takeRoots(tree, limit);

  return (
    <section className="space-y-6">
      <div className="max-w-7xl">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>

      {roots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Categories will appear here once they are created in the admin.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {roots.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex min-h-[7rem] flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-product-card transition-shadow hover:shadow-md md:min-h-[8rem]"
            >
              <div>
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {cat.name}
                </h3>
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
