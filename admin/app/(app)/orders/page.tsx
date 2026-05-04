import { Suspense } from 'react';
import { OrdersList } from '@/components/orders/orders-list';

function OrdersListFallback() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-4">
      <div className="h-8 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersListFallback />}>
      <OrdersList />
    </Suspense>
  );
}
