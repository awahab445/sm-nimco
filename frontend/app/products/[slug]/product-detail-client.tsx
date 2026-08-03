'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productApi, inventoryApi, type Product, type ProductVariant } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { getInlineStockAlertMessage } from '@/lib/cart-errors';
import { formatPrice } from '@/lib/currency';
import { storefrontUi } from '@/lib/storefront-ui';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { ProductStockAlert } from '@/components/product/product-stock-alert';
import { RelatedProductsShelf } from '@/components/product/related-products-shelf';
import { WishlistToggleButton } from '@/components/product/wishlist-toggle-button';
import { PdpLowStockUrgency, PdpTrustReassurance } from '@/components/product/pdp-conversion-boosters';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { trackCustomizeProduct, trackViewItem } from '@/lib/analytics/events';

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

function isColorOption(code: string, label: string): boolean {
  const s = `${code} ${label}`.toLowerCase();
  return /\bcolou?r\b/.test(s);
}

/** Best-effort CSS color from option value labels (for swatch circles). */
function swatchColor(value: string): string | null {
  const v = value.trim().toLowerCase().replace(/\s+/g, '');
  const named: Record<string, string> = {
    black: '#222',
    white: '#f5f5f5',
    red: '#c62828',
    blue: '#1565c0',
    navy: '#1a237e',
    green: '#2e7d32',
    grey: '#9e9e9e',
    gray: '#9e9e9e',
    beige: '#d7ccc8',
    brown: '#6d4c41',
    pink: '#ec407a',
    purple: '#7b1fa2',
    yellow: '#f9a825',
    orange: '#ef6c00',
    cream: '#fff8e1',
  };
  if (named[v]) return named[v];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())) return value.trim();
  return null;
}

