import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { DealPricingPanel } from '@/components/deals/deal-pricing-panel';
import { DealIncludedItems } from '@/components/deals/deal-included-items';
import { fetchBundleDealBySlug } from '@/lib/deals/deals.server';
import { buildPageMetadata, plainText } from '@/lib/seo';
import { storefrontUi } from '@/lib/storefront-ui';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const deal = await fetchBundleDealBySlug(slug);
  if (!deal) {
    return { title: 'Deal not found', robots: { index: false, follow: false } };
  }
  return buildPageMetadata({
    title: deal.title,
    description:
      plainText(deal.description) ||
      `Bundle deal — save ${formatPrice(deal.savingsAmount)}`,
    path: `/deals/${deal.slug}`,
    image: resolveImageUrl(deal.imageUrl),
  });
}

export default async function DealDetailPage({ params }: Props) {
  const { slug } = await params;
  const deal = await fetchBundleDealBySlug(slug);
  if (!deal) notFound();

  const heroImageSrc = resolveImageUrl(deal.imageUrl);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm">
        <Link href="/deals" className={storefrontUi.link}>
          ← All bundle deals
        </Link>
      </nav>

      <div className="mb-10">
        {heroImageSrc ? (
          <div className="mb-6 w-full overflow-hidden rounded-lg bg-[#f8f6f0] p-2 aspect-[2/1] md:aspect-[3/1]">
            { }
            <img
              src={heroImageSrc}
              alt={deal.title}
              className="h-full w-full object-contain object-center"
            />
          </div>
        ) : null}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {deal.title}
        </h1>
        {deal.description ? (
          <p className="mt-3 max-w-3xl text-muted-foreground">{deal.description}</p>
        ) : null}
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            What&apos;s included
          </h2>
          <DealIncludedItems items={deal.items ?? []} />
        </section>

        <aside>
          <DealPricingPanel deal={deal} />
        </aside>
      </div>
    </div>
  );
}
