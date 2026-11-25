import { Logger } from '@nestjs/common';
import { rename, stat, unlink } from 'fs/promises';
import sharp from 'sharp';

const logger = new Logger('compressImageInPlace');

/** Longest side kept for product / deal images (enough for zoom on retina screens). */
export const MAX_IMAGE_SIDE = 1600;

/**
 * Shrink an uploaded image in place: auto-rotate, fit within `maxSide` (default MAX_IMAGE_SIDE), re-encode in the
 * same format (so the file name and public URL stay the same). GIFs are left alone.
 * Keeps the original when compression fails or would not make the file smaller.
 */
export async function compressImageInPlace(
  path: string,
  maxSide = MAX_IMAGE_SIDE,
): Promise<void> {
  const tmp = `${path}.tmp`;
  try {
    const meta = await sharp(path).metadata();
    let pipeline = sharp(path).rotate().resize(maxSide, maxSide, {
      fit: 'inside',
      withoutEnlargement: true,
    });
    if (meta.format === 'jpeg')
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    else if (meta.format === 'png')
      pipeline = pipeline.png({ compressionLevel: 9, effort: 8 });
    else if (meta.format === 'webp') pipeline = pipeline.webp({ quality: 80 });
    else return;

    await pipeline.toFile(tmp);
    const [before, after] = await Promise.all([stat(path), stat(tmp)]);
    if (after.size < before.size) {
      await rename(tmp, path);
    } else {
      await unlink(tmp);
    }
  } catch (error) {
    logger.warn(
      `Kept original ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
    await unlink(tmp).catch(() => undefined);
  }
}
