import { listBlogPosts } from '@/lib/blog/blog.server';
import { listBrands } from '@/lib/brands/brand-config';
import { fetchBundleDeals } from '@/lib/deals/deals.server';
import {
  fetchAllCategories,
  fetchAllProductSlugs,
  fetchStorefrontNavigation,
} from '@/lib/catalog/catalog.server';
import { STOREFRONT_RESERVED_SLUGS } from '@/lib/cms/cms-nav';
import { absoluteUrl } from '@/lib/seo';

const CORE_PATHS = [
  '/',
  '/products',
  '/deals',
  '/blogs',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-conditions',
  '/shipping-returns',
  '/track-order',
] as const;

type SitemapRow = {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isoDay(value: unknown, fallback: Date): string {
  const date =
    value instanceof Date ? value : value ? new Date(String(value)) : fallback;
  const valid = Number.isFinite(date.getTime()) ? date : fallback;
  return valid.toISOString().slice(0, 10);
}

function locFor(path: string): string | null {
  const clean = path.trim();
  if (!clean) return null;
  try {
    const url = new URL(absoluteUrl(clean));
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    // URL.href adds a trailing slash on the origin; the homepage canonical does not.
    if (url.pathname === '/' && !url.search && !url.hash) return url.origin;
    return url.href;
  } catch {
    return null;
  }
}

function row(
  path: string,
  extra: Omit<SitemapRow, 'loc'>,
): SitemapRow | null {
  const loc = locFor(path);
  if (!loc) return null;
  return { loc, ...extra };
}

async function listAllBlogPosts() {
  const posts: Array<{
    slug: string;
    updatedAt?: string | null;
    publishedAt?: string | null;
    createdAt: string;
  }> = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= 10) {
    const res = await listBlogPosts({ page, limit: 100 }, 3600);
    if (!res.data.length) break;
    posts.push(...res.data);
    totalPages = res.meta?.totalPages ?? page;
    page += 1;
  }

  return posts;
}

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

function withBudget<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

export async function collectSitemapRows(): Promise<SitemapRow[]> {
  const now = new Date();
  const daily = {
    lastmod: isoDay(now, now),
    changefreq: 'daily' as const,
  };

  const staticRows = CORE_PATHS.map((path) =>
    row(path, {
      ...daily,
      changefreq: path === '/' || path === '/products' || path === '/blogs' || path === '/deals'
        ? 'daily'
        : path === '/track-order'
          ? 'monthly'
          : 'yearly',
      priority:
        path === '/'
          ? '1.0'
          : path === '/products'
            ? '0.9'
            : path === '/blogs' || path === '/deals'
              ? '0.8'
              : path === '/track-order'
                ? '0.4'
                : '0.3',
    }),
  ).filter((entry): entry is SitemapRow => Boolean(entry));

  try {
    const [productsResult, categoriesResult, dealsResult, blogsResult, navResult] =
      await withBudget(
        Promise.allSettled([
          fetchAllProductSlugs(10, 3600),
          fetchAllCategories(3600),
          fetchBundleDeals(3600),
          listAllBlogPosts(),
          fetchStorefrontNavigation(3600),
        ]),
        14_000,
        [
          { status: 'fulfilled' as const, value: [] },
          { status: 'fulfilled' as const, value: [] },
          { status: 'fulfilled' as const, value: [] },
          { status: 'fulfilled' as const, value: [] },
          { status: 'fulfilled' as const, value: null },
        ],
      );

    const products = settled(productsResult, []);
    const categories = settled(categoriesResult, []);
    const deals = settled(dealsResult, []);
    const blogs = settled(blogsResult, []);
    const navigation = settled(navResult, null);

    const productRows = products
      .map((product) =>
        row(`/products/${product.slug}`, {
          lastmod: isoDay(product.updatedAt, now),
          changefreq: 'daily',
          priority: '0.9',
        }),
      )
      .filter((entry): entry is SitemapRow => Boolean(entry));

    const categoryRows = categories
      .filter((category) => Boolean(category.slug))
      .map((category) =>
        row(`/categories/${category.slug}`, {
          lastmod: isoDay(now, now),
          changefreq: 'weekly',
          priority: '0.7',
        }),
      )
      .filter((entry): entry is SitemapRow => Boolean(entry));

    const dealRows = deals
      .map((deal) =>
        row(`/deals/${deal.slug}`, {
          lastmod: isoDay(now, now),
          changefreq: 'weekly',
          priority: '0.7',
        }),
      )
      .filter((entry): entry is SitemapRow => Boolean(entry));

    const brandRows = listBrands()
      .map((brand) =>
        row(`/brand/${brand.slug}`, {
          lastmod: isoDay(now, now),
          changefreq: 'weekly',
          priority: '0.75',
        }),
      )
      .filter((entry): entry is SitemapRow => Boolean(entry));

    const blogRows = blogs
      .map((post) =>
        row(`/blogs/${post.slug}`, {
          lastmod: isoDay(post.updatedAt || post.publishedAt || post.createdAt, now),
          changefreq: 'daily',
          priority: '0.8',
        }),
      )
      .filter((entry): entry is SitemapRow => Boolean(entry));

    const seen = new Set<string>([
      ...CORE_PATHS,
      ...categories.map((category) => `/categories/${category.slug}`),
      ...listBrands().map((brand) => `/brand/${brand.slug}`),
    ]);

    const cmsRows = (navigation?.header ?? [])
      .map((item) => {
        const href = item.href?.trim().split('?')[0]?.split('#')[0] ?? '';
        if (!href.startsWith('/') || href.startsWith('/api') || href.startsWith('/admin')) {
          return null;
        }
        const slug = href.replace(/^\/+/, '').split('/')[0]?.toLowerCase() ?? '';
        if (STOREFRONT_RESERVED_SLUGS.has(slug) || seen.has(href)) return null;
        seen.add(href);
        return row(href, {
          lastmod: isoDay(now, now),
          changefreq: 'monthly',
          priority: '0.5',
        });
      })
      .filter((entry): entry is SitemapRow => Boolean(entry));

    return [
      ...staticRows,
      ...cmsRows,
      ...brandRows,
      ...blogRows,
      ...categoryRows,
      ...productRows,
      ...dealRows,
    ];
  } catch (error) {
    console.error('[sitemap] Falling back to static routes', error);
    return staticRows;
  }
}

export function renderSitemapXml(rows: SitemapRow[]): string {
  const body = rows
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}
