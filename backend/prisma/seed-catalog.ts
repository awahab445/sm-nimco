import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

type SeedData = {
  exportedAt?: string;
  categories: Array<Record<string, unknown>>;
  productOptions: Array<
    Record<string, unknown> & {
      values?: Array<Record<string, unknown>>;
    }
  >;
  products: Array<
    Record<string, unknown> & {
      variants?: Array<
        Record<string, unknown> & {
          optionValues?: Array<Record<string, unknown>>;
        }
      >;
      images?: Array<Record<string, unknown>>;
      categories?: Array<Record<string, unknown>>;
      options?: Array<
        Record<string, unknown> & {
          values?: Array<Record<string, unknown>>;
        }
      >;
    }
  >;
  variantOptionValues?: Array<Record<string, unknown>>;
  bundleDeals: Array<
    Record<string, unknown> & {
      items?: Array<Record<string, unknown>>;
    }
  >;
  storeSettings: Array<Record<string, unknown>>;
};

function asString(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value);
}

function asNullableString(value: unknown): string | null {
  if (value == null || value === '') return null;
  return String(value);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  if (value && typeof value === 'object' && 'toNumber' in value) {
    try {
      return Number((value as { toNumber: () => number }).toNumber());
    } catch {
      /* fall through */
    }
  }
  if (value && typeof value === 'object' && 'toString' in value) {
    const n = Number(String(value));
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function asDecimal(value: unknown): Prisma.Decimal | string {
  if (value == null || value === '') return '0';
  return String(value);
}

function asNullableDecimal(value: unknown): Prisma.Decimal | string | null {
  if (value == null || value === '') return null;
  return String(value);
}

function asDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function asJson(value: unknown): Prisma.InputJsonValue {
  if (value == null) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Prisma.InputJsonValue;
    } catch {
      return {};
    }
  }
  return value as Prisma.InputJsonValue;
}

/**
 * Upserts catalog snapshot from prisma/seed-data.json (exported from local admin data).
 * Safe to re-run only on empty catalogs — skips entirely when any products exist.
 */
