import { NextResponse } from 'next/server';
import { fetchAllProductsForFeed } from '@/lib/catalog/catalog.server';
import { isOwnBrandName } from '@/lib/brands/brand-config';
import { STORE_NAME } from '@/lib/config';
import { APP_CURRENCY } from '@/lib/currency';
import { absoluteUrl, getSiteUrl, plainText } from '@/lib/seo';
import { primaryProductImage, productBrand } from '@/lib/seo/schemas';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import type { Product } from '@/lib/api-client';

export const revalidate = 300;

function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatMerchantPrice(value: string | number, currency = APP_CURRENCY || 'PKR'): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  const amount = Number.isFinite(n) ? n.toFixed(2) : '0.00';
  return `${amount} ${currency}`;
}

function availabilityForProduct(product: Product): 'in_stock' | 'out_of_stock' {
  return product.status === 'active' ? 'in_stock' : 'out_of_stock';
}

function mapProductToItem(product: Product): string | null {
  const id = (product.sku || product.id || '').trim();
  const title = product.name?.trim();
  const image = primaryProductImage(product);
  const imagePath = resolveImageUrl(image?.url);
  if (!id || !title || !imagePath) return null;

  const link = absoluteUrl(`/products/${product.slug}`);
  const imageLink = absoluteUrl(imagePath);
  const description =
    plainText(product.metaDescription, 5000) ||
    plainText(product.shortDescription, 5000) ||
    plainText(product.description, 5000) ||
    title;
  const price = formatMerchantPrice(product.basePrice);
  const availability = availabilityForProduct(product);
  const attributes = product.attributes ?? {};
  // Third-party products (Dettol, Viva, …) must carry their own brand, as in the Product JSON-LD.
  const brandAttr = String(attributes.brand ?? attributes.Brand ?? '').trim();
  const brand = brandAttr || STORE_NAME;
  const ownBrand = !brandAttr || isOwnBrandName(brandAttr);

  const lines = [
    '    <item>',
    `      <g:id>${escapeXml(id)}</g:id>`,
    `      <g:title>${escapeXml(title)}</g:title>`,
    `      <g:description>${escapeXml(description)}</g:description>`,
    `      <g:link>${escapeXml(link)}</g:link>`,
    `      <g:image_link>${escapeXml(imageLink)}</g:image_link>`,
    `      <g:price>${escapeXml(price)}</g:price>`,
    `      <g:availability>${escapeXml(availability)}</g:availability>`,
    ...(brand ? [`      <g:brand>${escapeXml(brand)}</g:brand>`] : []),
    `      <g:condition>new</g:condition>`,
    // Own-made products have no GTIN; third-party brands do, so Google should keep asking for theirs.
    ...(ownBrand ? [`      <g:identifier_exists>no</g:identifier_exists>`] : []),
    '    </item>',
  ];

  return lines.join('\n');
}

/**
 * Google Merchant Center product feed (RSS 2.0 + Google g: namespace).
 * GET /api/feeds/google-merchant
 */
export async function GET() {
  try {
    const products = await fetchAllProductsForFeed();
    const items = products
      .map(mapProductToItem)
      .filter((item): item is string => Boolean(item))
      .join('\n');

    const siteUrl = getSiteUrl();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(STORE_NAME)} Google Merchant Feed</title>
    <link>${escapeXml(siteUrl)}/</link>
    <description>Product feed for Google Merchant Center</description>
${items}
  </channel>
</rss>
`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[google-merchant feed]', error);
    return new NextResponse('Failed to generate Google Merchant feed', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
