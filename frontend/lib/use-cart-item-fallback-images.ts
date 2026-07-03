'use client';

import { useEffect, useState } from 'react';
import { productApi, type CartItem } from '@/lib/api-client';
import { resolveImageUrl } from '@/lib/resolve-image-url';

/** Fetch primary product images when cart lines omit productImage. */
export function useCartItemFallbackImages(items: CartItem[]): Record<string, string> {
  const [fallbackProductImages, setFallbackProductImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const missingProductIds = Array.from(
      new Set(
        items
          .filter(
            (item) =>
              !item.productImage &&
              !!item.productId &&
              !fallbackProductImages[item.productId],
          )
          .map((item) => item.productId),
      ),
    );
    if (missingProductIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      missingProductIds.map(async (productId) => {
        try {
          const product = await productApi.getProductById(productId);
          const primary = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
          return { productId, image: primary?.url ?? '' };
        } catch {
          return { productId, image: '' };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setFallbackProductImages((prev) => {
        const next = { ...prev };
        for (const r of results) {
          next[r.productId] = r.image;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [items, fallbackProductImages]);

  return fallbackProductImages;
}

export function getCartItemImageUrl(
  item: CartItem,
  fallbackProductImages: Record<string, string>,
): string | undefined {
  return (
    resolveImageUrl(item.productImage) ??
    resolveImageUrl(fallbackProductImages[item.productId])
  );
}
