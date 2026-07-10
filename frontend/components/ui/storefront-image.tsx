import Image, { type ImageProps } from 'next/image';

type Props = Omit<ImageProps, 'src'> & {
  src: string;
};

/**
 * next/image wrapper for storefront media.
 * Same-origin paths (`/uploads/...`, `/logo.png`) are optimized;
 * unknown absolute URLs skip the optimizer to avoid remotePatterns churn.
 */
export function StorefrontImage({ src, alt, ...rest }: Props) {
  const isAbsolute = /^https?:\/\//i.test(src);

  return <Image src={src} alt={alt} unoptimized={isAbsolute} {...rest} />;
}
