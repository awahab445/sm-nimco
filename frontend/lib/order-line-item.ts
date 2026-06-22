import { formatVariantAttributes } from '@/lib/format-variant-attributes';
import { resolveImageUrl } from '@/lib/resolve-image-url';

export interface OrderLineItemLike {
  name: string;
  sku?: string;
  quantity?: number;
  attributes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  productId?: string;
  productName?: string | null;
  productImage?: string | null;
  variantLabel?: string | null;
  product?: { name?: string; image?: string | null } | null;
  variant?: { product?: { name?: string }; image?: string | null } | null;
}

export function getOrderItemProductName(item: OrderLineItemLike): string {
  const metaName =
    item.metadata && typeof item.metadata.productName === 'string'
      ? item.metadata.productName
      : null;

  return (
    item.productName ||
    item.product?.name ||
    item.variant?.product?.name ||
    metaName ||
    item.name ||
    'Product'
  );
}

export function getOrderItemVariantSubtitle(item: OrderLineItemLike): string | null {
  const attrLines = formatVariantAttributes(
    (item.attributes as Record<string, unknown> | undefined) ?? undefined,
  );
  if (attrLines.length > 0) {
    return attrLines.join(' · ');
  }

  const metaLabel =
    item.metadata && typeof item.metadata.variantLabel === 'string'
      ? item.metadata.variantLabel
      : null;
  const explicitLabel =
    typeof item.variantLabel === 'string' && item.variantLabel.trim()
      ? item.variantLabel
      : null;

  const productName = getOrderItemProductName(item);
  const legacyVariantName = item.name && item.name !== productName ? item.name : null;

  return explicitLabel || metaLabel || legacyVariantName;
}

export function getOrderItemImageUrl(item: OrderLineItemLike): string | null {
  const metaImage =
    item.metadata && typeof item.metadata.productImage === 'string'
      ? item.metadata.productImage
      : null;

  const raw =
    item.productImage ||
    item.product?.image ||
    item.variant?.image ||
    metaImage;

  return raw ? resolveImageUrl(String(raw)) ?? null : null;
}
