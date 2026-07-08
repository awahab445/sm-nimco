import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { DealPricingPanel } from '@/components/deals/deal-pricing-panel';
import { fetchBundleDealBySlug } from '@/lib/deals/deals.server';
import { formatVariantAttributes } from '@/lib/format-variant-attributes';
import { storefrontUi } from '@/lib/storefront-ui';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const deal = await fetchBundleDealBySlug(slug);
  if (!deal) return { title: 'Deal not found' };
  return {
    title: deal.title,
    description: deal.description ?? `Bundle deal — save ${formatPrice(deal.savingsAmount)}`,
  };
}

export default async function DealDetailPage({ params }: Props) {
  const { slug } = await params;
  const deal = await fetchBundleDealBySlug(slug);
  if (!deal) notFound();

  const heroImageSrc = resolveImageUrl(deal.imageUrl);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm">
        <Link href="/deals" className={storefrontUi.link}>
          ← All bundle deals
        </Link>
      </nav>

      <div className="mb-10">
        {heroImageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImageSrc}
            alt={deal.title}
            className="mb-6 h-64 w-full rounded-lg object-cover md:h-80"
          />
        ) : null}
        <h1 className="text-3xl font-bold text-foreground">{deal.title}</h1>
        {deal.description ? (
          <p className="mt-3 max-w-3xl text-muted-foreground">{deal.description}</p>
        ) : null}
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-foreground">What&apos;s included</h2>
          <ul className="mt-4 space-y-4">
            {(deal.items ?? []).map((item) => {
              const image = resolveImageUrl(item.product?.images?.[0]?.url);
              const listPrice = item.unitListPrice ?? item.variant?.price;
              const variantLabels =
                item.variant?.variantAttributes?.filter((label) => label.trim().length > 0) ??
                formatVariantAttributes((item.variant?.attributes as Record<string, unknown> | undefined) ?? undefined);
              return (
                <li
                  key={item.id}
                  className={`${storefrontUi.card} flex items-start gap-3 p-4 sm:items-center sm:gap-4`}
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="h-16 w-16 rounded object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded bg-secondary/40 text-xs text-muted-foreground">
                      —
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-y-1">
                      <p className="font-medium text-foreground">
                        {item.product?.name ?? 'Product'}
                      </p>
                      {item.quantity > 1 ? (
                        <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          ×{item.quantity}
                        </span>
                      ) : null}
                    </div>
                    {variantLabels.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {variantLabels.map((label, index) => (
                          <span
                            key={`${item.id}-${index}-${label}`}
                            className="inline-flex max-w-full items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground"
                          >
                            <span className="truncate">{label}</span>
                          </span>
                        ))}
                      </div>
                    ) : item.variant?.name && item.variant.name !== item.product?.name ? (
                      <p className="mt-1 text-sm text-muted-foreground">{item.variant.name}</p>
                    ) : null}
                  </div>
                  {listPrice != null ? (
                    <div className="mt-1 flex shrink-0 items-center justify-end self-start text-right sm:mt-0 sm:self-center">
                      {item.quantity > 1 ? (
                        <div className="flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-0.5">
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {formatPrice(Number(listPrice) * item.quantity)}
                          </span>
                          <span className="text-xs font-normal tabular-nums text-muted-foreground">
                            ({formatPrice(Number(listPrice))} each)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold tabular-nums text-primary">
                          {formatPrice(Number(listPrice))}
                        </span>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <aside>
          <DealPricingPanel deal={deal} />
        </aside>
      </div>
    </div>
  );
}
