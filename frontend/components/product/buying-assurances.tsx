import Link from 'next/link';
import { Banknote, RotateCcw, Truck } from 'lucide-react';
import { policyPageHref } from '@/lib/cms/policy-pages';
import { formatPrice } from '@/lib/currency';
import type { StoreFacts } from '@/lib/store-facts';

/** Payment, delivery and returns facts shown next to the buy button (server component). */
export function BuyingAssurances({ facts }: { facts: StoreFacts }) {
  const cod = facts.paymentMethods.some((m) => /cash on delivery|\bcod\b/i.test(m));
  const payment = cod
    ? 'Cash on Delivery: pay when your order arrives'
    : facts.paymentMethods.length
      ? `Pay by ${facts.paymentMethods.join(', ')}`
      : null;
  const freeDelivery = facts.freeDeliveryThreshold
    ? ` Free in Karachi over ${formatPrice(facts.freeDeliveryThreshold)}.`
    : '';

  return (
    <ul className="space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
      {payment ? (
        <li className="flex items-start gap-2.5">
          <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden />
          <span>{payment}</span>
        </li>
      ) : null}
      <li className="flex items-start gap-2.5">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden />
        <span>Delivery in 1–2 days in Karachi, 3–7 days to other cities.{freeDelivery}</span>
      </li>
      <li className="flex items-start gap-2.5">
        <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden />
        <span>
          7-day returns.{' '}
          <Link href={policyPageHref('shipping-returns')} className="underline underline-offset-2 hover:text-foreground">
            Shipping &amp; returns
          </Link>
        </span>
      </li>
    </ul>
  );
}
