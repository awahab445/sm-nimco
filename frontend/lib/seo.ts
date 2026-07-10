import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/config';

const DEFAULT_DESCRIPTION = `${STORE_NAME} — shop quality products with secure checkout and order tracking.`;

/** Public storefront origin (no trailing slash). Used for canonicals, OG, sitemap. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      return fromEnv.replace(/\/+$/, '');
    }
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/+$/, '')}`;
  }
  return 'http://localhost:3001';
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') return `${base}/`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Strip HTML tags and collapse whitespace for meta descriptions. */
export function plainText(value?: string | null, maxLength = 160): string | undefined {
  if (!value) return undefined;
  const text = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function imageAlt(
  image?: { alt?: string | null; altText?: string | null } | null,
  fallback = '',
): string {
  const fromImage = image?.alt?.trim() || image?.altText?.trim();
  return fromImage || fallback;
}

type BuildMetadataInput = {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  type?: 'website' | 'article';
  /** When true, skip the root title template (e.g. home page). */
  absoluteTitle?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path = '/',
  image,
  noIndex = false,
  type = 'website',
  absoluteTitle = false,
}: BuildMetadataInput): Metadata {
  const desc = plainText(description) || DEFAULT_DESCRIPTION;
  const url = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type,
      siteName: STORE_NAME,
      title,
      description: desc,
      url,
      ...(ogImage
        ? { images: [{ url: ogImage, alt: title }] }
        : undefined),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description: desc,
      ...(ogImage ? { images: [ogImage] } : undefined),
    },
  };
}

export function rootMetadata(): Metadata {
  const description = DEFAULT_DESCRIPTION;
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: STORE_NAME,
      template: `%s | ${STORE_NAME}`,
    },
    description,
    applicationName: STORE_NAME,
    openGraph: {
      type: 'website',
      siteName: STORE_NAME,
      title: STORE_NAME,
      description,
      url: siteUrl,
      locale: 'en_PK',
    },
    twitter: {
      card: 'summary_large_image',
      title: STORE_NAME,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function noIndexMetadata(title: string, description?: string): Metadata {
  return buildPageMetadata({
    title,
    description: description ?? `${title} — ${STORE_NAME}`,
    noIndex: true,
  });
}
