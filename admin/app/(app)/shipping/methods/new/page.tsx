import { Suspense } from 'react';
import { MethodNewForm } from '@/components/shipping/method-new-form';

function Fallback() {
  return <p className="text-sm text-zinc-500">Loading…</p>;
}

export default function NewShippingMethodPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <MethodNewForm />
    </Suspense>
  );
}
