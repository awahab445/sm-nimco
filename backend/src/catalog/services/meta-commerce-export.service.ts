import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { PrismaService } from './prisma.service';
import { APP_CURRENCY } from '../../common/currency';
import { readAttributeValue } from '../queries/product.query';
import { DEFAULT_WAREHOUSE_ID } from '../../inventory/dto/adjust-stock.dto';

/**
 * Meta Commerce Manager catalog headers — names and order match Meta's
 * official CSV example so Commerce Manager auto-maps without intervention.
 * @see https://developers.facebook.com/docs/commerce-platform/catalog/fields/
 *
 * Required: id, title, description, availability, condition, price, link, image_link, brand
 * Exact spellings (lowercase + underscores): link, image_link
 */
export const META_COMMERCE_COLUMNS = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'link',
  'image_link',
  'brand',
  'additional_image_link',
  'item_group_id',
  'google_product_category',
  'fb_product_category',
  'product_type',
  'sale_price',
] as const;

export type MetaCommerceColumn = (typeof META_COMMERCE_COLUMNS)[number];
export type MetaCommerceRow = Record<MetaCommerceColumn, string>;

const META_BRAND = 'SM NIMCO & Sweets';

type ProductForExport = Prisma.ProductGetPayload<{
  include: {
    images: true;
    categories: { include: { category: true }; orderBy: { position: 'asc' } };
    variants: {
      where: { isActive: true };
      orderBy: { position: 'asc' };
      include: { images: true; inventoryItems: true };
    };
    inventoryItems: true;
  };
}>;

@Injectable()
export class MetaCommerceExportService {
  constructor(private readonly prisma: PrismaService) {}

