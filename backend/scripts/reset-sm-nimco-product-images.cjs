/**
 * Remap active SM NIMCO catalog product images to the correct branded assets
 * (from seed-data.json). Removes soap/chemical content that was incorrectly
 * copied onto previous seed filenames by repair-product-images.cjs.
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const uploadsDir = path.join(__dirname, '../uploads/products');
const seedPath = path.join(__dirname, '../prisma/seed-data.json');

/** Filenames that previously held soap/chemical bytes under old seed UUIDs. */
const POLLUTED_SEED_FILENAMES = [
  'a8a1408c-49db-4985-a350-98bd79a4d959.png',
  '8135460f-0de9-4a12-9926-ab372374450e.png',
  '9b7311ff-0b56-4838-b2c5-01da272fe372.png',
  'b92ad3d5-c516-4461-a046-606cf6930887.png',
  '0e2922be-e569-4fe3-ad2e-726880c689cf.png',
  'c5ca334f-6032-41ef-8e81-93e647679abe.png',
  '01432300-e178-4f58-a785-cfc2c738d169.png',
];

function toRelativeUploadsUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('/uploads/')) return trimmed;
  if (trimmed.startsWith('uploads/')) return `/${trimmed}`;
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/uploads/')) return parsed.pathname;
    }
  } catch {
    /* ignore */
  }
  return trimmed;
}

function filenameFromUrl(url) {
  return (url || '').split('/').pop()?.split('?')[0] || '';
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const products = seed.products || [];

  console.log(`Remapping ${products.length} SM NIMCO seed products…`);

  for (const product of products) {
    const productId = product.id;
    const images = product.images || [];
    if (!productId || !images.length) continue;

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: product.name,
        slug: product.slug,
        deletedAt: null,
        status: product.status || 'active',
      },
    });

    await prisma.productImage.deleteMany({ where: { productId } });

    for (const image of images) {
      const url = toRelativeUploadsUrl(image.url);
      const file = filenameFromUrl(url);
      const full = path.join(uploadsDir, file);
      if (!fs.existsSync(full)) {
        throw new Error(`Missing NIMCO asset for ${product.name}: ${file}`);
      }
      await prisma.productImage.create({
        data: {
          id: image.id,
          productId,
          variantId: image.variantId || null,
          url,
          altText: image.altText || product.name,
          position: image.position ?? 0,
          isPrimary: Boolean(image.isPrimary),
        },
      });
      console.log(`OK  ${product.name} -> ${url}`);
    }
  }

  // Drop polluted soap copies that used the old seed filenames (only if unused).
  const stillReferenced = new Set(
    (
      await prisma.productImage.findMany({ select: { url: true } })
    ).map((img) => filenameFromUrl(img.url)),
  );

  let deleted = 0;
  for (const name of POLLUTED_SEED_FILENAMES) {
    if (stillReferenced.has(name)) {
      console.warn(`Skip delete (still referenced): ${name}`);
      continue;
    }
    const full = path.join(uploadsDir, name);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      deleted++;
      console.log(`Deleted polluted file: ${name}`);
    }
  }

  console.log(`Done. Removed ${deleted} polluted soap/chemical copies.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
