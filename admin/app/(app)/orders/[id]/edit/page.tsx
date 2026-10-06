'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ManualOrderCreateForm } from '@/components/orders/manual-order-create-form';
import {
  fetchAdminOrder,
  isManualOrderEditable,
  type Order,
} from '@/lib/api/orders';
import { formatApiError } from '@/lib/api/error-message';

export default function EditManualOrderPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Invalid order.');
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const o = await fetchAdminOrder(id);
        if (cancelled) return;
        if (!isManualOrderEditable(o)) {
          setError(
            'This order cannot be edited. Only pending or processing manual orders are editable.',
          );
          setOrder(null);
        } else {
          setOrder(o);
        }
      } catch (e) {
        if (!cancelled) {
          setError(formatApiError(e));
          setOrder(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-zinc-500">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-5xl space-y-3">
        <Link
          href={id ? `/orders/${id}` : '/orders'}
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          ← Back
        </Link>
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error ?? 'Order not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ManualOrderCreateForm editOrder={order} />
    </div>
  );
}
