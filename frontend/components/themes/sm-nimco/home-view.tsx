import Link from 'next/link';
import {
  fetchCategoryTree,
  fetchInventoryAvailability,
  fetchProductList,
} from '@/lib/catalog/catalog.server';
import { getVariantForCart } from '@/lib/product-cart-variant';
import { SmNimcoHero } from './hero';
import { SmNimcoCategoriesBanner } from './categories-banner';
import { SmNimcoMenuHighlights } from './menu-highlights';
import { SmNimcoProductCatalogue } from './product-catalogue';

/**
 * SM NIMCO & Sweets home layout — mirrors index7.html structure with live catalog data.
 */
export async function SmNimcoHomeView() {
  const [listRes, categories] = await Promise.all([
    fetchProductList({ page: 1, limit: 12 }),
    fetchCategoryTree(),
  ]);

  const products = listRes?.data ?? [];
  const variantIds = products
    .map((p) => getVariantForCart(p)?.id)
    .filter((id): id is string => Boolean(id));
  const availability =
    variantIds.length > 0 ? await fetchInventoryAvailability(variantIds) : {};

  const menuProducts = products.slice(0, 6);
  const catalogueProducts = products.slice(0, 8);
  const categoryCards = categories.slice(0, 4);

  return (
    <div className="min-w-0 bg-background">
      <SmNimcoHero />
      <SmNimcoCategoriesBanner categories={categoryCards} />
      <SmNimcoMenuHighlights products={menuProducts} />
      <SmNimcoProductCatalogue products={catalogueProducts} availability={availability} />

      <div className="mx-auto max-w-7xl px-4 pb-12 text-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-colors hover:bg-btn-hover hover:text-btn-hover-foreground"
        >
          Explore All Delights
        </Link>
      </div>
    </div>
  );
}
