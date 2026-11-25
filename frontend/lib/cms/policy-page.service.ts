import { unstable_noStore as noStore } from 'next/cache';
import { pagesApi } from '@/lib/api-client';
import {
  buildPolicyPageDefault,
  type PolicyPageContent,
  type PolicyPageSlug,
} from '@/lib/cms/policy-pages';
import { getStoreFacts } from '@/lib/store-facts';

export async function getPolicyPageBySlug(slug: PolicyPageSlug): Promise<PolicyPageContent> {
  const defaults = buildPolicyPageDefault(slug, await getStoreFacts());

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
