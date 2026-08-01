import { formatPrice } from '@/lib/currency';
import type { NormalizedOrderTotals } from '@/lib/order-totals';

interface OrderSummaryTotalsProps {
  totals: NormalizedOrderTotals;
  currency: string;
  className?: string;
}

export function OrderSummaryTotals({
  totals,
  currency,
  className = '',
}: OrderSummaryTotalsProps) {
  const { subtotal, discountTotal, shippingTotal, taxTotal, grandTotal } = totals;

  return (
    <div className={`space-y-2 text-sm ${className}`.trim()}>
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal, currency)}</span>
      </div>
      {discountTotal > 0 && (
        <div className="flex justify-between text-success">
          <span>Discount</span>
          <span>−{formatPrice(discountTotal, currency)}</span>
        </div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <span>GST (18%)</span>
        <span>{formatPrice(taxTotal, currency)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Shipping</span>
        <span>
          {shippingTotal > 0
            ? formatPrice(shippingTotal, currency)
            : 'FREE'}
        </span>
      </div>
      <div className="mt-2 border-t border-border pt-2">
        <div className="flex justify-between text-lg font-semibold text-brand-text">
          <span>Total</span>
          <span>{formatPrice(grandTotal, currency)}</span>
        </div>
      </div>
    </div>
  );
}
