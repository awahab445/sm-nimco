import type { TrustBadgeItem } from '@/lib/cms/home-page-types';
import { Headphones, RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';

interface TrustBadgesSectionProps {
  items: TrustBadgeItem[];
}

const TRUST_ICONS: LucideIcon[] = [ShieldCheck, Truck, RotateCcw, Headphones];

export function TrustBadgesSection({ items }: TrustBadgesSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-border/70 py-8 sm:py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-8 sm:gap-10 lg:grid-cols-4 lg:gap-8">
        {items.map((item, index) => {
          const Icon = TRUST_ICONS[index % TRUST_ICONS.length];

          return (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2.5 text-center sm:gap-3"
            >
              <span className="inline-flex shrink-0 text-foreground">
                <Icon className="h-5 w-5 stroke-[1.2]" aria-hidden />
              </span>
              <div>
                <h3 className="text-xs font-medium tracking-wide text-foreground sm:text-sm">{item.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
