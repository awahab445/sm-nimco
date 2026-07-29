const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const http = require('http');

const prisma = new PrismaClient();
const uploadsDir = path.join(__dirname, '../uploads/products');

function head(url) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(0));
    req.end();
  });
}

async function main() {
  const files = new Set(fs.readdirSync(uploadsDir));
  const imgs = await prisma.productImage.findMany({
    select: { url: true },
    take: 50,
  });
  const existing = imgs.find((i) => {
    const name = i.url.split('/').pop()?.split('?')[0];
    return name && files.has(name);
  });
  console.log('Sample existing URL:', existing?.url);
  if (!existing) return;

  const name = existing.url.split('/').pop();
  const urls = [
    existing.url,
    `http://localhost:3000/uploads/products/${name}`,
    `http://localhost:3001/uploads/products/${name}`,
  ];
  for (const u of urls) {
    const status = await head(u);
    console.log(status, u);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
