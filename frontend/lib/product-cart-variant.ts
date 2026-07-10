import type { Product } from '@/lib/api-client';

/** Variant to use for add-to-cart: first real variant, or synthetic for simple product with no variants. */
export function getVariantForCart(
  product: Product,
): { id: string; productId: string; price: number } | null {
  const variants = product.variants;
  if (variants?.length) {
    const v = variants[0];
    const price = typeof v.price === 'string' ? parseFloat(v.price) : v.price;
    return { id: v.id, productId: product.id, price: isNaN(Number(price)) ? 0 : Number(price) };
  }
  if (product.type === 'simple' || !product.type) {
    const price =
      typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice;
    return { id: product.id, productId: product.id, price: isNaN(Number(price)) ? 0 : Number(price) };
  }
  return null;
}
