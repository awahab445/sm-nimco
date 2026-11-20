import type { Category, Product } from '@/lib/api-client';
import { isOwnBrandName } from '@/lib/brands/brand-config';
import { COMPANY_STATEMENT } from '@/lib/company-profile';
import { STORE_NAME } from '@/lib/config';
import { APP_CURRENCY } from '@/lib/currency';
import { absoluteUrl, getSiteUrl, plainText } from '@/lib/seo';
import { resolveImageUrl } from '@/lib/resolve-image-url';

export type JsonLdObject = Record<string, unknown>;

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

/** Normalize product FAQ payloads for FAQPage schema. */
export function asFaqList(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const rec = item as Record<string, unknown>;
      const question = String(rec.question ?? '').trim();
      const answer = String(rec.answer ?? '').trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((x): x is FaqItem => Boolean(x));
}

/** Primary product image (isPrimary first, then position). */
export function primaryProductImage(product: Product | null | undefined) {
  if (!product?.images?.length) return null;
  const sorted = [...product.images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.position ?? 0) - (b.position ?? 0);
  });
  return sorted[0] ?? null;
}

type NestedCategory = {
  id?: string;
  name?: string;
  slug?: string;
  category?: { id?: string; name?: string; slug?: string | null };
};

/** Resolve the first linked category from a product payload (flat or nested Prisma shape). */
export function primaryProductCategory(
  product: Product | null | undefined,
): { id: string; name: string; slug?: string } | null {
  const first = product?.categories?.[0] as NestedCategory | undefined;
  if (!first) return null;

  const nested = first.category;
  if (nested?.id || nested?.name || nested?.slug) {
    const id = String(nested.id ?? first.id ?? '').trim();
    const name = String(nested.name ?? '').trim();
    const slug = nested.slug?.trim() || undefined;
    if (!id && !name && !slug) return null;
    return { id: id || slug || name, name: name || 'Category', slug };
  }

  const id = String(first.id ?? '').trim();
  const name = String(first.name ?? '').trim();
  const slug = first.slug?.trim() || undefined;
  if (!id && !name && !slug) return null;
  return { id: id || slug || name, name: name || 'Category', slug };
}

export function buildBreadcrumbListLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Home → optional category ancestors → leaf. */
export function buildCategoryBreadcrumbItems(
  category: Category,
  ancestors: Category[] = [],
): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
  for (const ancestor of ancestors) {
    if (!ancestor.slug) continue;
    trail.push({
      name: ancestor.h1Title?.trim() || ancestor.name,
      path: `/categories/${ancestor.slug}`,
    });
  }
  trail.push({
    name: category.h1Title?.trim() || category.name,
    path: `/categories/${category.slug}`,
  });
  return trail;
}

/** Home → Category → Product (falls back to Products when no category). */
export function buildProductBreadcrumbItems(
  product: Product,
  category?: { name: string; slug?: string } | null,
): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
  if (category?.slug) {
    trail.push({
      name: category.name,
      path: `/categories/${category.slug}`,
    });
  } else if (category?.name) {
    trail.push({ name: category.name, path: '/products' });
  } else {
    trail.push({ name: 'Products', path: '/products' });
  }
  trail.push({
    name: product.name,
    path: `/products/${product.slug}`,
  });
  return trail;
}

/** Stable `@id` so Product / Brand nodes can reference the store as manufacturer. */
export function organizationId(): string {
  return `${getSiteUrl()}/#organization`;
}

/** Admin-managed contact data for the Organization node (all optional). */
export type OrganizationProfile = {
  sameAs?: string[];
  /** Digits-only, country code first (site-config `whatsappNumber`). */
  whatsappNumber?: string | null;
};

export function buildOrganizationLd(profile: OrganizationProfile = {}): JsonLdObject {
  const siteUrl = getSiteUrl();
  const address = process.env.NEXT_PUBLIC_STORE_ADDRESS?.trim();
  const phone = profile.whatsappNumber?.replace(/\D/g, '');
  const sameAs = [...new Set((profile.sameAs ?? []).map((u) => u.trim()).filter(Boolean))];

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId(),
    name: STORE_NAME,
    url: siteUrl,
    logo: absoluteUrl('/logo.png'),
    description: COMPANY_STATEMENT,
    ...(address ? { address } : undefined),
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    ...(phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'sales',
            telephone: `+${phone}`,
            areaServed: 'PK',
            availableLanguage: ['en', 'ur'],
          },
        }
      : undefined),
    ...(sameAs.length ? { sameAs } : undefined),
  };
}

