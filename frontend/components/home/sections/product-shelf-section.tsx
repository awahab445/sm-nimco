import Link from 'next/link';
import { StorefrontProductCard } from '@/components/product/storefront-product-card';
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
        <Link
          href={viewAllHref}
          className={`mt-3.5 inline-block text-xs font-medium uppercase tracking-[0.14em] ${storefrontUi.link}`}
        >
          View all
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-14 text-center text-sm text-muted-foreground">
          No products in this shelf yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {products.map((product) => {
            const variant = getVariantForCart(product);
            return (
              <StorefrontProductCard
                key={product.id}
                product={product}
                availableQuantity={variant ? availability[variant.id] : undefined}
                availabilityByVariant={availability}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
