'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  isBackendAssetUrl,
} from '@/lib/resolve-image-url';

type Props = Omit<ImageProps, 'src'> & {
  src: string;
  /** Additional candidates tried (in order) before the placeholder. */
  fallbackSrcs?: string[];
};

/**
 * next/image wrapper for storefront media.
 * Absolute / API-hosted assets use `unoptimized` to avoid optimizer 400s on
 * cross-origin uploads. On load failure, tries `fallbackSrcs` then placeholder.
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
  const isSvg = /\.svg(?:$|\?)/i.test(currentSrc);
  // Always skip the optimizer for API uploads + SVG (avoids /_next/image 400s).
  const unoptimized =
    isSvg || isAbsolute || isBackendAssetUrl(currentSrc);

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
