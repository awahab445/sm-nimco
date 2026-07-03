/**
 * Normalize stored image URLs for storefront `<img src>`.
 * Upload assets are always served as same-origin `/uploads/...` paths;
 * Next.js rewrites those to the NestJS backend (see next.config.ts).
 */
export function resolveImageUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const uploadPath = extractUploadPath(trimmed);
  if (uploadPath) {
    return uploadPath;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

function extractUploadPath(value: string): string | null {
  if (value.startsWith('/uploads/')) {
    return value;
  }
  if (value.startsWith('uploads/')) {
    return `/${value}`;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith('/uploads/')) {
        return parsed.pathname;
      }
    } catch {
      return null;
    }
  }
  return null;
}
