import { unstable_noStore as noStore } from 'next/cache';
import { fetchApi } from '@/lib/api-client';

export type CmsStorefrontPage = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentHtml?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
};

export async function getCmsPageBySlug(slug: string): Promise<CmsStorefrontPage | null> {
  noStore();
  const cleanSlug = slug.trim();
  if (!cleanSlug) return null;

  try {
    return await fetchApi<CmsStorefrontPage>(`/cms/pages/${encodeURIComponent(cleanSlug)}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
  } catch {
    return null;
  }
}

/** Storefront URL path for a published CMS page (admin slug → `/{slug}`). */
export function cmsPageHref(slug: string): string {
  const s = slug.trim();
  if (!s) return '/';
  return `/${encodeURIComponent(s)}`;
}
