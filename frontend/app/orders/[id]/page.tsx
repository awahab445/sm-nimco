'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { orderApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import {
  fulfillmentStatusBadgeClass,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/lib/order-status-badges';
import { formatPrice } from '@/lib/currency';
import Link from 'next/link';
import { storefrontUi } from '@/lib/storefront-ui';
import { OrderLineItem } from '@/components/order/order-line-item';
import { OrderSummaryTotals } from '@/components/order/order-summary-totals';
import { normalizeOrderTotals } from '@/lib/order-totals';

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  rowTotal: number;
  attributes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  productId?: string;
  variantId?: string | null;
  productName?: string;
  productImage?: string | null;
  variantLabel?: string | null;
  product?: { name?: string; image?: string | null };
}

interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Type guard for address
const isAddress = (obj: any): obj is Address => {
  return (
    obj &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.addressLine1 === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.postalCode === 'string' &&
    typeof obj.country === 'string'
  );
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  customerEmail: string;
  customerName?: string;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  billingAddress: Address | Record<string, any>;
  shippingAddress: Address | Record<string, any>;
  items: OrderItem[];
  notes?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.id as string;
  const reorderFromOrder = useCartStore((s) => s.reorderFromOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  useEffect(() => {
    void loadOrder();
  }, [orderId, searchParams]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const guestOrderNumber = searchParams.get('orderNumber')?.trim() ?? '';
      const guestEmail = searchParams.get('email')?.trim() ?? '';

      // Fallback when useSearchParams is briefly empty after client navigation
      const urlParams =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const resolvedOrderNumber =
        guestOrderNumber || urlParams?.get('orderNumber')?.trim() || '';
      const resolvedEmail = guestEmail || urlParams?.get('email')?.trim() || '';

      let orderData: unknown;
      if (resolvedOrderNumber && resolvedEmail) {
        orderData = await orderApi.trackOrder(resolvedOrderNumber, resolvedEmail);
      } else {
        orderData = await orderApi.getOrder(orderId);
      }
      setOrder(orderData as unknown as Order);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    const items = order.items
      .filter((i) => i.productId)
      .map((i) => ({
        productId: i.productId!,
        variantId: i.variantId ?? null,
        quantity: i.quantity,
      }));
    if (items.length === 0) {
      setReorderError('This order has no items that can be reordered.');
      return;
    }
    setReorderError(null);
    setReorderLoading(true);
    try {
      await reorderFromOrder(items);
      router.push('/cart');
    } catch {
      setReorderError('Failed to add items to cart. Please try again.');
    } finally {
      setReorderLoading(false);
    }
  };

  const formatAddress = (address: Address | Record<string, any>) => {
    if (!isAddress(address)) {
      return <div className="text-sm text-muted-foreground">Address not available</div>;
    }
    
    return (
      <div className="text-sm text-muted-foreground">
        <div className="font-medium text-brand-text">
          {address.firstName} {address.lastName}
        </div>
        {address.company && <div>{address.company}</div>}
        <div>{address.addressLine1}</div>
        {address.addressLine2 && <div>{address.addressLine2}</div>}
        <div>
          {address.city}, {address.state} {address.postalCode}
        </div>
        <div>{address.country}</div>
        {address.phone && <div className="mt-1">Phone: {address.phone}</div>}
      </div>
    );
  };

  useEffect(() => {
    if (order) {
      document.title = `Order #${order.orderNumber} | E-commerce`;
    } else {
      document.title = 'Order details | E-commerce';
    }
    return () => { document.title = 'E-commerce'; };
  }, [order?.orderNumber]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-secondary border-t-brand-primary" aria-hidden />
        <p className="mt-4 text-muted-foreground">Loading order…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-destructive" role="alert">
          {error}
        </div>
        <Link href="/orders" className={`mt-6 inline-block ${storefrontUi.btnPrimary}`}>
          Back to orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl bg-brand-bg px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/orders" className={`mb-4 inline-block text-sm ${storefrontUi.link}`}>
          ← Back to Orders
        </Link>
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="mb-2 text-2xl font-semibold text-brand-text">
              Order #{order.orderNumber}
            </h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`rounded px-3 py-1 text-sm font-medium ${orderStatusBadgeClass(order.status)}`}
                title="Order Status"
              >
                {order.status}
              </span>
              <span
                className={`rounded px-3 py-1 text-sm font-medium ${paymentStatusBadgeClass(
                  order.paymentStatus,
                )}`}
                title="Payment Status"
              >
                {order.paymentStatus}
              </span>
              <span
                className={`rounded px-3 py-1 text-sm font-medium ${fulfillmentStatusBadgeClass(
                  order.fulfillmentStatus,
                )}`}
                title="Fulfillment Status"
              >
                {order.fulfillmentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className={`p-6 ${storefrontUi.card}`}>
              <h2 className="mb-4 text-xl font-semibold text-brand-text">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <OrderLineItem
                      item={item}
                      trailing={
                        <>
                          <div className="font-medium text-brand-text">
                            {formatPrice(item.rowTotal, order.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatPrice(item.unitPrice, order.currency)} each
                          </div>
                          {item.discountAmount > 0 && (
                            <div className="text-sm text-success">
                              Discount: -{formatPrice(item.discountAmount, order.currency)}
                            </div>
                          )}
                        </>
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className={`p-6 ${storefrontUi.card}`}>
                <h2 className="mb-2 text-xl font-semibold text-brand-text">
                  Order Notes
                </h2>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className={`p-6 ${storefrontUi.card}`}>
              <h2 className="mb-4 text-xl font-semibold text-brand-text">
                Order Summary
              </h2>
              <OrderSummaryTotals
                totals={normalizeOrderTotals(order as unknown as Record<string, unknown>)}
                currency={order.currency}
              />
            </div>

            {/* Actions */}
            <div className={`p-6 ${storefrontUi.card}`}>
              <h2 className="mb-4 text-xl font-semibold text-brand-text">
                Actions
              </h2>
              {reorderError && (
                <p className="mb-3 text-sm text-warning" role="alert">{reorderError}</p>
              )}
              <button
                type="button"
                onClick={handleReorder}
                disabled={reorderLoading}
                className={`inline-flex w-full items-center justify-center gap-2 ${storefrontUi.btnSecondary}`}
                title="Add all items from this order to a new cart"
              >
                {reorderLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                    Adding to cart…
                  </>
                ) : (
                  'Reorder'
                )}
              </button>
            </div>

            {/* Billing Address */}
            <div className={`p-6 ${storefrontUi.card}`}>
              <h2 className="mb-4 text-xl font-semibold text-brand-text">
                Billing Address
              </h2>
              {formatAddress(order.billingAddress)}
            </div>

            {/* Shipping Address */}
            <div className={`p-6 ${storefrontUi.card}`}>
              <h2 className="mb-4 text-xl font-semibold text-brand-text">
                Shipping Address
              </h2>
              {formatAddress(order.shippingAddress)}
            </div>

            {/* Customer Info */}
            <div className={`p-6 ${storefrontUi.card}`}>
              <h2 className="mb-4 text-xl font-semibold text-brand-text">
                Customer Information
              </h2>
              <div className="text-sm text-muted-foreground">
                <div className="mb-1">
                  <span className="font-medium">Email:</span> {order.customerEmail}
                </div>
                {order.customerName && (
                  <div>
                    <span className="font-medium">Name:</span> {order.customerName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

