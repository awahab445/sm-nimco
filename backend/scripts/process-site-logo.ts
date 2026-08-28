/**
 * One-off / maintenance script: process a logo file to remove baked-in checkerboard
 * background and save a cropped transparent PNG.
 *
 * Usage:
 *   npm run logo:process -- [sourcePath] [destPath]
 *
 * Defaults:
 *   source: ../frontend/public/logo.png
 *   dest:   uploads/site-config/logo_transparent.png
 */
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { SiteConfigLogoImageService } from '../src/site-config/services/site-config-logo-image.service';

async function main() {
  const sourcePath =
    process.argv[2] ?? join(process.cwd(), '..', 'frontend', 'public', 'logo.png');
  const destPath =
    process.argv[3] ??
    join(process.cwd(), 'uploads', 'site-config', 'logo_transparent.png');

  await mkdir(dirname(destPath), { recursive: true });

  const service = new SiteConfigLogoImageService();
  const { width, height } = await service.processLogoToFile(sourcePath, destPath);

  console.log(`Processed logo saved to ${destPath} (${width}x${height}px, transparent PNG)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
