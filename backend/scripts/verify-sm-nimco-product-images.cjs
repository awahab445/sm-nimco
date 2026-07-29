const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();
const uploadsDir = path.join(__dirname, '../uploads/products');

const EXPECTED = {
  'Daal Mong': 'ebf8202f-b71f-41ef-980a-dbf12ebc2a18.png',
  'Finger Chips': '0bf1d3bb-4506-4ea0-8990-7b82325440bb.png',
  'Salty Peanuts': '72bfe8b9-f075-43b3-888e-39e06265b43e.png',
  Salanty: 'c9d28841-b76d-415c-afd0-38daa4959c54.png',
  'Coin Papri': '5500d30e-9c80-4b89-8906-8e1fc3dacfc8.png',
  'Sweet Chewra': 'e9a4b7c8-4660-4d6e-8901-134536b33af2.png',
  'Crincal Salty Chips': 'dbbda25c-02ab-42a7-9840-9005969d3207.png',
};

const SOAP_HASHES = new Set([
  // Will compare against known polluted files if any remain referenced
]);

function filenameFromUrl(url) {
  return (url || '').split('/').pop()?.split('?')[0] || '';
}

function md5(file) {
  return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
}

async function main() {
  const active = await prisma.product.findMany({
    where: { deletedAt: null, status: 'active' },
    include: { images: true },
    orderBy: { name: 'asc' },
  });

  let ok = 0;
  let fail = 0;
  for (const p of active) {
    const expected = EXPECTED[p.name];
    const url = p.images[0]?.url || '';
    const file = filenameFromUrl(url);
    const full = path.join(uploadsDir, file);
    const exists = fs.existsSync(full);
    const match = expected && file === expected && exists;
    const hash = exists ? md5(full) : null;
    console.log(
      `${match ? 'PASS' : 'FAIL'}\t${p.name}\tslug=${p.slug}\t${url}\texists=${exists}\thash=${hash}`,
    );
    if (match) ok++;
    else fail++;
  }

  // Ensure no active product still points at soft-deleted chemical product images
  const chemicalSlugs = await prisma.product.findMany({
    where: { deletedAt: { not: null } },
    select: { images: { select: { url: true } } },
  });
  const chemicalFiles = new Set(
    chemicalSlugs.flatMap((p) => p.images.map((i) => filenameFromUrl(i.url))),
  );
  for (const p of active) {
    for (const img of p.images) {
      const f = filenameFromUrl(img.url);
      if (chemicalFiles.has(f)) {
        console.log(`CROSS-BRAND\t${p.name} still shares file with soft-deleted chemical: ${f}`);
        fail++;
      }
    }
  }

  console.log(`\nSummary: ${ok} ok, ${fail} fail`);
  if (fail) process.exitCode = 1;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
