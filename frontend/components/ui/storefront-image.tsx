'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { DEFAULT_BANNER_IMAGE } from '@/lib/brands/brand-config';
import { getPublicApiOrigin, resolveImageUrl } from '@/lib/resolve-image-url';

type Props = Omit<ImageProps, 'src'> & {
  src: string;
  /** Additional candidates tried (in order) before the placeholder. */
  fallbackSrcs?: string[];
};

function shouldSkipOptimization(src: string): boolean {
  if (src.endsWith('.svg')) return true;
  // API uploads are in next.config remotePatterns; other hosts would get a 400 from `/_next/image`.
  if (/^https?:\/\//i.test(src)) return !src.startsWith(`${getPublicApiOrigin()}/`);
  return false;
}

/**
 * next/image wrapper for storefront media.
 * - Resolves `/uploads` to absolute API/CDN URLs
 * - Defaults to native lazy loading unless `priority` is set
 * - Resizes API uploads via `/_next/image` (skips other remote hosts); swaps to placeholder on error
 */
export function StorefrontImage({
  src,
  fallbackSrcs = [],
  alt,
  onError,
  ...rest
}: Props) {
  const candidates = [src, ...fallbackSrcs].filter(
    (value, index, all) => Boolean(value) && all.indexOf(value) === index,
  );
  const candidateKey = candidates.join('|');

  const [attempt, setAttempt] = useState({ key: candidateKey, index: 0 });
  const index = attempt.key === candidateKey ? attempt.index : 0;
  const currentSrc =
    index < candidates.length ? candidates[index]! : PRODUCT_IMAGE_PLACEHOLDER;

  const isAbsolute = /^https?:\/\//i.test(currentSrc);
  const isUploads = currentSrc.startsWith('/uploads/') || currentSrc.includes('/uploads/');
  const isSvg = /\.svg(?:$|\?)/i.test(currentSrc);
  // Always skip the optimizer for API uploads + SVG (avoids /_next/image 400s).
  const unoptimized =
    isSvg || isAbsolute || isUploads || isBackendAssetUrl(currentSrc);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized}
      onError={(e) => {
        if (index < candidates.length) {
          setAttempt({ key: candidateKey, index: index + 1 });
        }
        onError?.(e);
      }}
      {...rest}
    />
  );
}
