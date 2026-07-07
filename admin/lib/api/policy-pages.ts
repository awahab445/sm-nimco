import { fetchApi } from '../api-client';

export const POLICY_PAGE_SLUGS = [
  'shipping-returns',
  'privacy-policy',
  'terms-conditions',
] as const;

export type PolicyPageSlug = (typeof POLICY_PAGE_SLUGS)[number];

export type PolicyPage = {
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

export type PolicyPageInput = {
  title: string;
  contentHtml?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export const POLICY_PAGE_LABELS: Record<PolicyPageSlug, string> = {
  'shipping-returns': 'Shipping & Returns',
  'privacy-policy': 'Privacy Policy',
  'terms-conditions': 'Terms & Conditions',
};

export const policyPagesApi = {
  getBySlug: (slug: PolicyPageSlug) =>
    fetchApi<PolicyPage>(`/admin/pages/${encodeURIComponent(slug)}`),

  saveBySlug: (slug: PolicyPageSlug, body: PolicyPageInput) =>
    fetchApi<PolicyPage>(`/admin/pages/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};
