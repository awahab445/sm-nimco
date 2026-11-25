import { mkdtemp, readFile, rm, stat, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';
import { compressImageInPlace, MAX_IMAGE_SIDE } from './compress-image.util';

describe('compressImageInPlace', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'compress-'));
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it('shrinks a large JPEG to MAX_IMAGE_SIDE, same format, smaller file', async () => {
    const path = join(dir, 'big.jpg');
    const noise = Buffer.alloc(2400 * 1800 * 3);
    for (let i = 0; i < noise.length; i++) noise[i] = (i * 2654435761) % 251;
    await writeFile(
      path,
      await sharp(noise, { raw: { width: 2400, height: 1800, channels: 3 } })
        .jpeg({ quality: 100 })
        .toBuffer(),
    );
    const before = (await stat(path)).size;

    await compressImageInPlace(path);

    const meta = await sharp(path).metadata();
    expect(meta.format).toBe('jpeg');
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBe(MAX_IMAGE_SIDE);
    expect((await stat(path)).size).toBeLessThan(before);
  });

  it('keeps a file it cannot read', async () => {
    const path = join(dir, 'broken.jpg');
    await writeFile(path, 'not an image');
    await compressImageInPlace(path);
    expect(await readFile(path, 'utf8')).toBe('not an image');
  });
});
