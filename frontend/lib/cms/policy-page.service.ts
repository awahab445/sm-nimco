import { unstable_noStore as noStore } from 'next/cache';
import { pagesApi } from '@/lib/api-client';
import {
  POLICY_PAGE_DEFAULTS,
  type PolicyPageContent,
  type PolicyPageSlug,
} from '@/lib/cms/policy-pages';

export async function getPolicyPageBySlug(slug: PolicyPageSlug): Promise<PolicyPageContent> {
  noStore();
  const defaults = POLICY_PAGE_DEFAULTS[slug];

  try {
    const page = await pagesApi.getBySlug(slug);
    const contentHtml = page.contentHtml?.trim();
    if (contentHtml) {
      return {
        title: page.title?.trim() || defaults.title,
        slug,
        excerpt: page.excerpt ?? defaults.excerpt,
        metaTitle: page.metaTitle ?? page.title ?? defaults.metaTitle,
        metaDescription: page.metaDescription ?? page.excerpt ?? defaults.metaDescription,
        contentHtml,
        updatedAt: page.updatedAt,
      };
    }
  } catch {
    /* fall through to defaults */
  }

  return defaults;
}
