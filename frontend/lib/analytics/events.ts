import type { Product } from '@/lib/api-client';
import { parseOrderAmount, roundMoney } from '@/lib/order-totals';
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
  type MetaPixelAdvancedMatching,
} from './fbq';
import {
  canTrackTikTok,
  sendTikTokEvent,
  sendTikTokPageView,
  ttContentFromItems,
} from './ttq';
import {
  cartItemToGa4Item,
  isCatalogUuid,
  orderLineToGa4Item,
  productToGa4Item,
  sumItemValue,
} from './mappers';
import {
  enqueueMetaCapiPageView,
  metaMatchUserToPixelData,
  resolveMetaMatchUser,
  type MetaMatchUser,
} from './meta-capi-client';

function currency(): string {
  return getAnalyticsConfig()?.currency ?? 'PKR';
}

/** Keep only Meta-catalog retailer ids (SKUs); drop empty / UUID leftovers. */
function catalogContentIds(ids: Array<string | undefined | null>): string[] {
  return ids
    .map((id) => id?.trim())
    .filter((id): id is string => Boolean(id) && !isCatalogUuid(id));
}

/** Meta Pixel ecommerce payload shared across catalog events. */
function fbContentFromItems(items: Ga4Item[]): {
  content_ids: string[];
  contents: Array<{ id: string; quantity: number; item_price?: number }>;
  content_type: string;
  content_name?: string;
  num_items: number;
  value: number;
  currency: string;
} {
  const withSku = items.filter(
    (i) => i.item_id?.trim() && !isCatalogUuid(i.item_id),
  );
  return {
    content_ids: catalogContentIds(withSku.map((i) => i.item_id)),
    contents: withSku.map((i) => {
      const itemPrice = roundMoney(i.price);
      return {
        id: i.item_id,
        quantity: i.quantity,
        ...(Number.isFinite(itemPrice) ? { item_price: itemPrice } : {}),
      };
    }),
    content_type: 'product',
    content_name: withSku.length === 1 ? withSku[0]?.item_name : undefined,
    num_items: withSku.reduce((sum, i) => sum + i.quantity, 0),
    value: sumItemValue(withSku.length ? withSku : items),
    currency: currency(),
  };
}

export function trackViewItemList(
  listId: string,
  listName: string,
  products: Product[],
): void {
  if (!canTrack('trackCartEvents')) return;
  const list = Array.isArray(products) ? products : [];
  const items = list.slice(0, 30).map((p) => productToGa4Item(p));
  runWhenIdle(() => {
    sendGAEvent('view_item_list', {
      item_list_id: listId,
      item_list_name: listName,
      items,
    });
  });
}

