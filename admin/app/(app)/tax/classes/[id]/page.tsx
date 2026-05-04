'use client';

import { useParams } from 'next/navigation';
import { TaxClassDetailView } from '@/components/tax/tax-class-detail-view';

export default function TaxClassDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid tax class.</p>;
  }

  return <TaxClassDetailView taxClassId={id} />;
}
