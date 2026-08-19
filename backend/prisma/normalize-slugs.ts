/**
 * One-shot script to normalize existing product and category slugs in the database.
 * Run: npx ts-node prisma/normalize-slugs.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('Normalizing product slugs...');
  const products = await prisma.product.findMany({ select: { id: true, slug: true } });
  let productFixed = 0;
  for (const p of products) {
    const fixed = normalizeSlug(p.slug);
    if (fixed !== p.slug) {
      let candidate = fixed;
      let n = 1;
      while (true) {
        const conflict = await prisma.product.findFirst({
          where: { slug: candidate, id: { not: p.id } },
          select: { id: true },
        });
        if (!conflict) break;
        candidate = `${fixed}-${n}`;
        n++;
      }
      await prisma.product.update({ where: { id: p.id }, data: { slug: candidate } });
      console.log(`  Product: "${p.slug}" -> "${candidate}"`);
      productFixed++;
    }
  }
  console.log(`  ${productFixed} product slug(s) fixed.`);

  console.log('Normalizing category slugs...');
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  let categoryFixed = 0;
  for (const c of categories) {
    const fixed = normalizeSlug(c.slug);
    if (fixed !== c.slug) {
      let candidate = fixed;
      let n = 1;
      while (true) {
        const conflict = await prisma.category.findFirst({
          where: { slug: candidate, id: { not: c.id } },
          select: { id: true },
        });
        if (!conflict) break;
        candidate = `${fixed}-${n}`;
        n++;
      }
      await prisma.category.update({ where: { id: c.id }, data: { slug: candidate } });
      console.log(`  Category: "${c.slug}" -> "${candidate}"`);
      categoryFixed++;
    }
  }
  console.log(`  ${categoryFixed} category slug(s) fixed.`);
  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
