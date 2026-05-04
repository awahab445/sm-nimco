'use client';

import { useParams } from 'next/navigation';
import { CustomerDetailView } from '@/components/customers/customer-detail-view';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid customer.</p>;
  }

  return <CustomerDetailView customerId={id} />;
}
