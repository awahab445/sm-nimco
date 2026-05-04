'use client';

import { useParams } from 'next/navigation';
import { TaxRateDetailView } from '@/components/tax/tax-rate-detail-view';

export default function TaxRateDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid tax rate.</p>;
  }

  return <TaxRateDetailView taxId={id} />;
}