  async buildRows(): Promise<MetaCommerceRow[]> {
    const products = await this.prisma.product.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        visibility: { not: 'none' },
      },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
        categories: {
          include: { category: true },
          orderBy: { position: 'asc' },
        },
        variants: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          include: {
            images: { orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
            inventoryItems: true,
          },
        },
        inventoryItems: true,
      },
      orderBy: { name: 'asc' },
    });

    const rows: MetaCommerceRow[] = [];
    for (const product of products) {
      if (product.variants.length > 0) {
        for (const variant of product.variants) {
          const row = this.mapVariantRow(product, variant);
          if (this.hasRequiredUrls(row)) rows.push(row);
        }
      } else {
        const row = this.mapProductRow(product);
        if (this.hasRequiredUrls(row)) rows.push(row);
      }
    }
    return rows;
  }

  async generateCsv(): Promise<Buffer> {
    const rows = await this.buildRows();
    return Buffer.from(this.rowsToCsv(rows), 'utf8');
  }

  async generateXlsx(): Promise<Buffer> {
    const rows = await this.buildRows();
    return this.rowsToXlsx(rows);
  }

  async exportFile(
    format: 'csv' | 'xlsx' = 'csv',
  ): Promise<{ buffer: Buffer; rowCount: number }> {
    const rows = await this.buildRows();
    const buffer =
      format === 'xlsx'
        ? this.rowsToXlsx(rows)
        : Buffer.from(this.rowsToCsv(rows), 'utf8');
    return { buffer, rowCount: rows.length };
  }

  /** Header line Meta will read — must be exact (no BOM, no spaces). */
  getHeaderLine(): string {
    return META_COMMERCE_COLUMNS.join(',');
  }

  private rowsToXlsx(rows: MetaCommerceRow[]): Buffer {
    // Force exact header order/names even when row objects have insertion quirks
    const aoa: string[][] = [
      [...META_COMMERCE_COLUMNS],
      ...rows.map((row) => META_COMMERCE_COLUMNS.map((col) => row[col] ?? '')),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Meta Catalog');
    const out = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;
    return Buffer.from(out);
  }

  private hasRequiredUrls(row: MetaCommerceRow): boolean {
    return Boolean(row.link?.trim() && row.image_link?.trim());
  }

  private mapProductRow(product: ProductForExport): MetaCommerceRow {
    const stock = this.sumAvailable(
      product.inventoryItems.filter((i) => i.variantId == null),
    );
    const category = this.primaryCategoryName(product);
    const description =
      this.plainText(product.description) ||
      this.plainText(product.shortDescription) ||
      product.name;
    const images = product.images;

    return {
      id: product.sku,
      title: product.name,
      description,
      availability: this.availability(product.type, stock),
      condition: 'new',
      price: this.formatPrice(product.basePrice),
      link: this.productLink(product.slug),
      image_link: this.absoluteImageUrl(this.primaryImageUrl(images)),
      brand: this.resolveBrand(product),
      additional_image_link: this.additionalImageLinks(images),
      item_group_id: '',
      google_product_category: category,
      fb_product_category: category,
      product_type: category,
      sale_price: '',
    };
  }

  private mapVariantRow(
    product: ProductForExport,
    variant: ProductForExport['variants'][number],
  ): MetaCommerceRow {
    const stock = this.sumAvailable(variant.inventoryItems);
    const category = this.primaryCategoryName(product);
    const title = variant.name?.trim()
      ? `${product.name} - ${variant.name}`
      : product.name;
    const description =
      this.plainText(product.description) ||
      this.plainText(product.shortDescription) ||
      title;
    const images = variant.images.length > 0 ? variant.images : product.images;
    const image =
      this.primaryImageUrl(variant.images) ||
      this.primaryImageUrl(product.images);

    return {
      id: variant.sku,
      title,
      description,
      availability: this.availability(product.type, stock),
      condition: 'new',
      price: this.formatPrice(variant.price),
      link: this.productLink(product.slug),
      image_link: this.absoluteImageUrl(image),
      brand: this.resolveBrand(product),
      additional_image_link: this.additionalImageLinks(images),
      item_group_id: product.sku,
      google_product_category: category,
      fb_product_category: category,
      product_type: category,
      sale_price: '',
    };
  }

  private resolveBrand(product: ProductForExport): string {
    const fromAttr = readAttributeValue(product.attributes, 'brand');
    if (fromAttr) return fromAttr;
    return process.env.STORE_NAME?.trim() || META_BRAND;
  }

  private primaryCategoryName(product: ProductForExport): string {
    const active = product.categories.find((c) => c.category.isActive);
    return (active ?? product.categories[0])?.category?.name?.trim() ?? '';
  }

  private primaryImageUrl(
    images: Array<{ url: string; isPrimary: boolean; position: number }>,
  ): string {
    if (!images.length) return '';
    const primary = images.find((img) => img.isPrimary);
    return (primary ?? images[0]).url?.trim() ?? '';
  }

  private additionalImageLinks(
    images: Array<{ url: string; isPrimary: boolean; position: number }>,
  ): string {
    if (images.length <= 1) return '';
    const primaryUrl = this.primaryImageUrl(images);
    const extras = images
      .map((img) => this.absoluteImageUrl(img.url))
      .filter((url) => url && url !== this.absoluteImageUrl(primaryUrl))
      .slice(0, 20);
    return extras.join(',');
  }

  private sumAvailable(
    items: Array<{ warehouseId: string; availableQuantity: number }>,
  ): number {
    if (!items.length) return 0;
    const inDefault = items.filter(
      (i) => i.warehouseId === DEFAULT_WAREHOUSE_ID,
    );
    const source = inDefault.length ? inDefault : items;
    return source.reduce((sum, i) => sum + (i.availableQuantity || 0), 0);
  }

  private availability(type: string, stock: number): string {
    if (type === 'virtual') return 'in stock';
    return stock > 0 ? 'in stock' : 'out of stock';
  }

  /** Meta requires: `{amount} {ISO currency}` e.g. `159.00 PKR` */
  formatPrice(value: Prisma.Decimal | number | string): string {
    const num = Number(value);
    const amount = Number.isFinite(num) ? num.toFixed(2) : '0.00';
    const currency = (APP_CURRENCY || 'PKR').toUpperCase();
    return `${amount} ${currency}`;
  }

  productLink(slug: string): string {
    const base = (
      process.env.FRONTEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3001'
    ).replace(/\/$/, '');
    return `${base}/products/${encodeURIComponent(slug)}`;
  }

  absoluteImageUrl(stored: string): string {
    const u = (stored || '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    const apiBase = (
      process.env.PUBLIC_BASE_URL ||
      process.env.APP_URL ||
      `http://localhost:${process.env.PORT || 3000}`
    ).replace(/\/$/, '');
    const path = u.startsWith('/') ? u : `/${u}`;
    return `${apiBase}${path}`;
  }

  plainText(htmlOrText: string | null | undefined): string {
    if (!htmlOrText) return '';
    return htmlOrText
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  rowsToCsv(rows: MetaCommerceRow[]): string {
    // No UTF-8 BOM — BOM can make Meta fail to auto-detect headers.
    // Quote every cell so commas inside URLs/descriptions never shift columns.
    const header = this.getHeaderLine();
    const lines = rows.map((row) =>
      META_COMMERCE_COLUMNS.map((col) => this.csvEscape(row[col] ?? '')).join(
        ',',
      ),
    );
    return [header, ...lines].join('\r\n') + '\r\n';
  }

  private csvEscape(value: string): string {
    // Always double-quote so Meta's parser never mis-splits on commas in URLs/text
    return `"${String(value).replace(/"/g, '""')}"`;
  }
}
