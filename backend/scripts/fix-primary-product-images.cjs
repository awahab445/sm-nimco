/**
 * One-off repair: if a product's primary image file is missing on disk,
 * promote the first image whose file exists to isPrimary.
 *
 * Run: node scripts/fix-primary-product-images.cjs
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function resolveUploadPath(url) {
  let pathname = url;
  try {
    if (/^https?:\/\//i.test(url)) {
      pathname = new URL(url).pathname;
    }
  } catch {
    // keep raw
  }
  const normalized = pathname.replace(/^\/+/, '');
  return path.join(process.cwd(), normalized);
}

async function main() {
  const images = await prisma.productImage.findMany({
    orderBy: [{ productId: 'asc' }, { position: 'asc' }],
  });

  /** @type {Map<string, typeof images>} */
  const byProduct = new Map();
  for (const img of images) {
    const list = byProduct.get(img.productId) ?? [];
    list.push(img);
    byProduct.set(img.productId, list);
  }

  let fixed = 0;
  for (const [productId, list] of byProduct) {
    const annotated = list.map((img) => ({
      img,
      exists: fs.existsSync(resolveUploadPath(img.url)),
    }));

    const primary = annotated.find((x) => x.img.isPrimary) ?? annotated[0];
    if (primary?.exists) continue;

    const replacement = annotated.find((x) => x.exists);
    if (!replacement) {
      console.log(`No on-disk image for product ${productId}`);
      continue;
    }

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      prisma.productImage.update({
        where: { id: replacement.img.id },
        data: { isPrimary: true },
      }),
    ]);

    fixed += 1;
    console.log(`Fixed ${productId} -> ${replacement.img.url}`);
  }

  console.log(`Fixed count: ${fixed}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