function QuantityStepper({
  id,
  quantity,
  setQuantity,
  className,
}: {
  id: string;
  quantity: number;
  setQuantity: (n: number | ((q: number) => number)) => void;
  className?: string;
}) {
  /* Kalles qty: 120×40 pill, solid #222 border, no mid dividers */
  return (
    <div
      className={`relative inline-flex h-10 w-[8.5rem] shrink-0 items-center justify-center border border-foreground ${className ?? ''}`}
      style={{ borderRadius: 'var(--radius-button, 3rem)' }}
    >
      <button
        type="button"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        className="absolute inset-y-0 left-0 flex w-8 items-center justify-center pl-1.5 text-foreground transition-colors hover:text-[var(--primary-hover,#56cfe1)]"
        aria-label="Decrease quantity"
      >
        <svg width="10" height="2" viewBox="0 0 10 2" aria-hidden className="fill-current">
          <path d="M10 0v2H0V0z" />
        </svg>
      </button>
      <input
        id={id}
        type="number"
        min={1}
        inputMode="numeric"
        value={quantity}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          setQuantity(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
        }}
        className="h-full w-12 appearance-none bg-transparent text-center text-base font-semibold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => setQuantity((q) => q + 1)}
        className="absolute inset-y-0 right-0 flex w-8 items-center justify-center pr-1.5 text-foreground transition-colors hover:text-[var(--primary-hover,#56cfe1)]"
        aria-label="Increase quantity"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="fill-current">
          <path d="M6 4h4v2H6v4H4V6H0V4h4V0h2v4z" fillRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export function ProductDetailClient() {
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
  /** Hide mobile sticky ATC while the buy-box ATC is on screen (no stacked duplicate). */
  const [buyBoxAtcInView, setBuyBoxAtcInView] = useState(true);
  const buyBoxAtcRef = useRef<HTMLButtonElement>(null);

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

  const requiresOptionSelection = optionDefinitions.some((def) => def.values.length > 0);

  /** Exact match: every selected option must equal the variant; skip unset keys. */
  const matchesSelectedOptions = (variant: ProductVariant, options: Record<string, string>) => {
    const variantOptions = extractVariantOptions(variant);
    for (const def of optionDefinitions) {
      const selected = options[def.code];
      if (!selected) continue;
      if (variantOptions[def.code] !== selected) return false;
    }
    return true;
  };

  /** True when a value remains reachable given the other selected options. */
  const isOptionValueAvailable = (optionCode: string, value: string) => {
    const candidate = { ...selectedOptions, [optionCode]: value };
    return variants.some((v) => matchesSelectedOptions(v, candidate));
  };

  const findExactVariant = (options: Record<string, string>) => {
    const allChosen =
      !requiresOptionSelection ||
      optionDefinitions.every((def) => def.values.length === 0 || Boolean(options[def.code]));
    if (!allChosen) return null;
    return variants.find((v) => matchesSelectedOptions(v, options)) ?? null;
  };

  const currentVariant =
    findExactVariant(selectedOptions) ??
    (!requiresOptionSelection ? selectedVariant ?? variants[0] ?? null : null);

  useEffect(() => {
    if (!product || !currentVariant) return;
    const price =
      typeof currentVariant.price === 'string'
        ? parseFloat(currentVariant.price)
        : Number(currentVariant.price);
    trackViewItem(product, {
      variantName: currentVariant.name,
      price: Number.isFinite(price) ? price : undefined,
      variantSku: currentVariant.sku,
    });
  }, [product, currentVariant]);

  useEffect(() => {
    if (!currentVariant) return;
    const opts = extractVariantOptions(currentVariant);
    setSelectedOptions((prev) => ({ ...prev, ...opts }));
  }, [currentVariant]);

  const handleOptionSelect = (key: string, value: string) => {
    if (!isOptionValueAvailable(key, value)) return;
    const nextOptions = { ...selectedOptions, [key]: value };
    setSelectedOptions(nextOptions);
    // Exact combination only — never fall back to a loosely related variant.
    const exact = findExactVariant(nextOptions);
    setSelectedVariant(exact);
    if (product && exact) {
      const price =
        typeof exact.price === 'string' ? parseFloat(exact.price) : Number(exact.price);
      trackCustomizeProduct(product, {
        variantSku: exact.sku,
        variantName: exact.name,
        price: Number.isFinite(price) ? price : undefined,
        optionKey: key,
        optionValue: value,
      });
    }
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
  }, [currentVariantId, product?.id, orderedGalleryImages, selectedImageId]);

  useEffect(() => {
    setStockAlert(null);
  }, [currentVariantId, quantity]);

  useEffect(() => {
    const el = buyBoxAtcRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setBuyBoxAtcInView(entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: '0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product?.id]);

  const handleAddToCart = async () => {
    const v = findExactVariant(selectedOptions) ?? (!requiresOptionSelection ? variants[0] : null);
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
      <div className="mx-auto max-w-7xl pb-28 pt-0 sm:pb-20 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mb-4 px-4 pt-6 sm:mb-6 sm:px-6 sm:pt-8 lg:px-0 lg:pt-0">
          <div className="h-3 w-40 animate-pulse bg-muted/30" />
        </div>
        <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-14">
          <div className="aspect-square w-full animate-pulse bg-muted/20" />
          <div className="mt-6 space-y-4 px-4 sm:px-6 lg:mt-0 lg:px-0 lg:pt-2">
            <div className="h-6 w-2/3 animate-pulse bg-muted/40" />
            <div className="h-4 w-24 animate-pulse bg-muted/30" />
            <div className="h-3 w-full animate-pulse bg-muted/25" />
            <div className="h-3 w-4/5 animate-pulse bg-muted/20" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
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

  const baseNum =
    typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : Number(product.basePrice);
  const priceNum = typeof price === 'string' ? parseFloat(price) : Number(price);
  const onSale = Number.isFinite(baseNum) && Number.isFinite(priceNum) && priceNum < baseNum;
  const variantFullySelected = Boolean(findExactVariant(selectedOptions));
  const atcDisabled =
    adding || !hasVariant || !currentVariant || !inStock || (requiresOptionSelection && !variantFullySelected);
  const atcLabel = added
    ? 'Added to cart'
    : adding
      ? 'Adding…'
      : !hasVariant
        ? 'Unavailable'
        : requiresOptionSelection && !variantFullySelected
          ? 'Select options'
          : inStock
            ? 'Add to cart'
            : 'Out of stock';

  const primaryImage =
    orderedGalleryImages.find((i) => i.id === selectedImageId) ?? orderedGalleryImages[0];
  const stickyThumb = resolveImageUrl(primaryImage?.url);
  const categoryId = product.categories?.[0]?.id ?? null;

  return (
    <>
      {/*
        Mobile: no horizontal page padding so the gallery is edge-to-edge (Kalles).
        Breadcrumb + buy box keep their own gutters; desktop restores lg:px-8.
      */}
      <div
        className={`mx-auto max-w-7xl pt-0 lg:px-8 lg:pb-16 lg:pt-8 ${
          buyBoxAtcInView ? 'pb-20 sm:pb-16' : 'pb-28 sm:pb-20'
        }`}
      >
        <nav
          className="mb-4 px-4 pt-6 text-[13px] text-muted-foreground sm:mb-6 sm:px-6 sm:pt-8 lg:mb-6 lg:px-0 lg:pt-0"
          aria-label="Breadcrumb"
        >
          <Link href="/products" className="transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))]">
            Products
          </Link>
          <span className="mx-2 text-border" aria-hidden>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-14 xl:gap-16">
          <div className="min-w-0 w-full">
            <ProductImageGallery
              images={orderedGalleryImages}
              productName={product.name}
              selectedId={selectedImageId}
              onSelect={setSelectedImageId}
            />
          </div>

          <div className="mt-6 px-4 sm:px-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start lg:px-0">
            {/* Kalles PDP title: 16px / semibold / body font / no uppercase */}
            <h1 className="font-sans text-base font-semibold leading-snug tracking-normal text-foreground">
              {product.name}
            </h1>

            <div className="mt-2.5 flex flex-wrap items-baseline gap-2.5">
              <p
                className={`text-[1.375rem] font-normal leading-none ${
                  onSale ? 'text-product-sale-price' : 'text-product-price'
                }`}
              >
                {formatPrice(price)}
              </p>
              {onSale ? (
                <p className="text-[1.375rem] font-normal leading-none text-product-price/55 line-through">
                  {formatPrice(baseNum)}
                </p>
              ) : null}
            </div>

            {product.shortDescription?.trim() ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {product.shortDescription.trim()}
              </p>
            ) : null}

            {variants.length > 1 && (
              <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
                {optionDefinitions
                  .filter((def) => def.values.length > 0)
                  .map((def) => {
                    const colorMode = isColorOption(def.code, def.label);
                    return (
                      <div key={def.code}>
                        <p className="text-sm font-semibold text-foreground">
                          {def.label}
                          {selectedOptions[def.code] ? (
                            <span className="ml-2 font-normal text-muted-foreground">
                              {selectedOptions[def.code]}
                            </span>
                          ) : null}
                        </p>
                        <div className={`mt-2.5 flex flex-wrap ${colorMode ? 'gap-2.5' : 'gap-2'}`}>
                          {def.values.map((value) => {
                            const active = selectedOptions[def.code] === value;
                            const available = isOptionValueAvailable(def.code, value);
                            const color = colorMode ? swatchColor(value) : null;
                            if (color) {
                              return (
                                <button
                                  key={`${def.code}-${value}`}
                                  type="button"
                                  onClick={() => handleOptionSelect(def.code, value)}
                                  disabled={!available}
                                  title={available ? value : `${value} (unavailable)`}
                                  aria-label={value}
                                  aria-pressed={active}
                                  aria-disabled={!available}
                                  className={`h-[2.4rem] w-[2.4rem] rounded-full border p-0.5 transition-all ${
                                    !available
                                      ? 'cursor-not-allowed opacity-35'
                                      : active
                                        ? 'border-2 border-foreground'
                                        : 'border border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] hover:border-foreground'
                                  }`}
                                >
                                  <span
                                    className="block h-full w-full rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                </button>
                              );
                            }
                            return (
                              <button
                                key={`${def.code}-${value}`}
                                type="button"
                                onClick={() => handleOptionSelect(def.code, value)}
                                disabled={!available}
                                aria-disabled={!available}
                                className={`min-w-[3rem] rounded-[0.3rem] border px-4 py-1.5 text-center text-sm transition-all duration-300 ${
                                  !available
                                    ? 'cursor-not-allowed border-border/40 text-muted-foreground/50 line-through opacity-50'
                                    : active
                                      ? 'border-primary bg-primary text-primary-foreground'
                                      : 'border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-transparent text-foreground hover:border-foreground'
                                }`}
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Buy box: row1 qty + wishlist | row2 full-width orange ATC */}
            <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-3.5">
              <div className="flex flex-nowrap items-center gap-2.5">
                <QuantityStepper id="qty" quantity={quantity} setQuantity={setQuantity} />
                <WishlistToggleButton
                  productId={product.id}
                  variant="pdp"
                  iconClassName="h-[1.125rem] w-[1.125rem]"
                />
              </div>

              <button
                ref={buyBoxAtcRef}
                type="button"
                onClick={handleAddToCart}
                disabled={atcDisabled}
                className="btn-pdp-atc h-10 w-full px-6 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {atcLabel}
              </button>

              <PdpLowStockUrgency availableQty={availableQty} />

              <PdpTrustReassurance />

              {added ? (
                <Link
                  href="/cart"
                  className={`block w-full text-center ${storefrontUi.btnSecondary} rounded-[var(--radius-button,0.25rem)] py-3`}
                >
                  View cart
                </Link>
              ) : null}

              {stockAlert ? <ProductStockAlert message={stockAlert} /> : null}

              {!hasVariant ? (
                <p className="text-sm text-warning">
                  No variants available. Add at least one variant in the admin to enable add to cart.
                </p>
              ) : null}
              {hasVariant && currentVariant && availableQty !== undefined && availableQty === 0 ? (
                <p className="text-sm font-medium text-warning">Stock unavailable for this product.</p>
              ) : null}
            </div>

            {product.description?.trim() ? (
              <details className="group mt-8 border-t border-border/60 sm:mt-10 [&>summary]:list-none [&>summary::-webkit-details-marker]:hidden" open>
                <summary className="flex cursor-pointer items-center justify-between gap-3 py-4 text-[15px] font-medium text-foreground transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))]">
                  <span>Description</span>
                  <span className="text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="pb-5 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {product.description.trim()}
                </div>
              </details>
            ) : null}
          </div>
        </div>
      </div>

      <RelatedProductsShelf productId={product.id} categoryId={categoryId} />

      {/* Mobile sticky ATC — only when buy-box ATC scrolled out of view */}
      <div
        className={`fixed inset-x-0 z-[95] border-t border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-background/95 px-3 py-2.5 shadow-[0_0_0.9rem_rgba(0,0,0,0.12)] backdrop-blur-[8px] transition-transform duration-200 md:px-4 lg:hidden ${
          buyBoxAtcInView ? 'pointer-events-none translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ bottom: 'calc(3.4375rem + var(--mobile-mini-cart-height, 0px) + env(safe-area-inset-bottom, 0px))' }}
        aria-hidden={buyBoxAtcInView}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 md:gap-4">
          {stickyThumb ? (
            <div className="relative hidden h-[3.25rem] w-[3.25rem] shrink-0 overflow-hidden rounded-full bg-muted md:block">
              <img src={stickyThumb} alt="" className="h-full w-full object-contain" />
            </div>
          ) : null}
          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
            <p className={`text-base ${onSale ? 'text-product-sale-price' : 'text-product-price'}`}>
              {formatPrice(price)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={atcDisabled || buyBoxAtcInView}
            tabIndex={buyBoxAtcInView ? -1 : undefined}
            className="btn-pdp-atc h-10 w-full min-w-0 flex-1 px-5 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[10rem] md:flex-none"
          >
            {added ? 'Added' : adding ? '…' : inStock ? 'Add to cart' : 'Sold out'}
          </button>
        </div>
      </div>
    </>
  );
}
