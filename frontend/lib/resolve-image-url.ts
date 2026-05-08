const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export function resolveImageUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('/uploads/')) {
    return `${API_BASE_URL}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${API_BASE_URL}/${trimmed}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const isFrontendPort = parsed.port === '3000' || parsed.port === '';
      if (isLocalhost && isFrontendPort && parsed.pathname.startsWith('/uploads/')) {
        return `${API_BASE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}
