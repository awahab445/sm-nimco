import Link from 'next/link';
import type { CategoryTreeItem } from '@/lib/api-client';

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
        }))
      : FALLBACK_CATEGORIES.map((c) => ({ ...c }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={`${card.href}-${card.name}`}
            href={card.href}
            className="flex cursor-pointer items-center space-x-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[var(--brand-gold-primary,#d4af37)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-bg-light,#faf8f5)] text-xl text-[var(--brand-purple-dark,#1e1035)]">
              <span className="font-heading text-sm font-extrabold" aria-hidden>
                {card.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-[var(--brand-purple-dark,#1e1035)]">
                {card.name}
              </h4>
              <p className="text-[10px] text-gray-500">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
