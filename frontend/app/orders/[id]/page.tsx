'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import {
  fulfillmentStatusBadgeClass,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/lib/order-status-badges';
import Link from 'next/link';

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
  productId?: string;
  variantId?: string | null;
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
  const router = useRouter();
  const orderId = params.id as string;
  const reorderFromOrder = useCartStore((s) => s.reorderFromOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await orderApi.getOrder(orderId);
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
        <div className="font-medium text-foreground">
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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" aria-hidden />
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
        <Link
          href="/orders"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/orders"
          className="mb-4 inline-block text-primary transition-colors hover:opacity-80"
        >
          ← Back to Orders
        </Link>
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="mb-2 text-2xl font-semibold text-foreground">
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
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {Object.entries(item.attributes).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: order.currency,
                        }).format(item.rowTotal)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: order.currency,
                        }).format(item.unitPrice)}{' '}
                        each
                      </div>
                      {item.discountAmount > 0 && (
                        <div className="text-sm text-success">
                          Discount: -{new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: order.currency,
                          }).format(item.discountAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  Order Notes
                </h2>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: order.currency,
                    }).format(order.subtotal)}
                  </span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>
                      -{new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: order.currency,
                      }).format(order.discountTotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: order.currency,
                    }).format(order.shippingTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: order.currency,
                    }).format(order.taxTotal)}
                  </span>
                </div>
                <div className="mt-2 border-t border-border pt-2">
                  <div className="flex justify-between text-lg font-semibold text-foreground">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: order.currency,
                      }).format(order.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Actions
              </h2>
              {reorderError && (
                <p className="mb-3 text-sm text-warning" role="alert">{reorderError}</p>
              )}
              <button
                type="button"
                onClick={handleReorder}
                disabled={reorderLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Billing Address
              </h2>
              {formatAddress(order.billingAddress)}
            </div>

            {/* Shipping Address */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Shipping Address
              </h2>
              {formatAddress(order.shippingAddress)}
            </div>

            {/* Customer Info */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
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

