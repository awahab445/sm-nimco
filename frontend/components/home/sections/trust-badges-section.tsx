import type { TrustBadgeItem } from '@/lib/cms/home-page-types';

interface TrustBadgesSectionProps {
  items: TrustBadgeItem[];
}

export function TrustBadgesSection({ items }: TrustBadgesSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="text-center lg:text-left">
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
