/** Pixel classifier for logos exported with a baked-in gray/white checkerboard. */

export type LogoPixelClassification = {
  /** Whether the pixel belongs to foreground artwork (gold icon or white text). */
  isForeground: boolean;
  /** Resulting alpha channel value (0–255). */
  alpha: number;
};

/**
 * Classify a single RGB pixel for checkerboard removal while preserving:
 * - Gold "SM" icon tones (warm yellow/gold hues)
 * - White "Nimco & Sweets" text (high-luminance neutrals)
 */
export function classifyLogoPixel(
  r: number,
  g: number,
  b: number,
): LogoPixelClassification {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const neutral =
    Math.abs(r - g) <= 18 && Math.abs(g - b) <= 18 && Math.abs(r - b) <= 18;

  // Crisp white wordmark
  if (neutral && min >= 165) {
    return { isForeground: true, alpha: 255 };
  }

  // Gold icon — warm hue with R dominant
  if (r > 130 && g > 85 && b < 95 && r >= g && g >= b - 10) {
    return { isForeground: true, alpha: 255 };
  }
  if (saturation > 0.18 && r > g && g > b && b < 100) {
    return { isForeground: true, alpha: 255 };
  }

  // Neutral gray / white checkerboard squares
  if (neutral && max < 150) {
    return { isForeground: false, alpha: 0 };
  }

  // Compression/chroma spikes on gray background (e.g. green channel artifacts)
  if (!neutral && max - min > 100 && min < 80) {
    return { isForeground: false, alpha: 0 };
  }

  // Light neutral checkerboard tiles that are not white text
  if (neutral && max >= 150 && min < 165) {
    return { isForeground: false, alpha: 0 };
  }

  // Anti-aliased gold/white edges — keep with full opacity
  return { isForeground: true, alpha: 255 };
}

export type AlphaBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Tight bounding box of pixels with alpha above the given threshold. */
export function findAlphaBounds(
  rgba: Buffer,
  width: number,
  height: number,
  alphaThreshold = 10,
): AlphaBounds | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = rgba[(y * width + x) * 4 + 3];
      if (alpha <= alphaThreshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0 || maxY < 0) return null;

  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/** Apply checkerboard removal to a raw RGB/RGBA buffer and return RGBA output. */
export function removeCheckerboardBackground(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
): Buffer {
  const out = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * channels;
      const r = data[src];
      const g = data[src + 1];
      const b = data[src + 2];
      const { alpha } = classifyLogoPixel(r, g, b);
      const dst = (y * width + x) * 4;
      out[dst] = r;
      out[dst + 1] = g;
      out[dst + 2] = b;
      out[dst + 3] = alpha;
    }
  }

  return out;
}
