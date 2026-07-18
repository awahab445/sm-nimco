import Link from 'next/link';
import type { CategoryTreeItem } from '@/lib/api-client';
import { fetchCategoryTree, fetchProductList } from '@/lib/catalog/catalog.server';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { StorefrontImage } from '@/components/ui/storefront-image';

interface CategoryTilesSectionProps {
  title: string;
  subtitle?: string;
  limit?: number;
}

function takeRoots(tree: CategoryTreeItem[], max: number): CategoryTreeItem[] {
  const roots = [...tree].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return roots.slice(0, max);
}

async function fetchCategoryCoverImage(categoryId: string): Promise<string | undefined> {
  const data = await fetchProductList({ page: 1, limit: 1, category: categoryId });
  const product = data?.data?.[0];
  const image = product?.images?.find((i) => i.isPrimary) ?? product?.images?.[0];
  return resolveImageUrl(image?.url);
}

export async function CategoryTilesSection({
  title,
  subtitle,
  limit = 8,
}: CategoryTilesSectionProps) {
  const tree = await fetchCategoryTree();
  const roots = takeRoots(tree, limit);
  const covers = await Promise.all(
    roots.map(async (cat) => ({
      id: cat.id,
      imageUrl: await fetchCategoryCoverImage(cat.id),
    })),
  );
  const coverById = new Map(covers.map((entry) => [entry.id, entry.imageUrl]));

  return (
    <section className="space-y-6 sm:space-y-10">
      <div className="text-center">
        {subtitle ? (
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        <h2
          className={`font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-[1.75rem] ${
            subtitle ? 'mt-2.5' : ''
          }`}
        >
          {title}
        </h2>
      </div>

      {roots.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Categories will appear here once they are created in the admin.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4 lg:gap-3">
          {roots.map((cat) => {
            const imageUrl = coverById.get(cat.id);

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-muted"
              >
                {imageUrl ? (
                  <StorefrontImage
                    src={imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    quality={65}
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-secondary via-muted/60 to-background"
                    aria-hidden
                  />
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/5 to-transparent transition-opacity duration-300 group-hover:from-foreground/70"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                  <h3 className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-background sm:text-sm md:text-[0.9375rem]">
                    {cat.name}
                  </h3>
                  {cat.productCount != null ? (
                    <span className="mt-1 block text-[11px] text-background/70 sm:text-xs">
                      {cat.productCount} products
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
