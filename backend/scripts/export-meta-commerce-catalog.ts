/**
 * CLI: export active products to a Meta Commerce Manager CSV/XLSX file.
 *
 * Usage (from backend/):
 *   npm run export:meta-commerce
 *   npm run export:meta-commerce -- --format=xlsx --out=./meta-catalog.xlsx
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PrismaService } from '../src/catalog/services/prisma.service';
import { MetaCommerceExportService } from '../src/catalog/services/meta-commerce-export.service';

@Module({
  providers: [PrismaService, MetaCommerceExportService],
})
class MetaExportCliModule {}

function parseArgs(argv: string[]) {
  let format: 'csv' | 'xlsx' = 'csv';
  let out: string | undefined;
  for (const arg of argv) {
    if (arg.startsWith('--format=')) {
      const v = arg.slice('--format='.length).toLowerCase();
      if (v === 'xlsx' || v === 'csv') format = v;
    } else if (arg === '--xlsx') {
      format = 'xlsx';
    } else if (arg.startsWith('--out=')) {
      out = arg.slice('--out='.length);
    }
  }
  return { format, out };
}

async function main() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config({ path: resolve(__dirname, '../.env') });
  } catch {
    // dotenv optional — Prisma may still read DATABASE_URL from the environment
  }

  const { format, out } = parseArgs(process.argv.slice(2));
  const stamp = new Date().toISOString().slice(0, 10);
  const defaultName =
    format === 'xlsx'
      ? `meta-commerce-catalog-${stamp}.xlsx`
      : `meta-commerce-catalog-${stamp}.csv`;
  const outPath = resolve(process.cwd(), out || defaultName);

  const app = await NestFactory.createApplicationContext(MetaExportCliModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const exporter = app.get(MetaCommerceExportService);
    const { buffer, rowCount } = await exporter.exportFile(format);
    writeFileSync(outPath, buffer);
    console.log(
      `Exported ${rowCount} Meta catalog row(s) → ${outPath} (${format})`,
    );
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
