'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productApi, inventoryApi, type Product, type ProductVariant } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { getInlineStockAlertMessage } from '@/lib/cart-errors';
import { formatPrice } from '@/lib/currency';
import { storefrontUi } from '@/lib/storefront-ui';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { ProductStockAlert } from '@/components/product/product-stock-alert';
import { trackViewItem } from '@/lib/analytics/events';

type OptionDefinition = { code: string; label: string; values: string[] };

/** Normalize variant from API (handles camelCase or snake_case and price as number/string/object). */
function normalizeVariant(raw: Record<string, unknown>): ProductVariant | null {
  const id = (raw.id ?? raw.variantId) as string | undefined;
  const productId = (raw.productId ?? raw.product_id) as string | undefined;
  const sku = (raw.sku) as string | undefined;
  let price = raw.price ?? raw.basePrice ?? raw.base_price;
  if (price == null) return null;
  if (typeof price === 'object' && price !== null && typeof (price as { toNumber?: () => number }).toNumber === 'function') {
    price = (price as { toNumber: () => number }).toNumber();
  } else if (typeof price === 'object' && price !== null && 'toString' in price) {
    price = parseFloat((price as { toString: () => string }).toString());
  }
  if (!id || !productId) return null;
  return {
    id,
    productId,
    sku: sku ?? '',
    name: (raw.name as string) ?? undefined,
    price: typeof price === 'number' ? price : typeof price === 'string' ? price : Number(price),
    attributes: (raw.attributes as Record<string, unknown>) ?? undefined,
    position: (raw.position as number) ?? undefined,
  };
}

/** Ensure product has a variants array. For simple products with no variants, add a synthetic variant (product as variant). */
function normalizeProduct(raw: Record<string, unknown>): Product {
  const variantsRaw = raw.variants ?? raw.product_variants ?? raw.productVariants;
  const arr = Array.isArray(variantsRaw) ? variantsRaw : [];
  let variants = arr
    .map((v) => normalizeVariant(typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {}))
    .filter((v): v is ProductVariant => v !== null);

  const id = (raw.id as string) ?? '';
  const type = (raw.type as string) ?? 'simple';
  const basePrice = raw.basePrice ?? raw.base_price ?? 0;
  const basePriceNum = typeof basePrice === 'number' ? basePrice : typeof basePrice === 'string' ? parseFloat(basePrice) : Number(basePrice);

  if (variants.length === 0 && (type === 'simple' || !type)) {
    variants = [
      {
        id,
        productId: id,
        sku: (raw.sku as string) ?? '',
        name: (raw.name as string) ?? undefined,
        price: basePriceNum,
        attributes: {},
      },
    ];
  }

  return {
    id,
    sku: (raw.sku as string) ?? '',
    name: (raw.name as string) ?? '',
    slug: (raw.slug as string) ?? '',
    type,
    description: (raw.description as string) ?? null,
    shortDescription: (raw.shortDescription as string) ?? (raw.short_description as string) ?? null,
    basePrice: basePriceNum,
    status: (raw.status as string) ?? 'active',
    visibility: (raw.visibility as string) ?? undefined,
    variants,
    images: (raw.images as Product['images']) ?? undefined,
    categories: (raw.categories as Product['categories']) ?? undefined,
    createdAt: (raw.createdAt as string) ?? undefined,
    updatedAt: (raw.updatedAt as string) ?? undefined,
  };
}

function toUnknownRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toText(v: unknown): string | undefined {
  if (typeof v === 'string') {
    const t = v.trim();
    return t ? t : undefined;
  }
  return undefined;
}

