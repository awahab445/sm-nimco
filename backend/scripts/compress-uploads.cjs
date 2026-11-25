/**
 * One-time shrink of images already uploaded (new uploads are compressed by
 * src/common/utils/compress-image.util.ts with the same settings).
 * Same file names and format, so every saved URL keeps working.
 *
 * Each argument is a folder, optionally with its max side in px (default 1600), matching the
 * upload limits: categories 1200, site-config (logo) 600.
 *
 * Dry run (default, read-only): lists each file with its current and estimated new size.
 *   node scripts/compress-uploads.cjs uploads/products uploads/deals uploads/categories:1200 uploads/site-config:600
 * Apply (copies each original to uploads/_originals/<folder>/ first): add --apply
 *
 * Production (uploads live in the API container's volume):
 *   docker cp backend/scripts/compress-uploads.cjs ecommerce-api:/app/compress-uploads.cjs
 *   docker exec ecommerce-api node compress-uploads.cjs uploads/products uploads/deals uploads/categories:1200 uploads/site-config:600
 */
const { copyFile, mkdir, readdir, rename, stat, unlink } = require('fs/promises');
const { basename, join, resolve } = require('path');
const sharp = require('sharp');

const MAX_SIDE = 1600;
const apply = process.argv.includes('--apply');
const dirs = process.argv.slice(2).filter((a) => !a.startsWith('--'));

async function shrink(path, maxSide) {
  const meta = await sharp(path).metadata();
  let pipeline = sharp(path)
    .rotate()
    .resize(maxSide, maxSide, { fit: 'inside', withoutEnlargement: true });
  if (meta.format === 'jpeg') pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
  else if (meta.format === 'png') pipeline = pipeline.png({ compressionLevel: 9, effort: 8 });
  else if (meta.format === 'webp') pipeline = pipeline.webp({ quality: 80 });
  else return null;
  return pipeline.toBuffer();
}

async function main() {
  if (!dirs.length) {
    console.error('Usage: node scripts/compress-uploads.cjs <dir> [dir…] [--apply]');
    process.exit(1);
  }
  let before = 0;
  let after = 0;
  let changed = 0;
  for (const arg of dirs) {
    const [dir, max] = arg.split(':');
    const maxSide = Number(max) || MAX_SIDE;
    const backupDir = resolve(dir, '..', '_originals', basename(dir));
    for (const name of await readdir(dir)) {
      if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
      const path = join(dir, name);
      const size = (await stat(path)).size;
      let out;
      try {
        out = await shrink(path, maxSide);
      } catch (error) {
        console.warn(`skip ${path}: ${error.message}`);
        continue;
      }
      before += size;
      if (!out || out.length >= size) {
        after += size;
        continue;
      }
      after += out.length;
      changed += 1;
      console.log(`${path}  ${Math.round(size / 1024)} KB -> ${Math.round(out.length / 1024)} KB`);
      if (apply) {
        await mkdir(backupDir, { recursive: true });
        await copyFile(path, join(backupDir, name));
        const tmp = `${path}.tmp`;
        try {
          await sharp(out).toFile(tmp);
          await rename(tmp, path);
        } catch (error) {
          await unlink(tmp).catch(() => undefined);
          console.warn(`kept original ${path}: ${error.message}`);
        }
      }
    }
  }
  console.log(
    `\n${changed} file(s) ${apply ? 'compressed' : 'would be compressed'}: ` +
      `${Math.round(before / 1048576)} MB -> ${Math.round(after / 1048576)} MB` +
      (apply ? '' : '  (dry run; add --apply to write)'),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
