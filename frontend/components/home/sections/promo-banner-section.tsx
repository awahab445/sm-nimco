import Link from 'next/link';
import { storefrontUi } from '@/lib/storefront-ui';
import { StorefrontImage } from '@/components/ui/storefront-image';

interface PromoBannerSectionProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  tone?: 'primary' | 'muted';
}

export function PromoBannerSection({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  imageUrl,
  tone = 'muted',
}: PromoBannerSectionProps) {
  const isPrimary = tone === 'primary';

  return (
    <section
      className={`promo-banner-chrome relative overflow-hidden rounded-2xl border ${
        isPrimary ? '' : 'promo-banner-chrome--muted'
      }`}
    >
      {imageUrl && (
        <>
          <StorefrontImage
            src={imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            loading="lazy"
            quality={60}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--footer-background,var(--navbar-background))]/95 to-[var(--footer-background,var(--navbar-background))]/40" />
        </>
      )}
      <div className="relative flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between md:p-10">
        <div className="max-w-xl">
          <h2 className="promo-banner-chrome__title text-xl font-bold tracking-tight md:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="promo-banner-chrome__subtitle mt-2 text-sm md:text-base">{subtitle}</p>
          )}
        </div>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className={`shrink-0 ${storefrontUi.btnPrimary} ${
              isPrimary ? 'px-6 py-3 shadow-md transition-shadow hover:shadow-lg' : ''
            }`}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
