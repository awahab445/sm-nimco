'use client';

import { useParams } from 'next/navigation';
import { PaymentDetailView } from '@/components/payments/payment-detail-view';

export default function PaymentDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid payment.</p>;
  }

  return <PaymentDetailView paymentId={id} />;
}
