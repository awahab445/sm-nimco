import Link from 'next/link';
import type { Category, CategoryTreeItem } from '@/lib/api-client';
import {
  fetchAllCategories,
  fetchCategoryTree,
  fetchProductList,
} from '@/lib/catalog/catalog.server';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { StorefrontImage } from '@/components/ui/storefront-image';
import { categoryImageAlt } from '@/lib/seo';

/** Theme fallbacks when a category has no custom banner or product cover. */
const CATEGORY_BANNER_FALLBACKS: Record<string, string> = {
  'cleaning-products': '/themes/essa_chemicals/hero-cleaning.jpg',
  cleaning: '/themes/essa_chemicals/hero-cleaning.jpg',
  'laundry-care': '/themes/essa_chemicals/hero-bleach.jpg',
  laundry: '/themes/essa_chemicals/hero-bleach.jpg',
  'personal-care': '/themes/essa_chemicals/hero-handwash.jpg',
  'hand-wash': '/themes/essa_chemicals/hero-handwash.jpg',
  bleach: '/themes/essa_chemicals/hero-bleach.jpg',
  'dish-wash': '/themes/essa_chemicals/hero-cleaning.jpg',
};

const DEFAULT_BANNER_CYCLE = [
  '/themes/essa_chemicals/hero-cleaning.jpg',
  '/themes/essa_chemicals/hero-handwash.jpg',
  '/themes/essa_chemicals/hero-bleach.jpg',
] as const;

export type CategoryBlockItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
  imageUrl: string | null;
};

export type CategoryBlocksProps = {
  /** Pre-fetched categories from the homepage server component. */
  categories?: Category[] | CategoryTreeItem[];
  /** Max tiles to show (default 6). */
  limit?: number;
  title?: string;
  subtitle?: string;
  /** Homepage uses h1 when the hero slide has no visible title. */
  headingLevel?: 'h1' | 'h2';
};

function pickRoots(
  categories: Array<Category | CategoryTreeItem>,
  limit: number,
): Array<Category | CategoryTreeItem> {
  const roots = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  if (roots.length > 0) return roots.slice(0, limit);
  return [...categories]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .slice(0, limit);
}

function fallbackBannerForSlug(slug: string, index: number): string {
  const mapped = CATEGORY_BANNER_FALLBACKS[slug.toLowerCase()];
  if (mapped) return mapped;
  return DEFAULT_BANNER_CYCLE[index % DEFAULT_BANNER_CYCLE.length];
}

function customBannerFromCategory(category: Category | CategoryTreeItem): string | null {
  const raw =
    (typeof category.bannerImageUrl === 'string' && category.bannerImageUrl.trim()) ||
    (typeof category.imageUrl === 'string' && category.imageUrl.trim()) ||
    '';
  if (!raw) return null;
  return resolveImageUrl(raw) || raw;
}

async function resolveCoverImage(
  category: Category | CategoryTreeItem,
  index: number,
): Promise<string | null> {
  // 1) Admin-uploaded / API banner takes priority
  const custom = customBannerFromCategory(category);
  if (custom) return custom;

  // 2) First product image in the category
  try {
    const data = await fetchProductList({
      page: 1,
      limit: 1,
      category: category.id || category.slug,
    });
    const product = data?.data?.[0];
    const image = product?.images?.find((i) => i.isPrimary) ?? product?.images?.[0];
    const fromProduct = resolveImageUrl(image?.url);
    if (fromProduct) return fromProduct;
  } catch {
    /* fall through to static banners */
  }

  // 3) Slug-mapped theme fallbacks
  return fallbackBannerForSlug(category.slug, index);
}

async function loadCategories(
  provided: CategoryBlocksProps['categories'],
  limit: number,
): Promise<Array<Category | CategoryTreeItem>> {
  if (provided && provided.length > 0) {
    return pickRoots(provided, limit);
  }

  const tree = await fetchCategoryTree();
  if (tree.length > 0) return pickRoots(tree, limit);

  const flat = await fetchAllCategories();
  return pickRoots(flat, limit);
}

/**
 * Featured Categories Grid — homepage band under the hero.
 * Entire tile is a Next.js Link to `/categories/[slug]`.
 */
export async function CategoryBlocks({
  categories: provided,
  limit = 6,
  title = 'Featured categories',
  subtitle = 'Shop by collection',
  headingLevel = 'h2',
}: CategoryBlocksProps) {
  const roots = await loadCategories(provided, limit);
  if (roots.length === 0) return null;

  const blocks: CategoryBlockItem[] = await Promise.all(
    roots.map(async (cat, index) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      productCount: cat.productCount,
      imageUrl: await resolveCoverImage(cat, index),
    })),
  );

  const colClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  const HeadingTag = headingLevel === 'h1' ? 'h1' : 'h2';

  return (
    <section
      className="category-blocks space-y-6 sm:space-y-8"
      data-home-section="featured_categories"
      aria-labelledby="category-blocks-heading"
    >
      <div className="text-center">
        {subtitle ? (
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        <HeadingTag
          id="category-blocks-heading"
          className={`font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-[1.75rem] ${
            subtitle ? 'mt-2.5' : ''
          }`}
        >
          {title}
        </HeadingTag>
      </div>

      <div className={`grid gap-6 sm:gap-7 lg:gap-8 ${colClass}`}>
        {blocks.map((block, index) => {
          const href = `/categories/${block.slug}`;
          return (
            <Link
              key={block.id}
              href={href}
              className="category-blocks__card group flex h-full min-w-0 flex-col overflow-hidden border border-border/60 bg-card shadow-[var(--shadow-product-card)] transition-[border-color,box-shadow,transform] duration-300 hover:border-border hover:shadow-md"
            >
              {/* Fixed 4:3 media — object-cover keeps framing consistent across 3-col desktop */}
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
                {block.imageUrl ? (
                  <StorefrontImage
                    src={block.imageUrl}
                    alt={categoryImageAlt(block.name)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    // First card is the mobile LCP image; don't lazy-load the top row.
                    priority={index < 2}
                    quality={75}
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-background"
                    aria-hidden
                  />
                )}
              </div>

              {/* Text sits below the image — never overlapping the visual */}
              <div className="flex flex-1 flex-col gap-1.5 p-4 sm:gap-2 sm:p-5">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-[var(--navbar-link-hover,var(--primary-hover))] sm:text-lg">
                  {block.name}
                </h3>
                {block.description?.trim() ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {block.description.trim()}
                  </p>
                ) : block.productCount != null && block.productCount > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {block.productCount} {block.productCount === 1 ? 'product' : 'products'}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Explore the collection</p>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-transform duration-300 group-hover:translate-x-0.5 sm:text-xs">
                  Shop Now
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
