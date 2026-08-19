import Link from 'next/link';
import Image from 'next/image';
import type { CategoryTreeItem } from '@/lib/api-client';
import { resolveImageUrl } from '@/lib/resolve-image-url';

const FALLBACK_CATEGORIES = [
  { name: 'Special Nimco', subtitle: '12+ Varieties', href: '/products' },
  { name: 'Fresh Mithai', subtitle: 'Pure Khoya Sweets', href: '/products' },
  { name: 'Bakery Items', subtitle: 'Biscuits & Cakes', href: '/products' },
  { name: 'Gift Boxes', subtitle: 'Festive Packs', href: '/products' },
] as const;

interface SmNimcoCategoriesBannerProps {
  categories: CategoryTreeItem[];
}

export function SmNimcoCategoriesBanner({ categories }: SmNimcoCategoriesBannerProps) {
  const cards =
    categories.length > 0
      ? categories.map((c) => ({
          name: c.name,
          subtitle:
            typeof c.productCount === 'number' && c.productCount > 0
              ? `${c.productCount}+ items`
              : 'Shop collection',
          href: `/categories/${c.slug}`,
          bannerUrl: resolveImageUrl(c.bannerUrl),
        }))
      : FALLBACK_CATEGORIES.map((c) => ({ ...c, bannerUrl: undefined }));

  return (
    <section
      id="featured-categories"
      className="scroll-mt-28 mx-auto max-w-7xl px-4 py-12 sm:py-14"
      aria-labelledby="featured-categories-heading"
    >
      <div className="mb-8 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-gold-hover,#b89628)]">
          Shop by collection
        </span>
        <h2
          id="featured-categories-heading"
          className="font-heading mt-1 text-2xl font-extrabold text-[var(--brand-purple-dark,#1e1035)] sm:text-3xl"
        >
          Featured Categories
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={`${card.href}-${card.name}`}
            href={card.href}
            className="group relative aspect-[4/5] h-auto w-full min-w-0 overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-[var(--brand-gold-primary,#d4af37)] hover:shadow-md sm:aspect-[3/4] lg:aspect-auto lg:h-56 xl:h-60"
          >
            {card.bannerUrl ? (
              <Image
                src={card.bannerUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-purple-dark,#1e1035)] to-[var(--brand-gold-primary,#d4af37)]/80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 lg:p-3">
              <h3 className="font-heading line-clamp-2 text-xs font-extrabold text-white sm:text-sm lg:text-sm">
                {card.name}
              </h3>
              <p className="mt-0.5 text-[10px] text-white/80 lg:text-[11px]">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
