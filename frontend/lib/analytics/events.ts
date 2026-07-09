import type { Product } from '@/lib/api-client';
import type { Ga4Item } from './types';
import { markOnce } from './dedupe';
import {
  canTrack,
  getAnalyticsConfig,
  runWhenIdle,
  sendGAEvent,
} from './gtag';
import {
  canTrackMeta,
  sendFBEvent,
} from './fbq';
import {
  cartItemToGa4Item,
  orderLineToGa4Item,
  productToGa4Item,
  sumItemValue,
} from './mappers';

function currency(): string {
  return getAnalyticsConfig()?.currency ?? 'PKR';
}

function fbContentFromItems(items: Ga4Item[]): {
  content_ids: string[];
  contents: Array<{ id: string; quantity: number }>;
  content_type: string;
  value: number;
  currency: string;
} {
  return {
    content_ids: items.map((i) => i.item_id),
    contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity })),
    content_type: 'product',
    value: sumItemValue(items),
    currency: currency(),
  };
}

export function trackViewItemList(
  listId: string,
  listName: string,
  products: Product[],
): void {
  if (!canTrack('trackCartEvents')) return;
  const items = products.slice(0, 30).map((p) => productToGa4Item(p));
  runWhenIdle(() => {
    sendGAEvent('view_item_list', {
      item_list_id: listId,
      item_list_name: listName,
      items,
    });
  });
}

export function trackViewItem(
  product: Product,
  options?: { variantName?: string; price?: number },
): void {
  if (!canTrack('trackCartEvents') && !canTrackMeta('trackCartEvents')) return;
  const items = [
    productToGa4Item(product, {
      variantName: options?.variantName,
      price: options?.price,
      quantity: 1,
    }),
  ];
  if (canTrack('trackCartEvents')) {
    sendGAEvent('view_item', {
      currency: currency(),
      value: sumItemValue(items),
      items,
    });
  }
  if (canTrackMeta('trackCartEvents')) {
    sendFBEvent('ViewContent', {
      ...fbContentFromItems(items),
      content_name: items[0]?.item_name,
    });
  }
}

function trackAddToCart(items: Ga4Item[]): void {
  if (canTrack('trackCartEvents')) {
    sendGAEvent('add_to_cart', {
      currency: currency(),
      value: sumItemValue(items),
      items,
    });
  }
  if (canTrackMeta('trackCartEvents')) {
    sendFBEvent('AddToCart', fbContentFromItems(items));
  }
}

export function trackAddToCartFromProduct(
  product: Product,
  quantity: number,
  options?: { variantName?: string; price?: number },
): void {
  if (!canTrack('trackCartEvents') && !canTrackMeta('trackCartEvents')) return;
  const items = [
    productToGa4Item(product, {
      variantName: options?.variantName,
      price: options?.price,
      quantity,
    }),
  ];
  trackAddToCart(items);
}

export function trackAddToCartFromCartItem(
  item: Parameters<typeof cartItemToGa4Item>[0],
): void {
  if (!canTrack('trackCartEvents') && !canTrackMeta('trackCartEvents')) return;
  trackAddToCart([cartItemToGa4Item(item)]);
}

export function trackAddBundleToCart(
  deal: { id: string; title: string; dealPrice: number; slug?: string },
  quantity: number,
): void {
  if (!canTrack('trackCustomEvents')) return;
  runWhenIdle(() => {
    sendGAEvent('add_bundle_to_cart', {
      currency: currency(),
      value: deal.dealPrice * quantity,
      bundle_deal_id: deal.id,
      bundle_title: deal.title,
      quantity,
    });
  });
}

export function trackRemoveFromCart(
  item: Parameters<typeof cartItemToGa4Item>[0],
): void {
  if (!canTrack('trackCartEvents')) return;
  const items = [cartItemToGa4Item(item)];
  sendGAEvent('remove_from_cart', {
    currency: currency(),
    value: sumItemValue(items),
    items,
  });
}

export function trackViewCart(items: Ga4Item[]): void {
  if (items.length === 0) return;
  if (!canTrack('trackCartEvents') && !canTrackMeta('trackCartEvents')) return;
  if (canTrack('trackCartEvents')) {
    sendGAEvent('view_cart', {
      currency: currency(),
      value: sumItemValue(items),
      items,
    });
  }
}

export function trackBeginCheckout(
  checkoutId: string,
  items: Ga4Item[],
  coupon?: string,
): void {
  if (!canTrack('trackCheckoutSteps') && !canTrackMeta('trackCheckoutSteps')) {
    return;
  }
  if (!markOnce(`begin_checkout_${checkoutId}`)) return;
  if (canTrack('trackCheckoutSteps')) {
    sendGAEvent('begin_checkout', {
      currency: currency(),
      value: sumItemValue(items),
      coupon,
      items,
    });
  }
  if (canTrackMeta('trackCheckoutSteps')) {
    sendFBEvent('InitiateCheckout', fbContentFromItems(items));
  }
}

export function trackAddShippingInfo(
  shippingTier: string,
  items: Ga4Item[],
): void {
  if (!canTrack('trackCheckoutSteps')) return;
  sendGAEvent('add_shipping_info', {
    currency: currency(),
    value: sumItemValue(items),
    shipping_tier: shippingTier,
    items,
  });
}

export function trackAddPaymentInfo(
  paymentType: string,
  items: Ga4Item[],
): void {
  if (!canTrack('trackCheckoutSteps') && !canTrackMeta('trackCheckoutSteps')) {
    return;
  }
  if (canTrack('trackCheckoutSteps')) {
    sendGAEvent('add_payment_info', {
      currency: currency(),
      value: sumItemValue(items),
      payment_type: paymentType,
      items,
    });
  }
  if (canTrackMeta('trackCheckoutSteps')) {
    sendFBEvent('AddPaymentInfo', fbContentFromItems(items));
  }
}

export function trackPurchase(order: {
  orderNumber: string;
  grandTotal: number;
  taxTotal?: number;
  shippingTotal?: number;
  couponCode?: string;
  currency?: string;
  items: Array<{
    sku?: string;
    name: string;
    unitPrice?: number | string;
    quantity?: number;
  }>;
}): void {
  if (!canTrack('trackPurchases') && !canTrackMeta('trackPurchases')) return;
  if (!markOnce(`purchase_${order.orderNumber}`)) return;
  const items = order.items.map((line) => orderLineToGa4Item(line));
  const orderCurrency = order.currency ?? currency();
  if (canTrack('trackPurchases')) {
    sendGAEvent('purchase', {
      transaction_id: order.orderNumber,
      value: order.grandTotal,
      currency: orderCurrency,
      tax: order.taxTotal ?? 0,
      shipping: order.shippingTotal ?? 0,
      coupon: order.couponCode,
      items,
    });
  }
  if (canTrackMeta('trackPurchases')) {
    sendFBEvent('Purchase', {
      ...fbContentFromItems(items),
      value: order.grandTotal,
      currency: orderCurrency,
    });
  }
}

export function trackRefund(
  transactionId: string,
  value: number,
): void {
  if (!canTrack('trackRefunds')) return;
  if (!markOnce(`refund_${transactionId}`)) return;
  sendGAEvent('refund', {
    transaction_id: transactionId,
    value,
    currency: currency(),
  });
}

export function trackCustomEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!canTrack('trackCustomEvents')) return;
  sendGAEvent(eventName, params);
}

export function trackPageView(path: string): void {
  if (canTrack('trackPageViews')) {
    sendGAEvent('page_view', {
      page_path: path,
    });
  }
  if (canTrackMeta('trackPageViews')) {
    sendFBEvent('PageView');
  }
}
