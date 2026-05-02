'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productApi, inventoryApi, type Product, type ProductVariant } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { DEFAULT_CURRENCY } from '@/lib/config';

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

export default function ProductDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
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
          const normalized = normalizeProduct(p as Record<string, unknown>);
          setProduct(normalized);
          const first = normalized.variants?.[0] ?? null;
          setSelectedVariant(first);
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
  const currentVariantId = currentVariant?.id;
  const availableQty = currentVariantId !== undefined ? availability[currentVariantId] : undefined;
  const inStock = availableQty === undefined ? true : availableQty > 0;
  const image = product?.images?.[0] ?? product?.images?.find((i) => i.isPrimary);
  const imageUrl = image?.url;

  const handleAddToCart = async () => {
    const v = selectedVariant ?? variants[0];
    if (!product || !v || adding) return;
    setAdding(true);
    try {
      await addToCart(product.id, v.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
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
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-zinc-600 dark:border-t-blue-400" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error ?? 'Product not found'}
        </div>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
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
        className="mb-6 inline-block text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Back to products
      </Link>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={image?.alt ?? product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-zinc-500">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-lg font-medium text-gray-700 dark:text-zinc-300">
            {formatPrice(price)}
          </p>
          {product.shortDescription && (
            <p className="mt-4 text-gray-600 dark:text-zinc-400">
              {product.shortDescription}
            </p>
          )}
          {product.description && (
            <div className="mt-4 text-gray-600 dark:text-zinc-400">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-50">
                Description
              </h2>
              <p className="mt-1 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {variants.length > 1 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Variant
              </label>
              <select
                value={currentVariant?.id ?? ''}
                onChange={(e) => {
                  const v = variants.find((x) => x.id === e.target.value);
                  setSelectedVariant(v ?? null);
                }}
                className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name || v.sku} — {formatPrice(v.price)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="qty" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Quantity
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-center dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            {!hasVariant && (
              <p className="text-sm text-amber-700 dark:text-amber-400">
                No variants available. Add at least one variant in the admin to enable add to cart.
              </p>
            )}
            {hasVariant && currentVariant && availableQty !== undefined && availableQty === 0 && (
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Stock unavailable for this product.
              </p>
            )}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || !hasVariant || !currentVariant || !inStock}
              className="rounded-md bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {added ? 'Added to cart' : adding ? 'Adding…' : hasVariant ? (inStock ? 'Add to cart' : 'Out of stock') : 'Unavailable'}
            </button>
            {added && (
              <Link
                href="/cart"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
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
