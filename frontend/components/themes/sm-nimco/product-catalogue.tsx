import Link from 'next/link';
import type { Product } from '@/lib/api-client';
import { SmNimcoProductCard } from './product-card';

interface SmNimcoProductCatalogueProps {
  products: Product[];
  availability: Record<string, number>;
}

export function SmNimcoProductCatalogue({
  products,
  availability,
}: SmNimcoProductCatalogueProps) {
  return (
    <section
      id="featured-products"
      className="mx-auto max-w-7xl px-4 py-8 pb-16"
      aria-labelledby="featured-products-heading"
    >
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-gold-hover,#b89628)]">
            Handcrafted Fresh Daily
          </span>
          <h2
            id="featured-products-heading"
            className="font-heading text-2xl font-extrabold text-[var(--brand-purple-dark,#1e1035)] sm:text-4xl"
          >
            Featured Products
          </h2>
        </div>
        <Link
          href="/products"
          className="shrink-0 text-sm font-bold text-[var(--brand-purple-dark,#1e1035)] transition-colors hover:text-[var(--brand-gold-hover,#b89628)]"
        >
          View Full Catalogue →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-14 text-center text-sm text-muted-foreground">
          No products available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 py-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            return (
              <SmNimcoProductCard
                key={product.id}
                product={product}
                availabilityByVariant={availability}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
