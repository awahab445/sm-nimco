'use client';

import { useParams } from 'next/navigation';
import { MethodDetailView } from '@/components/shipping/method-detail-view';

export default function ShippingMethodDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid method.</p>;
  }

  return <MethodDetailView methodId={id} />;
}
