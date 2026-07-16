import type { CartItem, CheckoutItem, Product } from '@/lib/api-client';
import type { Ga4Item } from './types';

function toNumber(value: string | number | undefined | null): number {
  if (value == null) return 0;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
}

/** Detect DB UUIDs so we never send them as Meta catalog content_ids. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isCatalogUuid(value: string | null | undefined): boolean {
  return Boolean(value && UUID_RE.test(value.trim()));
}

/**
 * Meta catalog `id` is always a SKU (product.sku for simple, variant.sku for variants).
 * Never send internal UUIDs as content_ids — that tanks catalog match rate.
 * Returns '' when no SKU is available (callers should filter empties).
 */
export function catalogRetailerId(options: {
  variantSku?: string | null;
  productSku?: string | null;
  /** Only used if it is NOT a UUID (legacy non-UUID retailer ids). */
  fallbackId?: string | null;
}): string {
  const variantSku = options.variantSku?.trim();
  if (variantSku && !isCatalogUuid(variantSku)) return variantSku;
  const productSku = options.productSku?.trim();
  if (productSku && !isCatalogUuid(productSku)) return productSku;
  const fallback = options.fallbackId?.trim();
  if (fallback && !isCatalogUuid(fallback)) return fallback;
  return '';
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
  const sku = line.sku?.trim();
  return {
    item_id: sku && !isCatalogUuid(sku) ? sku : '',
    item_name: line.name,
    price: toNumber(line.unitPrice),
    quantity: line.quantity ?? 1,
  };
}

export function sumItemValue(items: Ga4Item[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
