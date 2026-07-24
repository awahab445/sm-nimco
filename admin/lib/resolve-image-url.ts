const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

/** Same-origin fallback when an upload asset is missing or fails to load. */
export const PRODUCT_IMAGE_PLACEHOLDER = '/placeholder.svg';

/**
 * Resolve product/CMS image URLs for the admin panel.
 * Relative `/uploads/...` paths are prefixed with the backend origin.
 */
export function resolveImageUrl(value?: string | null): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `${API_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}
