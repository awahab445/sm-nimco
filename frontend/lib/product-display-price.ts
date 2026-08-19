import type { Product, ProductVariant } from '@/lib/api-client';

export function parseProductPrice(value: string | number | undefined | null): number {
  if (value == null) return 0;
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Lowest variant price for PLP cards; falls back to base price when no variants. */
export function getProductListDisplayPrice(product: Product): number {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    const prices = variants
      .map((v) => parseProductPrice(v.price))
      .filter((p) => p > 0);
    if (prices.length > 0) return Math.min(...prices);
  }
  return parseProductPrice(product.basePrice);
}

/** Variant compare-at price when explicitly set on the variant (not product base price). */
export function getVariantCompareAtPrice(
  variant: ProductVariant | null | undefined,
): number | null {
  if (!variant) return null;

  const direct = (variant as ProductVariant & { compareAtPrice?: string | number })
    .compareAtPrice;
  if (direct != null) {
    const n = parseProductPrice(direct);
    if (n > 0) return n;
  }

  const attrs = variant.attributes ?? {};
  const fromAttrs = attrs.compareAtPrice ?? attrs.compare_at_price;
  if (fromAttrs != null) {
    const n = parseProductPrice(fromAttrs as string | number);
    if (n > 0) return n;
  }

  return null;
}

export function getCheapestVariantChipId(
  variants: Array<{ id: string; price: string | number }>,
): string | null {
  if (!variants.length) return null;
  let bestId: string | null = null;
  let bestPrice = Infinity;
  for (const v of variants) {
    const p = parseProductPrice(v.price);
    if (p > 0 && p < bestPrice) {
      bestPrice = p;
      bestId = v.id;
    }
  }
  return bestId ?? variants[0]?.id ?? null;
}
