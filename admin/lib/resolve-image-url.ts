const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

/** Same-origin fallback when an upload asset is missing or fails to load. */
export const PRODUCT_IMAGE_PLACEHOLDER = '/placeholder.svg';

/**
 * Resolve product/CMS image URLs for the admin panel.
 * Relative `/uploads/...` paths are prefixed with the backend origin.
 * Absolute upload URLs on localhost (any port) are rewritten to the current API base
 * so images keep working after the backend port changes (e.g. 5000 → 3000).
 */
export function resolveImageUrl(value?: string | null): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (
        parsed.pathname.startsWith('/uploads/') &&
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
      ) {
        return `${API_BASE_URL}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  return `${API_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}