/** Product page view → Meta `ViewContent` (+ GA4 view_item). */
export function trackViewItem(
  product: Product,
  options?: { variantName?: string; price?: number; variantSku?: string },
): void {
  if (
    !canTrack('trackCartEvents') &&
    !canTrackMeta('trackCartEvents') &&
    !canTrackTikTok('trackCartEvents')
  ) {
    return;
  }
  if (!markOnce(`view_item_${product.id}`)) return;
  const items = [
    productToGa4Item(product, {
      variantSku: options?.variantSku,
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
    sendFBEvent('ViewContent', fbContentFromItems(items));
  }
  if (canTrackTikTok('trackCartEvents')) {
    sendTikTokEvent('ViewContent', ttContentFromItems(items, currency()));
  }
}

/**
 * Variant / option change on PDP → Meta `CustomizeProduct`
 * (see Meta Pixel standard events).
 */
export function trackCustomizeProduct(
  product: Product,
  options?: {
    variantName?: string;
    price?: number;
    variantSku?: string;
    optionKey?: string;
    optionValue?: string;
  },
): void {
  if (!canTrackMeta('trackCartEvents') && !canTrack('trackCustomEvents')) return;
  const items = [
    productToGa4Item(product, {
      variantSku: options?.variantSku,
      variantName: options?.variantName,
      price: options?.price,
      quantity: 1,
    }),
  ];
  if (canTrack('trackCustomEvents')) {
    sendGAEvent('customize_product', {
      currency: currency(),
      value: sumItemValue(items),
      items,
      option_key: options?.optionKey,
      option_value: options?.optionValue,
    });
  }
  if (canTrackMeta('trackCartEvents')) {
    sendFBEvent('CustomizeProduct', {
      ...fbContentFromItems(items),
      content_name: product.name,
    });
  }
}

function trackAddToCart(
  items: Ga4Item[],
  options?: { eventID?: string; userData?: MetaPixelAdvancedMatching },
): void {
  if (canTrack('trackCartEvents')) {
    sendGAEvent('add_to_cart', {
      currency: currency(),
      value: sumItemValue(items),
      items,
    });
  }
  if (canTrackMeta('trackCartEvents')) {
    sendFBEvent('AddToCart', fbContentFromItems(items), {
      eventID: options?.eventID,
      userData: options?.userData,
    });
  }
  if (canTrackTikTok('trackCartEvents')) {
    sendTikTokEvent('AddToCart', ttContentFromItems(items, currency()), {
      eventID: options?.eventID,
      userData: options?.userData,
    });
  }
}

export function trackAddToCartFromProduct(
  product: Product,
  quantity: number,
  options?: {
    variantName?: string;
    price?: number;
    variantSku?: string;
    eventID?: string;
    matchUser?: MetaMatchUser | null;
  },
): void {
  if (
    !canTrack('trackCartEvents') &&
    !canTrackMeta('trackCartEvents') &&
    !canTrackTikTok('trackCartEvents')
  ) {
    return;
  }
  const items = [
    productToGa4Item(product, {
      variantSku: options?.variantSku,
      variantName: options?.variantName,
      price: options?.price,
      quantity,
    }),
  ];
  trackAddToCart(items, {
    eventID: options?.eventID,
    userData: metaMatchUserToPixelData(options?.matchUser),
  });
}

export function trackAddToCartFromCartItem(
  item: Parameters<typeof cartItemToGa4Item>[0],
  options?: { eventID?: string; matchUser?: MetaMatchUser | null },
): void {
  if (
    !canTrack('trackCartEvents') &&
    !canTrackMeta('trackCartEvents') &&
    !canTrackTikTok('trackCartEvents')
  ) {
    return;
  }
  trackAddToCart([cartItemToGa4Item(item)], {
    eventID: options?.eventID,
    userData: metaMatchUserToPixelData(options?.matchUser),
  });
}

export function trackAddBundleToCart(
  deal: {
    id: string;
    title: string;
    dealPrice: number;
    slug?: string;
    items?: Array<{
      quantity?: number;
      product?: { sku?: string; name?: string } | null;
      variant?: { sku?: string; name?: string } | null;
    }>;
  },
  quantity: number,
): void {
  if (
    !canTrack('trackCustomEvents') &&
    !canTrackMeta('trackCartEvents') &&
    !canTrackTikTok('trackCartEvents')
  ) {
    return;
  }
  const value = deal.dealPrice * quantity;
  // Prefer component SKUs so Meta can match catalog rows (never send deal UUID).
  const componentItems: Ga4Item[] = (deal.items ?? [])
    .map((it) => {
      const sku = it.variant?.sku?.trim() || it.product?.sku?.trim();
      if (!sku) return null;
      return {
        item_id: sku,
        item_name: it.variant?.name || it.product?.name || deal.title,
        price: 0,
        quantity: (it.quantity ?? 1) * quantity,
      } satisfies Ga4Item;
    })
    .filter((x): x is Ga4Item => x != null);

  if (canTrack('trackCustomEvents')) {
    runWhenIdle(() => {
      sendGAEvent('add_bundle_to_cart', {
        currency: currency(),
        value,
        bundle_deal_id: deal.id,
        bundle_title: deal.title,
        quantity,
        items: componentItems,
      });
    });
  }
  if (canTrackMeta('trackCartEvents') && componentItems.length > 0) {
    sendFBEvent('AddToCart', {
      ...fbContentFromItems(componentItems),
      value,
      content_name: deal.title,
    });
  }
  if (canTrackTikTok('trackCartEvents') && componentItems.length > 0) {
    sendTikTokEvent('AddToCart', {
      ...ttContentFromItems(componentItems, currency()),
      value,
    });
  }
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
  matchUser?: MetaMatchUser | null,
): void {
  if (
    !canTrack('trackCheckoutSteps') &&
    !canTrackMeta('trackCheckoutSteps') &&
    !canTrackTikTok('trackCheckoutSteps')
  ) {
    return;
  }
  if (!markOnce(`begin_checkout_${checkoutId}`)) return;
  const eventID = `begin_checkout_${checkoutId}`;
  if (canTrack('trackCheckoutSteps')) {
    sendGAEvent('begin_checkout', {
      currency: currency(),
      value: sumItemValue(items),
      coupon,
      items,
    });
  }
  if (canTrackMeta('trackCheckoutSteps')) {
    sendFBEvent('InitiateCheckout', fbContentFromItems(items), {
      eventID,
      userData: metaMatchUserToPixelData(matchUser),
    });
  }
  if (canTrackTikTok('trackCheckoutSteps')) {
    sendTikTokEvent('InitiateCheckout', ttContentFromItems(items, currency()), {
      eventID,
      userData: metaMatchUserToPixelData(matchUser),
    });
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
  if (
    !canTrack('trackCheckoutSteps') &&
    !canTrackMeta('trackCheckoutSteps') &&
    !canTrackTikTok('trackCheckoutSteps')
  ) {
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
    sendFBEvent('AddPaymentInfo', {
      ...fbContentFromItems(items),
      payment_type: paymentType,
    });
  }
  if (canTrackTikTok('trackCheckoutSteps')) {
    sendTikTokEvent('AddPaymentInfo', ttContentFromItems(items, currency()));
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
    unitPrice?: unknown;
    price?: unknown;
    rowTotal?: unknown;
    quantity?: number;
  }>;
}): void {
  if (
    !canTrack('trackPurchases') &&
    !canTrackMeta('trackPurchases') &&
    !canTrackTikTok('trackPurchases')
  ) {
    return;
  }
  if (!markOnce(`purchase_${order.orderNumber}`)) return;
  const items = order.items.map((line) => orderLineToGa4Item(line));
  const orderCurrency = (order.currency ?? currency()).toUpperCase();
  const value = parseOrderAmount(order.grandTotal);
  const tax = parseOrderAmount(order.taxTotal);
  const shipping = parseOrderAmount(order.shippingTotal);
  if (canTrack('trackPurchases')) {
    sendGAEvent('purchase', {
      transaction_id: order.orderNumber,
      value,
      currency: orderCurrency,
      tax,
      shipping,
      coupon: order.couponCode,
      items,
    });
  }
  if (canTrackMeta('trackPurchases')) {
    sendFBEvent(
      'Purchase',
      {
        ...fbContentFromItems(items),
        value,
        currency: orderCurrency,
      },
      { eventID: `purchase_${order.orderNumber}` },
    );
  }
  if (canTrackTikTok('trackPurchases')) {
    sendTikTokEvent(
      'CompletePayment',
      {
        ...ttContentFromItems(items, orderCurrency),
        value,
        order_id: order.orderNumber,
      },
      { eventID: `purchase_${order.orderNumber}` },
    );
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

/** Site search → Meta `Search`. */
export function trackSearch(
  searchString: string,
  options?: { contentIds?: string[] },
): void {
  const q = searchString.trim();
  if (!q) return;
  if (
    !canTrack('trackCustomEvents') &&
    !canTrackMeta('trackCustomEvents') &&
    !canTrackTikTok('trackCustomEvents')
  ) {
    return;
  }
  const key = `search_${q.toLowerCase()}`;
  if (!markOnce(key)) return;
  if (canTrack('trackCustomEvents')) {
    sendGAEvent('search', {
      search_term: q,
    });
  }
  if (canTrackMeta('trackCustomEvents')) {
    sendFBEvent('Search', {
      search_string: q,
      content_ids: catalogContentIds(options?.contentIds ?? []).slice(0, 30),
      content_type: 'product',
    });
  }
  if (canTrackTikTok('trackCustomEvents')) {
    sendTikTokEvent('Search', {
      query: q,
      contents: catalogContentIds(options?.contentIds ?? [])
        .slice(0, 30)
        .map((id) => ({ content_id: id, content_type: 'product' })),
      content_type: 'product',
    });
  }
}

/**
 * Account signup → Meta `CompleteRegistration`
 * (email verification may still be pending).
 */
export function trackCompleteRegistration(options?: {
  method?: string;
  status?: boolean;
}): void {
  if (
    !canTrack('trackCustomEvents') &&
    !canTrackMeta('trackCustomEvents') &&
    !canTrackTikTok('trackCustomEvents')
  ) {
    return;
  }
  if (canTrack('trackCustomEvents')) {
    sendGAEvent('sign_up', {
      method: options?.method ?? 'email',
    });
  }
  if (canTrackMeta('trackCustomEvents')) {
    sendFBEvent('CompleteRegistration', {
      content_name: 'account',
      status: options?.status ?? true,
      currency: currency(),
    });
  }
  if (canTrackTikTok('trackCustomEvents')) {
    sendTikTokEvent('CompleteRegistration');
  }
}

export function trackCustomEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!canTrack('trackCustomEvents')) return;
  sendGAEvent(eventName, params);
}

let lastPageView: { path: string; at: number } = { path: '', at: 0 };

export function trackPageView(
  path: string,
  matchUser?: MetaMatchUser | null,
): void {
  if (canTrack('trackPageViews')) {
    sendGAEvent('page_view', {
      page_path: path,
    });
  }
  // SPA route changes — base pixels no longer auto-fire PageView (avoids double count).
  const meta = canTrackMeta('trackPageViews');
  const tiktok = canTrackTikTok('trackPageViews');
  if (!meta && !tiktok) return;
  const now = Date.now();
  if (lastPageView.path === path && now - lastPageView.at < 400) return;
  lastPageView = { path, at: now };

  if (tiktok) sendTikTokPageView();
  if (!meta) return;

  const resolved = matchUser ?? resolveMetaMatchUser();
  const eventID = `pageview_${now}`;
  sendFBEvent('PageView', undefined, {
    eventID,
    userData: metaMatchUserToPixelData(resolved),
  });
  enqueueMetaCapiPageView(eventID, resolved);
}