function extractVariantOptions(variant: ProductVariant): Record<string, string> {
  if (variant.optionValues && variant.optionValues.length > 0) {
    const map: Record<string, string> = {};
    for (const ov of variant.optionValues) {
      map[ov.option.code] = ov.value.value;
    }
    return map;
  }
  const attrs = (variant.attributes as Record<string, unknown> | undefined) ?? {};
  const legacy = (attrs.optionValues as Record<string, unknown> | undefined) ?? {};
  const map: Record<string, string> = {};
  for (const [key, val] of Object.entries(legacy)) {
    const txt = toText(val);
    if (txt) map[key] = txt;
  }
  return map;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [stockAlert, setStockAlert] = useState<string | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    productApi
      .getProductBySlug(slug)
      .then((p) => {
        if (!cancelled) {
          const normalized = normalizeProduct(toUnknownRecord(p));
          setProduct(normalized);
          const first = normalized.variants?.[0] ?? null;
          setSelectedVariant(first);
          setSelectedOptions(first ? extractVariantOptions(first) : {});
          const variantIds = (normalized.variants ?? []).map((v) => v.id).filter(Boolean);
          if (variantIds.length > 0) {
            inventoryApi.getAvailability(variantIds).then((r) => {
              if (!cancelled) setAvailability(r.data);
            });
          } else {
            setAvailability({});
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Product not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const variants = product?.variants ?? [];
  const hasVariant = variants.length > 0;
  const currentVariant = selectedVariant ?? variants[0] ?? null;

  useEffect(() => {
    if (!product || !currentVariant) return;
    const price =
      typeof currentVariant.price === 'string'
        ? parseFloat(currentVariant.price)
        : Number(currentVariant.price);
    trackViewItem(product, {
      variantName: currentVariant.name,
      price: Number.isFinite(price) ? price : undefined,
    });
  }, [product, currentVariant?.id, currentVariant?.name, currentVariant?.price]);

  const activeVariants = variants.filter((v) => v);
  const optionDefinitions: OptionDefinition[] = (() => {
    if (product?.options && product.options.length > 0) {
      return product.options.map((po) => ({
        code: po.option.code,
        label: po.option.name,
        values: po.values
          .map((x) => x.value.value)
          .filter((v, i, arr) => !!v && arr.indexOf(v) === i),
      }));
    }
    const map = new Map<string, Set<string>>();
    for (const v of activeVariants) {
      const opts = extractVariantOptions(v);
      for (const [code, value] of Object.entries(opts)) {
        if (!map.has(code)) map.set(code, new Set<string>());
        map.get(code)?.add(value);
      }
    }
    return Array.from(map.entries()).map(([code, set]) => ({
      code,
      label: code.replace(/[_-]/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase()),
      values: Array.from(set),
    }));
  })();

  useEffect(() => {
    if (!currentVariant) return;
    const opts = extractVariantOptions(currentVariant);
    setSelectedOptions((prev) => ({ ...prev, ...opts }));
  }, [currentVariant?.id]);

  const matchesSelectedOptions = (variant: ProductVariant, options: Record<string, string>) => {
    const variantOptions = extractVariantOptions(variant);
    for (const def of optionDefinitions) {
      const selected = options[def.code];
      if (!selected) continue;
      if (variantOptions[def.code] !== selected) return false;
    }
    return true;
  };

  const handleOptionSelect = (key: string, value: string) => {
    const nextOptions = { ...selectedOptions, [key]: value };
    setSelectedOptions(nextOptions);
    const exact = variants.find((v) => matchesSelectedOptions(v, nextOptions));
    if (exact) {
      setSelectedVariant(exact);
      return;
    }
    const fallback = variants.find((v) => {
      const vo = extractVariantOptions(v);
      return vo[key] === value;
    });
    if (fallback) setSelectedVariant(fallback);
  };
  const currentVariantId = currentVariant?.id;
  const availableQty = currentVariantId !== undefined ? availability[currentVariantId] : undefined;
  const inStock = availableQty === undefined ? true : availableQty > 0;
  const allImages = product?.images ?? [];
  const variantImages = currentVariantId
    ? allImages.filter((img) => (img as { variantId?: string | null }).variantId === currentVariantId)
    : [];
  const productLevelImages = allImages.filter(
    (img) => !(img as { variantId?: string | null }).variantId,
  );
  const orderedGalleryImages = [...(variantImages.length > 0 ? variantImages : productLevelImages), ...productLevelImages]
    .filter((img, idx, arr) => arr.findIndex((x) => x.id === img.id) === idx)
    .sort((a, b) => {
      const primaryDelta = Number(Boolean((b as { isPrimary?: boolean }).isPrimary)) - Number(Boolean((a as { isPrimary?: boolean }).isPrimary));
      if (primaryDelta !== 0) return primaryDelta;
      return Number((a as { position?: number }).position ?? 0) - Number((b as { position?: number }).position ?? 0);
    });

  useEffect(() => {
    if (orderedGalleryImages.length === 0) {
      setSelectedImageId(null);
      return;
    }
    if (!selectedImageId || !orderedGalleryImages.some((img) => img.id === selectedImageId)) {
      setSelectedImageId(orderedGalleryImages[0].id);
    }
  }, [currentVariantId, product?.id, orderedGalleryImages.length]);

  useEffect(() => {
    setStockAlert(null);
  }, [currentVariantId, quantity]);

  const handleAddToCart = async () => {
    const v = selectedVariant ?? variants[0];
    if (!product || !v || adding) return;
    setAdding(true);
    setStockAlert(null);
    try {
      await addToCart(product.id, v.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      router.push('/cart');
    } catch (err) {
      const stockMessage = getInlineStockAlertMessage(err);
      setStockAlert(
        stockMessage ??
          (err instanceof Error && err.message.trim()
            ? err.message
            : 'Failed to add item to cart. Please try again.'),
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">
          {error ?? 'Product not found'}
        </div>
        <Link
          href="/products"
          className={`mt-4 inline-block text-sm font-medium ${storefrontUi.link}`}
        >
          ← Back to products
        </Link>
      </div>
    );
  }

  const price = currentVariant
    ? typeof currentVariant.price === 'string'
      ? parseFloat(currentVariant.price)
      : currentVariant.price
    : typeof product.basePrice === 'string'
      ? parseFloat(product.basePrice)
      : product.basePrice;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to products
      </Link>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        <div>
          <ProductImageGallery
            images={orderedGalleryImages}
            productName={product.name}
            selectedId={selectedImageId}
            onSelect={setSelectedImageId}
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-lg font-medium text-foreground/90">
            {formatPrice(price)}
          </p>
          {product.shortDescription && (
            <p className="mt-4 text-muted-foreground">
              {product.shortDescription}
            </p>
          )}
          {product.description && (
            <div className="mt-4 text-muted-foreground">
              <h2 className="text-sm font-semibold text-foreground">
                Description
              </h2>
              <p className="mt-1 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {variants.length > 1 && (
            <div className="mt-6">
              <div className="space-y-4">
                {optionDefinitions
                  .filter((def) => def.values.length > 0)
                  .map((def) => (
                  <div key={def.code}>
                    <p className="block text-sm font-medium text-foreground/90">{def.label}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {def.values.map((value) => {
                        const active = selectedOptions[def.code] === value;
                        return (
                          <button
                            key={`${def.code}-${value}`}
                            type="button"
                            onClick={() => handleOptionSelect(def.code, value)}
                            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                              active
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-input bg-card text-foreground hover:border-primary/60'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="qty" className="text-sm font-medium text-foreground/90">
                  Quantity
                </label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 rounded-md border border-input bg-card px-2 py-2 text-center text-foreground"
                />
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || !hasVariant || !currentVariant || !inStock}
                  className={storefrontUi.btnPrimaryInline}
                >
                  {added ? 'Added to cart' : adding ? 'Adding…' : hasVariant ? (inStock ? 'Add to cart' : 'Out of stock') : 'Unavailable'}
                </button>
                {stockAlert && <ProductStockAlert message={stockAlert} />}
              </div>
              {added && (
                <Link
                  href="/cart"
                  className={`text-sm font-medium ${storefrontUi.link}`}
                >
                  View cart →
                </Link>
              )}
            </div>
            {!hasVariant && (
              <p className="text-sm text-warning">
                No variants available. Add at least one variant in the admin to enable add to cart.
              </p>
            )}
            {hasVariant && currentVariant && availableQty !== undefined && availableQty === 0 && (
              <p className="text-sm font-medium text-warning">
                Stock unavailable for this product.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
