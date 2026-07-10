import type { MetadataRoute } from 'next';
import { fetchBundleDeals } from '@/lib/deals/deals.server';
import {
  fetchAllCategories,
  fetchAllProductSlugs,
} from '@/lib/catalog/catalog.server';
import { absoluteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/products'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/deals'), lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/privacy-policy'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/terms-conditions'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/shipping-returns'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/track-order'), lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const [products, categories, deals] = await Promise.all([
    fetchAllProductSlugs(),
    fetchAllCategories(),
    fetchBundleDeals(),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${encodeURIComponent(product.slug)}`),
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      url: absoluteUrl(`/categories/${encodeURIComponent(category.slug)}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const dealRoutes: MetadataRoute.Sitemap = deals.map((deal) => ({
    url: absoluteUrl(`/deals/${encodeURIComponent(deal.slug)}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...dealRoutes];
}
