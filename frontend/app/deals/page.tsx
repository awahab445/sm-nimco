import { DealCard } from '@/components/deals/deal-card';
import { fetchBundleDeals } from '@/lib/deals/deals.server';
import { buildPageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = buildPageMetadata({
  title: 'Bundle Deals',
  description: 'Save more when you buy curated product bundles.',
  path: '/deals',
});

export default async function DealsPage() {
  const deals = await fetchBundleDeals();
  const featured = deals.find((d) => d.isFeatured);
  const rest = deals.filter((d) => d.id !== featured?.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bundle Deals</h1>
        <p className="mt-2 text-muted-foreground">
          Hand-picked product bundles at special prices — more value in every order.
        </p>
      </header>

      {deals.length === 0 ? (
        <p className="text-center text-muted-foreground">No active bundle deals right now. Check back soon!</p>
      ) : (
        <div className="space-y-10">
          {featured ? (
            <section>
              <DealCard deal={featured} featured />
            </section>
          ) : null}
          {rest.length > 0 ? (
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
