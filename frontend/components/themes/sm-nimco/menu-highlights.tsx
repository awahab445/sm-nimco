import Link from 'next/link';
import type { Product } from '@/lib/api-client';
import { formatPrice } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { imageAlt } from '@/lib/seo';
import { StorefrontImage } from '@/components/ui/storefront-image';

interface SmNimcoMenuHighlightsProps {
  products: Product[];
}

export function SmNimcoMenuHighlights({ products }: SmNimcoMenuHighlightsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 font-heading text-3xl font-extrabold text-[var(--brand-purple-dark,#1e1035)] sm:text-5xl">
          From Kitchen to Table, Always Fresh
        </h2>
        <p className="text-sm leading-relaxed text-gray-500 sm:text-base">
          Handcrafted daily with pure ingredients, crisp Karachi spices, and traditional recipes
          passed through generations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
        {products.map((product) => {
          const image = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
          const imageUrl = resolveImageUrl(image?.url);

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex cursor-pointer items-center space-x-6"
            >
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-100 bg-amber-50 transition-transform group-hover:scale-105 sm:h-32 sm:w-32">
                {imageUrl ? (
                  <StorefrontImage
                    src={imageUrl}
                    alt={imageAlt(image, product.name)}
                    fill
                    sizes="128px"
                    className="object-contain p-2"
                    loading="lazy"
                    quality={70}
                  />
                ) : (
                  <span className="font-heading text-2xl font-bold text-[var(--brand-purple-dark,#1e1035)]">
                    {product.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-2xl font-bold text-[var(--brand-purple-dark,#1e1035)] transition group-hover:text-[var(--brand-gold-hover,#b89628)]">
                  {product.name}
                </h3>
                <div className="mt-2">
                  <span className="inline-block rounded-full border border-[var(--brand-burgundy,#9b1d48)]/20 bg-[var(--brand-burgundy,#9b1d48)]/10 px-3 py-1 text-sm font-extrabold text-[var(--brand-burgundy,#9b1d48)] sm:text-base">
                    {formatPrice(product.basePrice)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
