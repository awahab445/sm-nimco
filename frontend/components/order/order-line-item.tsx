'use client';

import { useState, type ReactNode } from 'react';
import {
  getOrderItemImageUrl,
  getOrderItemProductName,
  getOrderItemVariantSubtitle,
  type OrderLineItemLike,
} from '@/lib/order-line-item';

interface OrderLineItemProps {
  item: OrderLineItemLike;
  trailing?: ReactNode;
  showSku?: boolean;
  showQuantity?: boolean;
  className?: string;
}

export function OrderLineItem({
  item,
  trailing,
  showSku = false,
  showQuantity = true,
  className = '',
}: OrderLineItemProps) {
  const productName = getOrderItemProductName(item);
  const variantSubtitle = getOrderItemVariantSubtitle(item);
  const imageUrl = getOrderItemImageUrl(item);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <div className={`flex gap-3 ${className}`.trim()}>
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {showImage ? (
          <img
            src={imageUrl!}
            alt={productName}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-brand-text">{productName}</p>
            {variantSubtitle ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{variantSubtitle}</p>
            ) : null}
            {showSku && item.sku ? (
              <p className="mt-0.5 text-sm text-muted-foreground">SKU: {item.sku}</p>
            ) : null}
            {showQuantity && item.quantity != null ? (
              <p className="mt-1 text-sm text-muted-foreground">Quantity: {item.quantity}</p>
            ) : null}
          </div>
          {trailing ? <div className="shrink-0 text-right">{trailing}</div> : null}
        </div>
      </div>
    </div>
  );
}
