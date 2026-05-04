'use client';

import { useParams } from 'next/navigation';
import { PromotionDetailView } from '@/components/promotions/promotion-detail-view';

export default function PromotionDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid promotion.</p>;
  }

  return <PromotionDetailView promotionId={id} />;
}