export function buildWebSiteLd(): JsonLdObject {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: STORE_NAME,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/products')}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** The product's `attributes.brand` (either casing), trimmed; '' when untagged. */
export function productBrand(attributes: Record<string, unknown> | null | undefined): string {
  const value = attributes?.brand ?? attributes?.Brand;
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Plain-text product attributes (brand excluded) as name/value rows.
 * Feeds both the PDP specifications table and JSON-LD `additionalProperty`, so the two always match.
 */
export function productSpecs(
  attributes: Record<string, unknown> | null | undefined,
): Array<{ name: string; value: string }> {
  return Object.entries(attributes ?? {})
    .filter(
      ([key, value]) =>
        key.toLowerCase() !== 'brand' &&
        (typeof value === 'string' || typeof value === 'number') &&
        String(value).trim(),
    )
    .map(([key, value]) => ({ name: key, value: String(value).trim() }));
}

export function buildProductLd(product: Product): JsonLdObject {
  const image = primaryProductImage(product);
  const imagePath = resolveImageUrl(image?.url);
  const price = Number(product.basePrice);
  const description =
    plainText(product.metaDescription) ||
    plainText(product.shortDescription) ||
    plainText(product.description) ||
    product.name;
  const category = primaryProductCategory(product);
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const inStock = product.status === 'active';
  const attributes = product.attributes ?? {};
  const brandAttr = productBrand(attributes);
  // Only claim manufacturer when the brand is explicitly ours; third-party brands are sold, not made.
  const ownProduct = isOwnBrandName(brandAttr);
  const specs = productSpecs(attributes).map((s) => ({ '@type': 'PropertyValue', ...s }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name: product.name,
    sku: product.sku,
    productID: product.id,
    description,
    // Untagged products get no brand: falling back to the store name labelled other makers' goods as ours.
    ...(brandAttr ? { brand: { '@type': 'Brand', name: brandAttr } } : undefined),
    ...(ownProduct
      ? { manufacturer: { '@type': 'Organization', '@id': organizationId(), name: STORE_NAME } }
      : undefined),
    ...(specs.length ? { additionalProperty: specs } : undefined),
    url: productUrl,
    ...(imagePath ? { image: absoluteUrl(imagePath) } : undefined),
    ...(category?.name ? { category: category.name } : undefined),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: APP_CURRENCY,
      price: Number.isFinite(price) ? price.toFixed(2) : String(product.basePrice ?? '0'),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', '@id': organizationId(), name: STORE_NAME },
    },
  };
}

export function buildFaqPageLd(faqs: FaqItem[]): JsonLdObject | null {
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildCollectionPageLd(category: Category): JsonLdObject {
  const pageName = category.h1Title?.trim() || category.name;
  const description =
    plainText(category.metaDescription) || plainText(category.description);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageName,
    description,
    url: absoluteUrl(`/categories/${category.slug}`),
  };
}

/** Walk parentId chain from a flat category list (root → … → leaf, excluding leaf). */
export function categoryAncestors(
  category: Category,
  all: Category[],
): Category[] {
  const byId = new Map(all.map((c) => [c.id, c]));
  const ancestors: Category[] = [];
  const seen = new Set<string>([category.id]);
  let parentId = category.parentId ?? null;

  while (parentId) {
    if (seen.has(parentId)) break;
    seen.add(parentId);
    const parent = byId.get(parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    parentId = parent.parentId ?? null;
  }

  return ancestors;
}

export function buildBrandLd(input: {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  /** Only the store's own range links to it as parent; third-party brands are distributed, not owned. */
  ownBrand?: boolean;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: input.name,
    url: absoluteUrl(`/brand/${input.slug}`),
    description: plainText(input.description) || undefined,
    ...(input.logoUrl
      ? { logo: absoluteUrl(resolveImageUrl(input.logoUrl) || input.logoUrl) }
      : undefined),
    ...(input.ownBrand
      ? {
          parentOrganization: {
            '@type': 'Organization',
            '@id': organizationId(),
            name: STORE_NAME,
            url: getSiteUrl(),
          },
        }
      : undefined),
  };
}

export function buildBrandBreadcrumbItems(brand: {
  name: string;
  slug: string;
}): BreadcrumbItem[] {
  return [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: brand.name, path: `/brand/${brand.slug}` },
  ];
}

export function buildBlogPostingLd(input: {
  title: string;
  slug: string;
  description?: string | null;
  contentHtml?: string | null;
  coverImage?: string | null;
  publishedAt: string;
  updatedAt?: string | null;
  authorName: string;
}): JsonLdObject {
  const url = absoluteUrl(`/blogs/${input.slug}`);
  const imagePath = input.coverImage
    ? resolveImageUrl(input.coverImage) || input.coverImage
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: plainText(input.description) || plainText(input.contentHtml),
    url,
    mainEntityOfPage: url,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt || input.publishedAt,
    author: {
      '@type': 'Organization',
      name: input.authorName || STORE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: STORE_NAME,
      url: getSiteUrl(),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png'),
      },
    },
    ...(imagePath ? { image: absoluteUrl(imagePath) } : undefined),
  };
}

export function buildBlogBreadcrumbItems(post: {
  title: string;
  slug: string;
}): BreadcrumbItem[] {
  return [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blogs' },
    { name: post.title, path: `/blogs/${post.slug}` },
  ];
}
