import type { CartItem, CheckoutItem, Product } from '@/lib/api-client';
import type { Ga4Item } from './types';

function toNumber(value: string | number | undefined | null): number {
  if (value == null) return 0;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Meta catalog `id` is always a SKU (product.sku for simple, variant.sku for variants).
 * Never send internal UUIDs as content_ids — that tanks catalog match rate.
 */
export function catalogRetailerId(options: {
  variantSku?: string | null;
  productSku?: string | null;
  fallbackId?: string | null;
}): string {
  const variantSku = options.variantSku?.trim();
  if (variantSku) return variantSku;
  const productSku = options.productSku?.trim();
  if (productSku) return productSku;
  return options.fallbackId?.trim() || '';
}

export function productToGa4Item(
  product: Pick<Product, 'id' | 'sku' | 'name' | 'categories' | 'basePrice'>,
  options?: {
    /** Variant SKU — must match Meta catalog row `id`. */
    variantSku?: string;
    variantName?: string;
    price?: number;
    quantity?: number;
  },
): Ga4Item {
  const price = options?.price ?? toNumber(product.basePrice);
  return {
    item_id: catalogRetailerId({
      variantSku: options?.variantSku,
      productSku: product.sku,
      fallbackId: product.id,
    }),
    item_name: product.name,
    item_category: product.categories?.[0]?.name,
    item_variant: options?.variantName,
    price,
    quantity: options?.quantity ?? 1,
  };
}

export function cartItemToGa4Item(item: CartItem): Ga4Item {
  return {
    item_id: catalogRetailerId({
      variantSku: item.sku,
      productSku: item.productSku,
      fallbackId: item.productId,
    }),
    item_name: item.productName || item.variantName || 'Product',
    item_variant: item.variantName,
    price: toNumber(item.price),
    quantity: item.quantity,
  };
}

export function checkoutItemToGa4Item(item: CheckoutItem): Ga4Item {
  return {
    item_id: catalogRetailerId({
      variantSku: item.sku,
      productSku: item.productSku,
      fallbackId: item.productId,
    }),
    item_name: item.productName || item.variantName || 'Product',
    item_variant: item.variantName,
    price: toNumber(item.price),
    quantity: item.quantity,
  };
}

export function orderLineToGa4Item(line: {
  sku?: string;
  name: string;
  unitPrice?: number | string;
  quantity?: number;
}): Ga4Item {
  return {
    item_id: line.sku?.trim() || line.name,
    item_name: line.name,
    price: toNumber(line.unitPrice),
    quantity: line.quantity ?? 1,
  };
}

export function sumItemValue(items: Ga4Item[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
