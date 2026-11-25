import { Suspense } from 'react';
import { OrderDetailView } from '@/components/orders/order-detail-view';

/** Always resolve order detail at request time (admin data is dynamic). */
export const dynamic = 'force-dynamic';

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

function OrderDetailFallback() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
    </div>
  );
}

/**
 * Dynamic order detail route: `/orders/:id`
 * Lives under the `(app)` group (URL is still `/orders/[id]`).
 * Uses async `params` (Next.js 15+/16) and passes the id into the client view,
 * which loads `GET /admin/orders/:id`.
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolved = await params;
  const raw = resolved?.id;
  const orderId =
    typeof raw === 'string'
      ? raw.trim()
      : Array.isArray(raw)
        ? String(raw[0] ?? '').trim()
        : '';

  if (!orderId) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        Invalid order id.
      </p>
    );
  }

  return (
    <Suspense fallback={<OrderDetailFallback />}>
      <OrderDetailView orderId={orderId} />
    </Suspense>
  );
}
