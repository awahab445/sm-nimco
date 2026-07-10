import Link from 'next/link';
import { ProductCard } from '@/components/product/product-card';
import type { ProductShelfSource } from '@/lib/cms/home-page-types';
import {
  fetchInventoryAvailability,
  fetchProductList,
} from '@/lib/catalog/catalog.server';
import { getVariantForCart } from '@/lib/product-cart-variant';
import { storefrontUi } from '@/lib/storefront-ui';

interface ProductShelfSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  source: ProductShelfSource;
}

export async function ProductShelfSection({
  title,
  subtitle,
  viewAllHref,
  source,
}: ProductShelfSectionProps) {
  const page = source.page ?? 1;
  const limit = source.limit;
  const query =
    source.kind === 'category'
      ? { page, limit, category: source.categoryId }
      : { page, limit };

  const data = await fetchProductList(query);
  const products = data?.data ?? [];
  const variantIds = products
    .map((p) => getVariantForCart(p)?.id)
    .filter((id): id is string => Boolean(id));
  const availability =
    variantIds.length > 0 ? await fetchInventoryAvailability(variantIds) : {};

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        <Link href={viewAllHref} className={`shrink-0 text-sm ${storefrontUi.link}`}>
          View all →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/50 py-12 text-center text-muted-foreground">
          No products in this shelf yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const variant = getVariantForCart(product);
            return (
              <ProductCard
                key={product.id}
                product={product}
                availableQuantity={variant ? availability[variant.id] : undefined}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
