'use client';

import { useParams } from 'next/navigation';
import { ZoneDetailView } from '@/components/shipping/zone-detail-view';

export default function ShippingZoneDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid zone.</p>;
  }

  return <ZoneDetailView zoneId={id} />;
}