export async function seedCatalogFromSnapshot(prisma: PrismaClient): Promise<void> {
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log(
      `Seed catalog: skip snapshot — ${existingProducts} product(s) already exist (no overwrite).`,
    );
    return;
  }

  const dataPath = path.join(__dirname, 'seed-data.json');
  if (!fs.existsSync(dataPath)) {
    console.log('Seed catalog: prisma/seed-data.json not found — skipping catalog snapshot.');
    return;
  }

  const raw = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(raw) as SeedData;
  console.log(
    `Seed catalog: loading snapshot from ${data.exportedAt ?? 'seed-data.json'}…`,
  );

  // 1) Categories (parents first)
  const categories = [...(data.categories ?? [])].sort((a, b) => {
    const ap = a.parentId ? 1 : 0;
    const bp = b.parentId ? 1 : 0;
    return ap - bp;
  });
  for (const cat of categories) {
    const id = asString(cat.id);
    const parentId = asNullableString(cat.parentId);
    await prisma.category.upsert({
      where: { id },
      update: {
        name: asString(cat.name),
        slug: asString(cat.slug),
        description: asNullableString(cat.description),
        parentId,
        position: asNumber(cat.position),
        isActive: asBool(cat.isActive, true),
      },
      create: {
        id,
        name: asString(cat.name),
        slug: asString(cat.slug),
        description: asNullableString(cat.description),
        parentId,
        position: asNumber(cat.position),
        isActive: asBool(cat.isActive, true),
      },
    });
  }

  // 2) Product options + values
  for (const option of data.productOptions ?? []) {
    const optionId = asString(option.id);
    await prisma.productOption.upsert({
      where: { id: optionId },
      update: {
        name: asString(option.name),
        code: asString(option.code),
        isActive: asBool(option.isActive, true),
      },
      create: {
        id: optionId,
        name: asString(option.name),
        code: asString(option.code),
        isActive: asBool(option.isActive, true),
      },
    });

    for (const value of option.values ?? []) {
      const valueId = asString(value.id);
      await prisma.productOptionValue.upsert({
        where: { id: valueId },
        update: {
          optionId,
          value: asString(value.value),
          code: asNullableString(value.code),
          sortOrder: asNumber(value.sortOrder),
          isActive: asBool(value.isActive, true),
        },
        create: {
          id: valueId,
          optionId,
          value: asString(value.value),
          code: asNullableString(value.code),
          sortOrder: asNumber(value.sortOrder),
          isActive: asBool(value.isActive, true),
        },
      });
    }
  }

  // 3) Products
  for (const product of data.products ?? []) {
    const productId = asString(product.id);
    await prisma.product.upsert({
      where: { id: productId },
      update: {
        sku: asString(product.sku),
        name: asString(product.name),
        slug: asString(product.slug),
        type: asString(product.type, 'simple'),
        description: asNullableString(product.description),
        shortDescription: asNullableString(product.shortDescription),
        basePrice: asDecimal(product.basePrice),
        cost: asNullableDecimal(product.cost),
        weight: asNullableDecimal(product.weight),
        status: asString(product.status, 'draft'),
        visibility: asString(product.visibility, 'both'),
        taxClassId: asNullableString(product.taxClassId),
        attributes: asJson(product.attributes),
        metaData: asJson(product.metaData),
        deletedAt: null,
      },
      create: {
        id: productId,
        sku: asString(product.sku),
        name: asString(product.name),
        slug: asString(product.slug),
        type: asString(product.type, 'simple'),
        description: asNullableString(product.description),
        shortDescription: asNullableString(product.shortDescription),
        basePrice: asDecimal(product.basePrice),
        cost: asNullableDecimal(product.cost),
        weight: asNullableDecimal(product.weight),
        status: asString(product.status, 'draft'),
        visibility: asString(product.visibility, 'both'),
        taxClassId: asNullableString(product.taxClassId),
        attributes: asJson(product.attributes),
        metaData: asJson(product.metaData),
      },
    });

    // Variants
    for (const variant of product.variants ?? []) {
      const variantId = asString(variant.id);
      await prisma.productVariant.upsert({
        where: { id: variantId },
        update: {
          productId,
          sku: asString(variant.sku),
          name: asString(variant.name),
          price: asDecimal(variant.price),
          cost: asNullableDecimal(variant.cost),
          weight: asNullableDecimal(variant.weight),
          attributes: asJson(variant.attributes),
          position: asNumber(variant.position),
          isActive: asBool(variant.isActive, true),
        },
        create: {
          id: variantId,
          productId,
          sku: asString(variant.sku),
          name: asString(variant.name),
          price: asDecimal(variant.price),
          cost: asNullableDecimal(variant.cost),
          weight: asNullableDecimal(variant.weight),
          attributes: asJson(variant.attributes),
          position: asNumber(variant.position),
          isActive: asBool(variant.isActive, true),
        },
      });

      for (const link of variant.optionValues ?? []) {
        await prisma.variantOptionValue.upsert({
          where: {
            variantId_optionId: {
              variantId: asString(link.variantId ?? variantId),
              optionId: asString(link.optionId),
            },
          },
          update: {
            valueId: asString(link.valueId),
          },
          create: {
            variantId: asString(link.variantId ?? variantId),
            optionId: asString(link.optionId),
            valueId: asString(link.valueId),
          },
        });
      }
    }

    // Images — replace set for this product to avoid orphans
    await prisma.productImage.deleteMany({ where: { productId } });
    for (const image of product.images ?? []) {
      const rawUrl = asString(image.url);
      const url =
        rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
          ? (() => {
              try {
                const parsed = new URL(rawUrl);
                return parsed.pathname.startsWith('/uploads/')
                  ? parsed.pathname
                  : rawUrl;
              } catch {
                return rawUrl;
              }
            })()
          : rawUrl.startsWith('uploads/')
            ? `/${rawUrl}`
            : rawUrl;
      await prisma.productImage.create({
        data: {
          id: asString(image.id),
          productId,
          variantId: asNullableString(image.variantId),
          url,
          altText: asNullableString(image.altText),
          position: asNumber(image.position),
          isPrimary: asBool(image.isPrimary, false),
        },
      });
    }

    // Category links
    for (const link of product.categories ?? []) {
      const categoryId = asString(link.categoryId);
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: { productId, categoryId },
        },
        update: { position: asNumber(link.position) },
        create: {
          productId,
          categoryId,
          position: asNumber(link.position),
        },
      });
    }

    // Option assignments on product
    for (const optLink of product.options ?? []) {
      const optionId = asString(optLink.optionId);
      await prisma.productOptionOnProduct.upsert({
        where: {
          productId_optionId: { productId, optionId },
        },
        update: {
          isRequired: asBool(optLink.isRequired, false),
          position: asNumber(optLink.position),
        },
        create: {
          productId,
          optionId,
          isRequired: asBool(optLink.isRequired, false),
          position: asNumber(optLink.position),
        },
      });

      for (const valLink of optLink.values ?? []) {
        const valueId = asString(valLink.valueId);
        await prisma.productOptionValueOnProduct.upsert({
          where: {
            productId_optionId_valueId: {
              productId,
              optionId,
              valueId,
            },
          },
          update: {},
          create: {
            productId,
            optionId,
            valueId,
          },
        });
      }
    }
  }

  // Top-level variant option values (in case not nested under products)
  for (const link of data.variantOptionValues ?? []) {
    await prisma.variantOptionValue.upsert({
      where: {
        variantId_optionId: {
          variantId: asString(link.variantId),
          optionId: asString(link.optionId),
        },
      },
      update: { valueId: asString(link.valueId) },
      create: {
        variantId: asString(link.variantId),
        optionId: asString(link.optionId),
        valueId: asString(link.valueId),
      },
    });
  }

  // 4) Bundle deals
  for (const deal of data.bundleDeals ?? []) {
    const dealId = asString(deal.id);
    await prisma.bundleDeal.upsert({
      where: { id: dealId },
      update: {
        title: asString(deal.title),
        slug: asString(deal.slug),
        description: asNullableString(deal.description),
        status: asString(deal.status, 'draft'),
        isFeatured: asBool(deal.isFeatured, false),
        dealPrice: asDecimal(deal.dealPrice),
        compareAtTotal: asDecimal(deal.compareAtTotal),
        savingsAmount: asDecimal(deal.savingsAmount),
        savingsPercent: asNullableDecimal(deal.savingsPercent),
        imageUrl: asNullableString(deal.imageUrl),
        validFrom: asDate(deal.validFrom),
        validTo: asDate(deal.validTo),
        metadata: asJson(deal.metadata),
        deletedAt: null,
      },
      create: {
        id: dealId,
        title: asString(deal.title),
        slug: asString(deal.slug),
        description: asNullableString(deal.description),
        status: asString(deal.status, 'draft'),
        isFeatured: asBool(deal.isFeatured, false),
        dealPrice: asDecimal(deal.dealPrice),
        compareAtTotal: asDecimal(deal.compareAtTotal),
        savingsAmount: asDecimal(deal.savingsAmount),
        savingsPercent: asNullableDecimal(deal.savingsPercent),
        imageUrl: asNullableString(deal.imageUrl),
        validFrom: asDate(deal.validFrom),
        validTo: asDate(deal.validTo),
        metadata: asJson(deal.metadata),
      },
    });

    await prisma.bundleDealItem.deleteMany({ where: { bundleDealId: dealId } });
    for (const item of deal.items ?? []) {
      await prisma.bundleDealItem.create({
        data: {
          id: asString(item.id),
          bundleDealId: dealId,
          productId: asString(item.productId),
          variantId: asNullableString(item.variantId),
          quantity: asNumber(item.quantity, 1),
          position: asNumber(item.position),
          unitListPrice: asNullableDecimal(item.unitListPrice),
        },
      });
    }
  }

  // 5) Store settings / theme
  for (const settings of data.storeSettings ?? []) {
    const id = asString(settings.id, 'default');
    await prisma.storeSettings.upsert({
      where: { id },
      update: {
        currentTheme: asString(settings.currentTheme, 'tailwind'),
        // Avoid FK issues if the exporting admin user is not present
        updatedByAdminUserId: null,
      },
      create: {
        id,
        currentTheme: asString(settings.currentTheme, 'tailwind'),
        updatedByAdminUserId: null,
      },
    });
  }

  console.log(
    `Seed catalog: upserted ${categories.length} categories, ${(data.products ?? []).length} products, ${(data.bundleDeals ?? []).length} bundle deals, theme=${asString(data.storeSettings?.[0]?.currentTheme, 'n/a')}.`,
  );
}
