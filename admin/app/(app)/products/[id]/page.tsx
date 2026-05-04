'use client';

import { useParams } from 'next/navigation';
import { ProductDetailView } from '@/components/products/product-detail-view';

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  if (!id) {
    return <p className="text-sm text-zinc-500">Invalid product.</p>;
  }

  return <ProductDetailView productId={id} />;
}
