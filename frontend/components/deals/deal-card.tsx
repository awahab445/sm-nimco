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

const PREVIEW_THUMB_LIMIT = 4;

function BundleItemPreviewStrip({ deal }: { deal: StorefrontBundleDeal }) {
  const thumbs = (deal.items ?? [])
    .map((item) => {
      const url = resolveImageUrl(item.product?.images?.[0]?.url);
      if (!url) return null;
      return {
        id: item.id,
        url,
        name: item.product?.name ?? 'Bundle item',
      };
    })
    .filter((t): t is { id: string; url: string; name: string } => t != null)
    .slice(0, PREVIEW_THUMB_LIMIT);

  if (thumbs.length === 0) return null;

  const remaining = Math.max(0, (deal.itemCount ?? deal.items?.length ?? 0) - thumbs.length);

  return (
    <div className="mt-3 flex items-center gap-1.5" aria-label="Products included in this bundle">
      <div className="flex -space-x-2">
        {thumbs.map((thumb) => (
          <div
            key={thumb.id}
            className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-card bg-[var(--brand-bg-light,#f8f6f0)]"
            title={thumb.name}
          >
            <StorefrontImage
              src={thumb.url}
              alt=""
              fill
              sizes="36px"
              className="object-contain object-center p-0.5"
              loading="lazy"
              quality={60}
            />
          </div>
        ))}
      </div>
      {remaining > 0 ? (
        <span className="text-[11px] font-semibold text-muted-foreground">+{remaining} more</span>
      ) : (
        <span className="text-[11px] font-medium text-muted-foreground">Included</span>
      )}
    </div>
  );
}

export function DealCard({ deal, featured }: Props) {
  const itemLabel = deal.itemCount != null ? `${deal.itemCount} items` : 'Bundle';
  const imageSrc = resolveImageUrl(deal.imageUrl);
  const discountPercent = getBundleDiscountPercent(deal);

  return (
    <article
      className={`group ${storefrontUi.card} overflow-hidden border border-border shadow-product-card transition-shadow hover:shadow-lg ${
        featured ? 'flex flex-col md:flex-row md:items-stretch' : ''
      }`}
    >
      <Link
        href={`/deals/${deal.slug}`}
        className={
          featured
            ? 'relative flex w-full shrink-0 items-center justify-center overflow-hidden bg-[var(--brand-bg-light,#f8f6f0)] p-2 aspect-[4/3] sm:aspect-[16/10] md:aspect-auto md:min-h-[20rem] md:w-1/2'
            : 'relative flex h-48 items-center justify-center overflow-hidden bg-[var(--brand-bg-light,#f8f6f0)] p-2 sm:h-52'
        }
      >
        {imageSrc ? (
          <div className="relative h-full w-full">
            <StorefrontImage
              src={imageSrc}
              alt={deal.title}
              fill
              sizes={featured ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
              className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              quality={70}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Bundle
          </div>
        )}
      </Link>
      <div
        className={`relative flex flex-col p-5 pr-20 ${
          featured ? 'md:w-1/2 md:justify-center' : ''
        }`}
      >
        {discountPercent != null ? <BundleDiscountBadge percent={discountPercent} /> : null}
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{itemLabel}</p>
        <h2 className="font-display mt-1 text-lg font-semibold tracking-tight text-foreground">
          <Link href={`/deals/${deal.slug}`} className="hover:text-primary">
            {deal.title}
          </Link>
        </h2>
        <BundleItemPreviewStrip deal={deal} />
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
