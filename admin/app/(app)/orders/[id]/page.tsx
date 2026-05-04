'use client';

import { useParams } from 'next/navigation';
import { OrderDetailView } from '@/components/orders/order-detail-view';

export default function OrderDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid order.</p>;
  }

  return <OrderDetailView orderId={id} />;
}
