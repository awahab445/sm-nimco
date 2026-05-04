import { Suspense } from 'react';
import { TaxRateNewForm } from '@/components/tax/tax-rate-new-form';

function Fallback() {
  return <p className="text-sm text-zinc-500">Loading…</p>;
}

export default function NewTaxRatePage() {
  return (
    <Suspense fallback={<Fallback />}>
      <TaxRateNewForm />
    </Suspense>
  );
}
