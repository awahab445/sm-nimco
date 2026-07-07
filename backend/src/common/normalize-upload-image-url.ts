/**
 * Normalize CMS/upload image URLs to same-origin `/uploads/...` paths for the storefront.
 * Strips environment-specific hosts (e.g. api.messa-chemicals.local, localhost:3000).
 */
export function normalizeCmsUploadImageUrl(value?: string | null): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';

  if (trimmed.startsWith('/uploads/')) return trimmed;
  if (trimmed.startsWith('uploads/')) return `/${trimmed}`;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/uploads/')) {
        return parsed.pathname;
      }
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}
