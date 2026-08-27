import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { fetchProductBySlug } from '@/lib/catalog/catalog.server';
import { APP_CURRENCY } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import {
  absoluteUrl,
  buildPageMetadata,
  plainText,
} from '@/lib/seo';
import { ProductDetailClient } from './product-detail-client';

type Props = { params: Promise<{ slug: string }> };

function primaryImage(product: Awaited<ReturnType<typeof fetchProductBySlug>>) {
  if (!product?.images?.length) return null;
  const sorted = [...product.images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.position ?? 0) - (b.position ?? 0);
  });
  return sorted[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/\s+/g, '-');
  const product = await fetchProductBySlug(slug);
  if (!product) {
    return { title: 'Product not found', robots: { index: false, follow: false } };
  }

  const image = primaryImage(product);
  const imagePath = resolveImageUrl(image?.url);

  return buildPageMetadata({
    title: product.seoTitle?.trim() || product.name,
    description:
      plainText(product.metaDescription) ||
      plainText(product.shortDescription) ||
      plainText(product.description) ||
      `Buy ${product.name} online.`,
    path: `/products/${product.slug}`,
    image: imagePath,
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/\s+/g, '-');
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const image = primaryImage(product);
  const imagePath = resolveImageUrl(image?.url);
  const price = Number(product.basePrice);
  const description =
    plainText(product.metaDescription) ||
    plainText(product.shortDescription) ||
    plainText(product.description);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description,
    url: absoluteUrl(`/products/${product.slug}`),
    ...(imagePath
      ? {
          image: absoluteUrl(imagePath),
        }
      : undefined),
    ...(product.categories?.[0]?.name
      ? { category: product.categories[0].name }
      : undefined),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: APP_CURRENCY,
      price: Number.isFinite(price) ? price.toFixed(2) : String(product.basePrice),
      availability:
        product.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: absoluteUrl('/products'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: absoluteUrl(`/products/${product.slug}`),
      },
    ],
  };

  const faqEntries = parseProductFaqs(product.faqs);
  const faqLd =
    faqEntries.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqEntries.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <JsonLd data={faqLd ? [jsonLd, breadcrumbLd, faqLd] : [jsonLd, breadcrumbLd]} />
      <ProductDetailClient />
    </>
  );
}

/** Parse "Question | Answer" lines from product FAQs field. */
function parseProductFaqs(raw: string | null | undefined): Array<{ question: string; answer: string }> {
  if (!raw?.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.indexOf('|');
      if (sep <= 0) return null;
      const question = line.slice(0, sep).trim();
      const answer = line.slice(sep + 1).trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => item != null);
}
