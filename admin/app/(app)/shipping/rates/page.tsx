import { ShippingRatesManager } from '@/components/shipping/shipping-rates-manager';
import { CourierZoneRatesPanel } from '@/components/shipping/courier-zone-rates-panel';

export default function ShippingRatesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Shipping Rates
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage courier zone weight tiers (5kg / 10kg) and optional CSV matrix rates.
        </p>
      </div>
      <CourierZoneRatesPanel />
      <ShippingRatesManager />
    </div>
  );
}
