import { ZoneConfigPanel } from '@/components/shipping/zone-config-panel';

export default function ShippingRatesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Shipping Rates
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage nationwide Economy & Overland delivery tiers. Rates use{' '}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
            Math.ceil(weight)
          </code>{' '}
          billing and apply to all Pakistani provinces and cities.
        </p>
      </div>
      <ZoneConfigPanel />
    </div>
  );
}
