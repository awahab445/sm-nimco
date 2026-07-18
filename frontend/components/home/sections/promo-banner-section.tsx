import Link from 'next/link';
import { storefrontUi } from '@/lib/storefront-ui';
import { StorefrontImage } from '@/components/ui/storefront-image';

export type PromoBannerTextAlign = 'left' | 'center' | 'right';
export type PromoBannerButtonStyle = 'primary' | 'secondary';

interface PromoBannerSectionProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  backgroundColor?: string;
  productImageUrl?: string;
  textAlign?: PromoBannerTextAlign;
  buttonStyle?: PromoBannerButtonStyle;
  tone?: 'primary' | 'muted';
  /** When true, fills a mosaic cell (no outer negative margins). */
  mosaic?: boolean;
}

function alignClass(textAlign: PromoBannerTextAlign): string {
  if (textAlign === 'center') return 'items-center text-center';
  if (textAlign === 'right') return 'items-end text-right';
  return 'items-start text-left';
}

export function PromoBannerSection({
  title,
  eyebrow,
  subtitle,
  ctaLabel,
  ctaHref,
  imageUrl,
  backgroundColor,
  productImageUrl,
  textAlign = 'left',
  buttonStyle = 'primary',
  tone = 'muted',
  mosaic = false,
}: PromoBannerSectionProps) {
  const isPrimary = tone === 'primary';
  const hasBgImage = Boolean(imageUrl);
  const hasProduct = Boolean(productImageUrl);
  const hasSolidBg = Boolean(backgroundColor) || (!hasBgImage && !backgroundColor);

  const shellClass = mosaic
    ? 'promo-banner-kalles relative flex h-full min-h-[12.5rem] overflow-hidden sm:min-h-[15rem] lg:min-h-[17rem]'
    : hasBgImage || backgroundColor
      ? 'promo-banner-kalles relative -mx-3 flex min-h-[14rem] overflow-hidden sm:-mx-6 sm:min-h-[18rem] lg:-mx-8 lg:min-h-[20rem]'
      : `promo-banner-kalles relative -mx-3 flex overflow-hidden sm:-mx-6 lg:-mx-8 ${
          isPrimary ? 'bg-foreground text-background' : 'bg-secondary text-foreground'
        }`;

  const onPhoto = hasBgImage;
  const textTone = onPhoto
    ? 'text-background'
    : isPrimary && !backgroundColor
      ? 'text-background'
      : 'text-foreground';
  const mutedTone = onPhoto
    ? 'text-background/80'
    : isPrimary && !backgroundColor
      ? 'text-background/75'
      : 'text-muted-foreground';

  const ctaClass =
    buttonStyle === 'secondary'
      ? `promo-banner-kalles__cta promo-banner-kalles__cta--secondary inline-flex w-fit shrink-0 ${storefrontUi.btnSecondary} px-5 py-2.5`
      : `promo-banner-kalles__cta promo-banner-kalles__cta--primary inline-flex w-fit shrink-0 ${storefrontUi.btnPrimary} px-5 py-2.5`;

  const content = (
    <div
      className={`promo-banner-kalles__content relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-2 p-5 sm:gap-2.5 sm:p-7 md:p-8 ${alignClass(textAlign)} ${
        hasProduct ? 'pb-32 sm:max-w-[58%] sm:pb-7 md:pb-8' : 'w-full'
      }`}
    >
      {eyebrow ? (
        <p
          className={`promo-banner-kalles__eyebrow text-[0.65rem] font-semibold uppercase tracking-[0.18em] sm:text-xs ${mutedTone}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`promo-banner-kalles__title font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl md:text-[1.65rem] ${textTone}`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className={`promo-banner-kalles__subtitle text-sm leading-relaxed md:text-[0.95rem] ${mutedTone}`}>
          {subtitle}
        </p>
      ) : null}
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className={`mt-1 ${ctaClass}`}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );

  return (
    <section
      className={shellClass}
      style={
        backgroundColor && !hasBgImage
          ? { backgroundColor }
          : backgroundColor && hasBgImage
            ? { backgroundColor }
            : undefined
      }
    >
      {hasBgImage ? (
        <StorefrontImage
          src={imageUrl!}
          alt=""
          fill
          sizes={mosaic ? '(max-width: 768px) 100vw, 33vw' : '100vw'}
          className="promo-banner-kalles__media object-cover"
          loading="lazy"
          quality={70}
        />
      ) : null}

      {/* Product under scrim so lining shades media but stays below copy */}
      {hasProduct ? (
        <div className="promo-banner-kalles__product-wrap absolute inset-x-0 bottom-0 z-0 h-28 overflow-hidden sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[42%]">
          <StorefrontImage
            src={productImageUrl!}
            alt=""
            fill
            sizes={mosaic ? '(max-width: 640px) 80vw, (max-width: 768px) 40vw, 15vw' : '30vw'}
            className="promo-banner-kalles__product object-contain object-bottom p-3 sm:p-4"
            loading="lazy"
            quality={75}
          />
        </div>
      ) : null}

      {/* Scrim above media/product, below copy (z-10). Softened further under essa_chemicals. */}
      {hasBgImage || hasProduct ? (
        <div
          className={`promo-banner-kalles__scrim pointer-events-none absolute inset-0 z-[1] ${
            hasBgImage
              ? 'promo-banner-kalles__scrim--photo'
              : 'promo-banner-kalles__scrim--solid'
          }`}
          aria-hidden
        />
      ) : null}

      <div
        className={`relative z-10 flex h-full w-full flex-col ${
          !hasBgImage && hasSolidBg && !backgroundColor && isPrimary ? 'text-background' : ''
        }`}
      >
        {content}
      </div>
    </section>
  );
}
