import Link from 'next/link';

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
      className={`relative overflow-hidden rounded-2xl border border-border ${
        isPrimary ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-foreground'
      }`}
    >
      {imageUrl && (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/40" />
        </>
      )}
      <div className="relative flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between md:p-10">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
          {subtitle && (
            <p className={`mt-2 text-sm md:text-base ${isPrimary ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className={`inline-flex shrink-0 justify-center rounded-md px-5 py-2.5 text-sm font-medium shadow-sm transition-opacity hover:opacity-90 ${
              isPrimary
                ? 'border border-primary-foreground/40 bg-primary-foreground text-primary'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
