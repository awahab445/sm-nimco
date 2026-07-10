import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { storefrontUi } from '@/lib/storefront-ui';
import type { StorefrontBundleDeal } from '@/lib/deals/deals.server';
import { getBundleDiscountPercent } from '@/lib/deals/discount-badge';
import { BundleDiscountBadge } from '@/components/deals/bundle-discount-badge';
import { StorefrontImage } from '@/components/ui/storefront-image';

type Props = {
  deal: StorefrontBundleDeal;
  featured?: boolean;
};

export function DealCard({ deal, featured }: Props) {
  const itemLabel = deal.itemCount != null ? `${deal.itemCount} items` : 'Bundle';
  const imageSrc = resolveImageUrl(deal.imageUrl);
  const discountPercent = getBundleDiscountPercent(deal);

  return (
    <article
      className={`${storefrontUi.card} overflow-hidden transition-shadow hover:shadow-lg ${
        featured ? 'md:col-span-2 md:flex' : ''
      }`}
    >
      <Link
        href={`/deals/${deal.slug}`}
        className={`relative block ${featured ? 'md:w-1/2' : ''} ${featured ? 'h-64 md:h-auto md:min-h-[16rem]' : 'h-48'}`}
      >
        {imageSrc ? (
          <StorefrontImage
            src={imageSrc}
            alt={deal.title}
            fill
            sizes={featured ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
            className="object-cover"
            loading="lazy"
            quality={70}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/40 text-muted-foreground">
            Bundle
          </div>
        )}
      </Link>
      <div
        className={`relative flex flex-col p-5 pr-20 ${featured ? 'md:w-1/2 md:justify-center' : ''}`}
      >
        {discountPercent != null ? <BundleDiscountBadge percent={discountPercent} /> : null}
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{itemLabel}</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          <Link href={`/deals/${deal.slug}`} className="hover:text-primary">
            {deal.title}
          </Link>
        </h2>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(deal.compareAtTotal)}
          </span>
          <span className="text-xl font-bold text-foreground">{formatPrice(deal.dealPrice)}</span>
        </div>
        {deal.savingsAmount > 0 ? (
          <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Save {formatPrice(deal.savingsAmount)}
            {deal.savingsPercent != null ? ` (${deal.savingsPercent}%)` : ''}
          </p>
        ) : null}
        <Link href={`/deals/${deal.slug}`} className={`${storefrontUi.btnPrimary} mt-4 inline-block text-center`}>
          View deal
        </Link>
      </div>
    </article>
  );
}
