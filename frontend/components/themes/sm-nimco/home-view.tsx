import {
  fetchFeaturedCategories,
  fetchInventoryAvailability,
  fetchProductList,
} from '@/lib/catalog/catalog.server';
import { getVariantForCart } from '@/lib/product-cart-variant';
import type { Product } from '@/lib/api-client';
import { SmNimcoHero } from './hero';
import { SmNimcoStoreFeatures } from './store-features';
import { SmNimcoCategoriesBanner } from './categories-banner';
import { SmNimcoProductCatalogue } from './product-catalogue';

const FEATURED_PRODUCT_LIMIT = 8;
const FEATURED_CATEGORY_LIMIT = 5;

function collectVariantIds(products: Product[]): string[] {
  const ids = new Set<string>();
  for (const product of products) {
    if (product.variants?.length) {
      for (const variant of product.variants) ids.add(variant.id);
      continue;
    }
    const fallback = getVariantForCart(product);
    if (fallback) ids.add(fallback.id);
  }
  return [...ids];
}

/**
 * SM NIMCO storefront homepage — hero, value props, categories, and featured products.
 */
export async function SmNimcoHomeView() {
  const [featuredCategories, productList] = await Promise.all([
    fetchFeaturedCategories(),
    fetchProductList({ page: 1, limit: FEATURED_PRODUCT_LIMIT }),
  ]);

  const categories = featuredCategories.slice(0, FEATURED_CATEGORY_LIMIT);

  const products = productList?.data ?? [];
  const variantIds = collectVariantIds(products);
  const availability =
    variantIds.length > 0 ? await fetchInventoryAvailability(variantIds) : {};

  return (
    <div className="min-w-0 bg-[var(--brand-bg-light,#faf8f5)]">
      <SmNimcoHero />
      <SmNimcoStoreFeatures />
      <SmNimcoCategoriesBanner categories={categories} />
      <SmNimcoProductCatalogue products={products} availability={availability} />
    </div>
  );
}
