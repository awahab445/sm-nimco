import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const [
    categories,
    products,
    productOptions,
    bundleDeals,
    storeSettings,
    variantOptionValues,
  ] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ position: 'asc' }, { name: 'asc' }] }),
    prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        variants: {
          orderBy: { position: 'asc' },
          include: { optionValues: true },
        },
        images: { orderBy: { position: 'asc' } },
        categories: true,
        options: { include: { values: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.productOption.findMany({
      include: { values: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
    prisma.bundleDeal.findMany({
      where: { deletedAt: null },
      include: { items: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.storeSettings.findMany(),
    prisma.variantOptionValue.findMany(),
  ]);

  const summary = {
    categories: categories.length,
    products: products.length,
    variants: products.reduce((n, p) => n + p.variants.length, 0),
    images: products.reduce((n, p) => n + p.images.length, 0),
    productOptions: productOptions.length,
    productOptionValues: productOptions.reduce((n, o) => n + o.values.length, 0),
    variantOptionValues: variantOptionValues.length,
    bundleDeals: bundleDeals.length,
    bundleDealItems: bundleDeals.reduce((n, d) => n + d.items.length, 0),
    storeSettings: storeSettings.length,
  };
  console.log('EXPORT_SUMMARY', JSON.stringify(summary));

  const payload = {
    exportedAt: new Date().toISOString(),
    categories,
    productOptions,
    products,
    variantOptionValues,
    bundleDeals,
    storeSettings,
  };

  const outPath = path.join(__dirname, 'seed-data.json');
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log('WROTE', outPath);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
