'use client';

import type { Product } from '@/lib/api-client';
import { useStoreThemePreset } from '@/lib/store-theme-context';
import { SmNimcoProductCard } from '@/components/themes/sm-nimco/product-card';
import { ProductCard } from '@/components/product/product-card';

export { getVariantForCart } from '@/lib/product-cart-variant';

type StorefrontProductCardProps = {
  product: Product;
  availableQuantity?: number;
  availabilityByVariant?: Record<string, number>;
  layout?: 'grid' | 'list';
  badge?: string;
};

/** Theme-aware product card: SM Nimco skin vs default storefront card. */
export function StorefrontProductCard({
  product,
  availableQuantity,
  availabilityByVariant,
  layout = 'grid',
  badge,
}: StorefrontProductCardProps) {
  const storeTheme = useStoreThemePreset();

  if (storeTheme === 'sm_nimco') {
    return (
      <SmNimcoProductCard
        product={product}
        availableQuantity={availableQuantity}
        availabilityByVariant={availabilityByVariant}
        badge={badge}
      />
    );
  }

  return (
    <ProductCard
      product={product}
      availableQuantity={availableQuantity}
      layout={layout}
    />
  );
}
