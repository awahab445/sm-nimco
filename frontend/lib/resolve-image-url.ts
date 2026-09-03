import { SERVER_API_BASE_URL } from './api-base-url';
import type { ProductImage } from './api-client';

/** Same-origin fallback when an upload asset is missing or fails to load. */
export const PRODUCT_IMAGE_PLACEHOLDER = '/placeholder.svg';

function toUploadsPath(pathname: string): string | undefined {
  if (pathname.startsWith('/uploads/')) return pathname;
  if (pathname.startsWith('uploads/')) return `/${pathname}`;
  return undefined;
}

/**
 * Resolve a product/CMS image path for `<img>` / `next/image`.
 *
 * Upload assets are always returned as same-origin `/uploads/...` paths so
 * SSR and the client hydrate with identical `src` values. Next.js rewrites
 * those paths to `NEXT_PUBLIC_API_URL` (default http://localhost:3000). Absolute
 * non-upload URLs are left unchanged. Legacy absolute upload URLs that point at
 * an old API port (e.g. :5000) are normalized to `/uploads/...`.
 *
 * For Open Graph / JSON-LD absolute URLs, pass the result through `absoluteUrl()`.
 */
export function resolveImageUrl(imagePath?: string | null): string | undefined {
  if (!imagePath) return undefined;
  const trimmed = imagePath.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      const uploadsPath = toUploadsPath(parsed.pathname);
      // Strip host/port so Next rewrites `/uploads` to the current API origin.
      if (uploadsPath) return uploadsPath;
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const uploadsPath = toUploadsPath(trimmed);
  if (uploadsPath) return uploadsPath;

  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/** Absolute backend URL for an upload path (useful outside Next rewrites). */
export function absoluteUploadUrl(imagePath?: string | null): string | undefined {
  const resolved = resolveImageUrl(imagePath);
  if (!resolved) return undefined;
  if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
    return resolved;
  }
  if (resolved.startsWith('/uploads/')) {
    return `${SERVER_API_BASE_URL}${resolved}`;
  }
  return resolved;
}

/** Alias matching the storefront helper naming used in product cards. */
export function getProductImageUrl(imagePath?: string | null): string {
  return resolveImageUrl(imagePath) ?? PRODUCT_IMAGE_PLACEHOLDER;
}

/** True when `src` is an API upload asset (absolute or same-origin `/uploads`). */
export function isBackendAssetUrl(src: string): boolean {
  if (src.startsWith('/uploads/') || src.startsWith('uploads/')) return true;
  if (!src.startsWith('http://') && !src.startsWith('https://')) return false;
  try {
    const parsed = new URL(src);
    if (parsed.pathname.startsWith('/uploads/')) return true;
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
  for (const img of getProductImagesOrdered(images ?? [])) {
    const resolved = resolveImageUrl(img?.url);
    if (resolved && !srcs.includes(resolved)) {
      srcs.push(resolved);
    }
  }
  return srcs;
}
