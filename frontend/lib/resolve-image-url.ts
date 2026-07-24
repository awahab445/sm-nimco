import { SERVER_API_BASE_URL } from './api-base-url';
import type { ProductImage } from './api-client';

/** Same-origin fallback when an upload asset is missing or fails to load. */
export const PRODUCT_IMAGE_PLACEHOLDER = '/placeholder.svg';

/**
 * Resolve a product/CMS image path for `<img>` / `next/image`.
 * Relative `/uploads/...` paths are prefixed with `NEXT_PUBLIC_API_URL`.
 */
export function resolveImageUrl(imagePath?: string | null): string | undefined {
  if (!imagePath) return undefined;
  const trimmed = imagePath.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Keep absolute uploads pointed at the configured API host (avoids stale hosts).
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/uploads/')) {
        return `${SERVER_API_BASE_URL}${parsed.pathname}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const baseUrl = SERVER_API_BASE_URL;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${baseUrl}${path}`;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/** Alias matching the storefront helper naming used in product cards. */
export function getProductImageUrl(imagePath?: string | null): string {
  return resolveImageUrl(imagePath) ?? PRODUCT_IMAGE_PLACEHOLDER;
}

/** True when `src` is an absolute URL served from the configured API origin. */
export function isBackendAssetUrl(src: string): boolean {
  if (!src.startsWith('http://') && !src.startsWith('https://')) return false;
  try {
    const parsed = new URL(src);
    const api = new URL(SERVER_API_BASE_URL);
    return parsed.origin === api.origin;
  } catch {
    return false;
  }
}

/** Primary first, then position ascending. */
export function getProductImagesOrdered(
  images?: ProductImage[] | null,
): ProductImage[] {
  if (!images?.length) return [];
  return [...images].sort((a, b) => {
    if (Boolean(a.isPrimary) !== Boolean(b.isPrimary)) {
      return a.isPrimary ? -1 : 1;
    }
    return (a.position ?? 0) - (b.position ?? 0);
  });
}

/** Resolved absolute/relative srcs for a product, deduped, primary first. */
export function getProductImageSrcs(images?: ProductImage[] | null): string[] {
  const srcs: string[] = [];
  for (const img of getProductImagesOrdered(images)) {
    const resolved = resolveImageUrl(img.url);
    if (resolved && !srcs.includes(resolved)) {
      srcs.push(resolved);
    }
  }
  return srcs;
}
