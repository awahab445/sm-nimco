'use client';

import { DEFAULT_BANNER_IMAGE } from '@/lib/brands/brand-config';
import { StorefrontImage } from '@/components/ui/storefront-image';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  /** Kept for call-site compatibility (was used for image error logging). */
  debugLabel?: string;
};

/**
 * Deal hero / card media. Resized via `/_next/image`; onError → placeholder.
 * The parent must be `position: relative` with a size (both call sites are).
 */
export function DealBannerImage({
  src,
  alt,
  className = 'absolute inset-0 h-full w-full object-contain',
  priority = false,
}: Props) {
  return (
    <StorefrontImage
      src={src?.trim() || DEFAULT_BANNER_IMAGE}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 1200px"
      priority={priority}
      fallbackSrc={DEFAULT_BANNER_IMAGE}
      className={className}
    />
  );
}
