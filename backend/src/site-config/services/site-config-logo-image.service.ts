import { Injectable, Logger } from '@nestjs/common';
import { extname, join } from 'path';
import { unlink } from 'fs/promises';
import sharp from 'sharp';
import {
  findAlphaBounds,
  removeCheckerboardBackground,
} from '../utils/logo-background-removal';

export type SiteConfigLogoProcessResult = {
  publicPath: string;
  filename: string;
  width: number;
  height: number;
};

const SKIP_PROCESS_EXTENSIONS = new Set(['.svg', '.gif']);
const OUTPUT_PADDING_PX = 2;

@Injectable()
export class SiteConfigLogoImageService {
  private readonly logger = new Logger(SiteConfigLogoImageService.name);

  /**
   * Process an uploaded site-config logo: remove baked-in checkerboard background,
   * crop excess padding, and save as a transparent PNG.
   */
  async processUploadedLogo(file: {
    path: string;
    filename: string;
  }): Promise<SiteConfigLogoProcessResult> {
    const extension = extname(file.filename || '').toLowerCase();
    const publicDir = '/uploads/site-config';
    const id = file.filename.replace(extension, '');
    const originalPublic = `${publicDir}/${file.filename}`;

    if (SKIP_PROCESS_EXTENSIONS.has(extension)) {
      const meta = await sharp(file.path).metadata();
      return {
        publicPath: originalPublic,
        filename: file.filename,
        width: meta.width ?? 180,
        height: meta.height ?? 50,
      };
    }

    const outFilename = `${id}_transparent.png`;
    const outDiskPath = join('uploads', 'site-config', outFilename);
    const outPublicPath = `${publicDir}/${outFilename}`;

    try {
      const { width, height } = await this.processLogoToFile(
        file.path,
        outDiskPath,
      );

      try {
        await unlink(file.path);
      } catch {
        /* ignore — original upload cleanup is best-effort */
      }

      return {
        publicPath: outPublicPath,
        filename: outFilename,
        width,
        height,
      };
    } catch (err) {
      this.logger.warn(
        `Logo background removal failed for ${file.filename}; serving original. ${String(err)}`,
      );
      const meta = await sharp(file.path).metadata();
      return {
        publicPath: originalPublic,
        filename: file.filename,
        width: meta.width ?? 180,
        height: meta.height ?? 50,
      };
    }
  }

  /**
   * Remove checkerboard background from a source image and write a cropped transparent PNG.
   * Can be used by upload handler and one-off maintenance scripts.
   */
  async processLogoToFile(
    sourcePath: string,
    destPath: string,
  ): Promise<{ width: number; height: number }> {
    const { data, info } = await sharp(sourcePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const rgba = removeCheckerboardBackground(
      data,
      info.width,
      info.height,
      info.channels,
    );

    const bounds = findAlphaBounds(rgba, info.width, info.height);
    if (!bounds) {
      throw new Error('No foreground pixels detected after background removal');
    }

    const pad = OUTPUT_PADDING_PX;
    const left = Math.max(0, bounds.left - pad);
    const top = Math.max(0, bounds.top - pad);
    const right = Math.min(
      info.width - 1,
      bounds.left + bounds.width - 1 + pad,
    );
    const bottom = Math.min(
      info.height - 1,
      bounds.top + bounds.height - 1 + pad,
    );
    const cropWidth = right - left + 1;
    const cropHeight = bottom - top + 1;

    await sharp(rgba, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .png({ compressionLevel: 9, palette: false })
      .toFile(destPath);

    return { width: cropWidth, height: cropHeight };
  }
}
