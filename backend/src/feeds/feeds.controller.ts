import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  MetaCommerceExportService,
  type MetaCommerceRow,
} from '../catalog/services/meta-commerce-export.service';

/** Storefront origin for this deployment (compose sets FRONTEND_URL=${SHOP_URL}). */
function storefrontOrigin(): string {
  return (
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3001'
  ).replace(/\/$/, '');
}

function storeName(): string {
  return process.env.STORE_NAME?.trim() || 'SM NIMCO & Sweets';
}

@Controller()
export class FeedsController {
  private readonly logger = new Logger(FeedsController.name);

  constructor(
    private readonly metaCommerceExportService: MetaCommerceExportService,
  ) {}

  /**
   * RSS 2.0 (Google format) product catalog, fetched on a schedule by
   * Meta Commerce Manager and TikTok Catalog Manager.
   * GET /meta-catalog.xml, GET /tiktok-catalog.xml
   */
  @Get(['meta-catalog.xml', 'tiktok-catalog.xml'])
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=300')
  async getMetaCatalogXml(): Promise<string> {
    try {
      const rows = await this.metaCommerceExportService.buildRows();
      return this.toRssXml(rows);
    } catch (error) {
      this.logger.error(
        'Failed to generate Meta catalog XML feed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to generate Meta catalog feed',
      );
    }
  }

  private toRssXml(rows: MetaCommerceRow[]): string {
    const items = rows
      .map((row) => this.mapRowToItem(row))
      .filter((item): item is string => item != null)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${this.escapeXml(storeName())} Product Catalog</title>
    <link>${this.escapeXml(`${storefrontOrigin()}/`)}</link>
    <description>Product feed for Meta Commerce Manager and TikTok Catalog Manager</description>
${items}
  </channel>
</rss>
`;
  }

  /**
   * Maps export row fields (sku→id, name→title, slug→link, imageUrl→image_link,
   * stock→availability, price, googleCategory) to Meta RSS item tags.
   */
  private mapRowToItem(row: MetaCommerceRow): string | null {
    const id = row.id?.trim();
    const title = row.title?.trim();
    const imageLink = row.image_link?.trim();
    if (!id || !title || !imageLink) return null;

    const link = `${storefrontOrigin()}/products/${this.slugFromProductLink(row.link)}`;
    const brand = row.brand?.trim() || '';
    const description = row.description?.trim() || title;
    const availability = row.availability || 'out of stock';
    const price = row.price || '0.00 PKR';
    const googleCategory = row.google_product_category?.trim() || '';

    const lines = [
      '    <item>',
      `      <g:id>${this.escapeXml(id)}</g:id>`,
      `      <title>${this.escapeXml(title)}</title>`,
      `      <description>${this.escapeXml(description)}</description>`,
      `      <link>${this.escapeXml(link)}</link>`,
      `      <g:image_link>${this.escapeXml(imageLink)}</g:image_link>`,
      `      <g:availability>${this.escapeXml(availability)}</g:availability>`,
      `      <g:price>${this.escapeXml(price)}</g:price>`,
      `      <g:condition>new</g:condition>`,
    ];

    // Only a product explicitly tagged with a brand gets one; never default to the store name.
    if (brand) {
      lines.push(`      <g:brand>${this.escapeXml(brand)}</g:brand>`);
    }

    if (googleCategory) {
      lines.push(
        `      <g:google_product_category>${this.escapeXml(googleCategory)}</g:google_product_category>`,
      );
    }

    if (row.item_group_id?.trim()) {
      lines.push(
        `      <g:item_group_id>${this.escapeXml(row.item_group_id.trim())}</g:item_group_id>`,
      );
    }

    lines.push('    </item>');
    return lines.join('\n');
  }

  /** Pull the `/products/{slug}` segment so the link always uses this store's origin. */
  private slugFromProductLink(link: string): string {
    const trimmed = (link || '').trim();
    const match = trimmed.match(/\/products\/([^?#]+)/i);
    if (match?.[1]) return match[1];
    return encodeURIComponent(trimmed);
  }

  private escapeXml(value: string): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
