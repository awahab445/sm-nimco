import { Injectable, Logger } from '@nestjs/common';
import { extname, join } from 'path';
import { unlink } from 'fs/promises';
import sharp from 'sharp';

export type CmsSlideImageVariants = {
  mobile: string;
  tablet: string;
  desktop: string;
};

export type CmsSlideUploadResult = {
  url: string;
  absoluteUrl: string;
  filename: string;
  variants: CmsSlideImageVariants;
};

const VARIANT_WIDTHS = {
  mobile: 768,
  tablet: 1280,
  desktop: 1920,
} as const;

@Injectable()
export class CmsSlideImageService {
  private readonly logger = new Logger(CmsSlideImageService.name);

  /**
   * Resize + convert an uploaded CMS slide image into WebP variants
   * (mobile / tablet / desktop). Animated GIFs keep the original file for all slots.
   */
  async processUploadedSlide(
    file: { path: string; filename: string },
    baseUrl: string,
  ): Promise<CmsSlideUploadResult> {
    const extension = extname(file.filename || '').toLowerCase();
    const publicDir = '/uploads/cms-slides';
    const id = file.filename.replace(extension, '');
    const originalPublic = `${publicDir}/${file.filename}`;

    if (extension === '.gif') {
      const variants: CmsSlideImageVariants = {
        mobile: originalPublic,
        tablet: originalPublic,
        desktop: originalPublic,
      };
      return {
        url: originalPublic,
        absoluteUrl: `${baseUrl}${originalPublic}`,
        filename: file.filename,
        variants,
      };
    }

    try {
      const meta = await sharp(file.path).metadata();
      const sourceWidth = meta.width ?? VARIANT_WIDTHS.desktop;

      const variants: CmsSlideImageVariants = {
        mobile: await this.writeVariant(
          file.path,
          id,
          'mobile',
          Math.min(VARIANT_WIDTHS.mobile, sourceWidth),
        ),
        tablet: await this.writeVariant(
          file.path,
          id,
          'tablet',
          Math.min(VARIANT_WIDTHS.tablet, sourceWidth),
        ),
        desktop: await this.writeVariant(
          file.path,
          id,
          'desktop',
          Math.min(VARIANT_WIDTHS.desktop, sourceWidth),
        ),
      };

      // Prefer optimized desktop WebP as the canonical URL; remove bulky original.
      try {
        await unlink(file.path);
      } catch {
        /* ignore */
      }

      return {
        url: variants.desktop,
        absoluteUrl: `${baseUrl}${variants.desktop}`,
        filename: `${id}-desktop.webp`,
        variants,
      };
    } catch (err) {
      this.logger.warn(
        `Sharp processing failed for ${file.filename}; serving original. ${String(err)}`,
      );
      const variants: CmsSlideImageVariants = {
        mobile: originalPublic,
        tablet: originalPublic,
        desktop: originalPublic,
      };
      return {
        url: originalPublic,
        absoluteUrl: `${baseUrl}${originalPublic}`,
        filename: file.filename,
        variants,
      };
    }
  }

  /** Process a dedicated mobile art-direction upload (single optimized asset). */
  async processMobileOnly(
    file: { path: string; filename: string },
    baseUrl: string,
  ): Promise<{ url: string; absoluteUrl: string; filename: string }> {
    const extension = extname(file.filename || '').toLowerCase();
    const publicDir = '/uploads/cms-slides';
    const id = file.filename.replace(extension, '');
    const originalPublic = `${publicDir}/${file.filename}`;

    if (extension === '.gif') {
      return {
        url: originalPublic,
        absoluteUrl: `${baseUrl}${originalPublic}`,
        filename: file.filename,
      };
    }

    try {
      const outName = `${id}-mobile.webp`;
      const outPath = join('uploads', 'cms-slides', outName);
      await sharp(file.path)
        .rotate()
        .resize({
          width: VARIANT_WIDTHS.mobile,
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({ quality: 82 })
        .toFile(outPath);

      try {
        await unlink(file.path);
      } catch {
        /* ignore */
      }

      const url = `${publicDir}/${outName}`;
      return { url, absoluteUrl: `${baseUrl}${url}`, filename: outName };
    } catch (err) {
      this.logger.warn(
        `Mobile-only Sharp processing failed for ${file.filename}. ${String(err)}`,
      );
      return {
        url: originalPublic,
        absoluteUrl: `${baseUrl}${originalPublic}`,
        filename: file.filename,
      };
    }
  }

  private async writeVariant(
    sourcePath: string,
    id: string,
    label: keyof typeof VARIANT_WIDTHS,
    width: number,
  ): Promise<string> {
    const outName = `${id}-${label}.webp`;
    const outPath = join('uploads', 'cms-slides', outName);
    await sharp(sourcePath)
      .rotate()
      .resize({
        width,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: label === 'mobile' ? 80 : 82 })
      .toFile(outPath);
    return `/uploads/cms-slides/${outName}`;
  }
}
