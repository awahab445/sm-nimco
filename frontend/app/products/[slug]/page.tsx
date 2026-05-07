'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productApi, inventoryApi, type Product, type ProductVariant } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { DEFAULT_CURRENCY } from '@/lib/config';
import { storefrontUi } from '@/lib/storefront-ui';
import { resolveImageUrl } from '@/lib/resolve-image-url';

type VariantOptionKey = 'weight' | 'packType' | 'flavor' | 'quantityPack';

const OPTION_LABELS: Record<VariantOptionKey, string> = {
  weight: 'Weight',
  packType: 'Pack Type',
  flavor: 'Flavor',
  quantityPack: 'Quantity Packs',
};

const OPTION_ORDER: VariantOptionKey[] = ['weight', 'packType', 'flavor', 'quantityPack'];

function formatPrice(value: string | number, currency = DEFAULT_CURRENCY): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(isNaN(n) ? 0 : n);
}

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

function extractVariantOptions(attrs: Record<string, unknown> | undefined): Partial<Record<VariantOptionKey, string>> {
  if (!attrs) return {};
  const weight = toText(attrs.weight);
  const packType = toText(attrs.packType) ?? toText(attrs.pack_type) ?? toText(attrs.packtype);
  const flavor = toText(attrs.flavor);
  const quantityPack =
    toText(attrs.quantityPack) ??
    toText(attrs.quantity_pack) ??
    toText(attrs.quantityPacks) ??
    toText(attrs.quantity_packs);
  return { weight, packType, flavor, quantityPack };
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Partial<Record<VariantOptionKey, string>>>({});
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [availability, setAvailability] = useState<Record<string, number>>({});

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
          setSelectedOptions(extractVariantOptions(first?.attributes as Record<string, unknown> | undefined));
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
  const activeVariants = variants.filter((v) => v);
  const optionsByKey = OPTION_ORDER.reduce((acc, key) => {
    const values = Array.from(
      new Set(
        activeVariants
          .map((v) => extractVariantOptions(v.attributes as Record<string, unknown> | undefined)[key])
          .filter((v): v is string => !!v),
      ),
    );
    acc[key] = values;
    return acc;
  }, {} as Record<VariantOptionKey, string[]>);

  useEffect(() => {
    if (!currentVariant) return;
    const opts = extractVariantOptions(currentVariant.attributes as Record<string, unknown> | undefined);
    setSelectedOptions((prev) => ({ ...prev, ...opts }));
  }, [currentVariant?.id]);

  const matchesSelectedOptions = (variant: ProductVariant, options: Partial<Record<VariantOptionKey, string>>) => {
    const variantOptions = extractVariantOptions(variant.attributes as Record<string, unknown> | undefined);
    for (const key of OPTION_ORDER) {
      const selected = options[key];
      if (!selected) continue;
      if (variantOptions[key] !== selected) return false;
    }
    return true;
  };

  const handleOptionSelect = (key: VariantOptionKey, value: string) => {
    const nextOptions = { ...selectedOptions, [key]: value };
    setSelectedOptions(nextOptions);
    const exact = variants.find((v) => matchesSelectedOptions(v, nextOptions));
    if (exact) {
      setSelectedVariant(exact);
      return;
    }
    const fallback = variants.find((v) => {
      const vo = extractVariantOptions(v.attributes as Record<string, unknown> | undefined);
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

  const activeImage =
    orderedGalleryImages.find((img) => img.id === selectedImageId) ??
    orderedGalleryImages[0];
  const imageUrl = resolveImageUrl(activeImage?.url);

  const handleAddToCart = async () => {
    const v = selectedVariant ?? variants[0];
    if (!product || !v || adding) return;
    setAdding(true);
    try {
      await addToCart(product.id, v.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      router.push('/cart');
    } catch {
      // Error in store
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
          <div className="group aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted sm:aspect-square">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={activeImage?.alt ?? product.name}
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          </div>
          {orderedGalleryImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {orderedGalleryImages.map((img) => {
                const thumbUrl = resolveImageUrl(img.url);
                const active = img.id === activeImage?.id;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageId(img.id)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-colors ${
                      active ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/60'
                    }`}
                    aria-label={`View image ${img.id}`}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={img.alt ?? product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No image
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
                {OPTION_ORDER.filter((k) => optionsByKey[k].length > 0).map((key) => (
                  <div key={key}>
                    <p className="block text-sm font-medium text-foreground/90">{OPTION_LABELS[key]}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {optionsByKey[key].map((value) => {
                        const active = selectedOptions[key] === value;
                        return (
                          <button
                            key={`${key}-${value}`}
                            type="button"
                            onClick={() => handleOptionSelect(key, value)}
                            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                              active
                                ? 'border-primary bg-primary text-primary-foreground'
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
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Variant</label>
                  <select
                    value={currentVariant?.id ?? ''}
                    onChange={(e) => {
                      const v = variants.find((x) => x.id === e.target.value);
                      setSelectedVariant(v ?? null);
                    }}
                    className={`mt-1 block w-full max-w-xs py-2 pl-3 pr-10 text-base ${storefrontUi.select}`}
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name || v.sku} — {formatPrice(v.price)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
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
                className="w-20 rounded-md border border-input bg-card px-2 py-1.5 text-center text-foreground"
              />
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
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || !hasVariant || !currentVariant || !inStock}
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {added ? 'Added to cart' : adding ? 'Adding…' : hasVariant ? (inStock ? 'Add to cart' : 'Out of stock') : 'Unavailable'}
            </button>
            {added && (
              <Link
                href="/cart"
                className={`text-sm font-medium ${storefrontUi.link}`}
              >
                View cart →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
