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
  const cleanSlug = slug.trim();
  if (!cleanSlug) return null;

  try {
    return await fetchApi<CmsStorefrontPage>(`/cms/pages/${encodeURIComponent(cleanSlug)}`);
  } catch {
    return null;
  }
}
