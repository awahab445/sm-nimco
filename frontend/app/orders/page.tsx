'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import {
  fulfillmentStatusBadgeClass,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/lib/order-status-badges';
import { formatPrice } from '@/lib/currency';
import { getOrderItemProductName } from '@/lib/order-line-item';
import { normalizeOrderTotals } from '@/lib/order-totals';
import { OrderSummaryTotals } from '@/components/order/order-summary-totals';
import Link from 'next/link';
import { storefrontUi } from '@/lib/storefront-ui';

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
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    rowTotal: number;
    productId?: string;
    variantId?: string | null;
    attributes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    productName?: string;
    product?: { name?: string };
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const reorderFromOrder = useCartStore((s) => s.reorderFromOrder);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reorderOrderId, setReorderOrderId] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderApi.getMyOrders({
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setOrders(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
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
    setReorderOrderId(order.id);
    try {
      await reorderFromOrder(items);
      router.push('/cart');
    } catch {
      setReorderError('Failed to add items to cart. Please try again.');
    } finally {
      setReorderOrderId(null);
    }
  };

  useEffect(() => {
    document.title = 'Order History | E-commerce';
    return () => { document.title = 'E-commerce'; };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-brand-text">Order History</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View and track your orders
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-destructive" role="alert">
          {error}
        </div>
      )}
      {reorderError && (
        <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-warning" role="alert">
          {reorderError}
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-secondary border-t-brand-primary" aria-hidden />
          <p className="mt-4 text-muted-foreground">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-brand-secondary/15 py-16 text-center">
          <p className="text-muted-foreground">You haven’t placed any orders yet.</p>
          <Link href="/products" className={`mt-4 inline-block ${storefrontUi.btnPrimary}`}>
            Start shopping
          </Link>
        </div>
      ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`overflow-hidden ${storefrontUi.card}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 justify-end">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${orderStatusBadgeClass(
                            order.status,
                          )}`}
                          title="Order Status"
                        >
                          {order.status}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${paymentStatusBadgeClass(
                            order.paymentStatus,
                          )}`}
                          title="Payment Status"
                        >
                          {order.paymentStatus}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${fulfillmentStatusBadgeClass(
                            order.fulfillmentStatus,
                          )}`}
                          title="Fulfillment Status"
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4 border-t border-border pt-4">
                    <h4 className="mb-2 text-sm font-medium text-brand-text">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {getOrderItemProductName(item)} × {item.quantity}
                          </span>
                          <span className="text-brand-text">
                            {formatPrice(item.rowTotal, order.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <h4 className="mb-2 text-sm font-medium text-brand-text">Order summary</h4>
                    <OrderSummaryTotals
                      totals={normalizeOrderTotals(order as unknown as Record<string, unknown>)}
                      currency={order.currency}
                    />
                  </div>

                  {/* Order Actions */}
                  <div className="mt-4 flex justify-end gap-3 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      disabled={reorderOrderId === order.id}
                      className={`inline-flex items-center gap-2 ${storefrontUi.btnSecondary}`}
                      title="Add all items from this order to a new cart"
                    >
                      {reorderOrderId === order.id ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                          Adding…
                        </>
                      ) : (
                        'Reorder'
                      )}
                    </button>
                    <Link
                      href={`/orders/${order.id}`}
                      className={storefrontUi.btnSecondary}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-border bg-card px-4 py-2 text-brand-text transition-colors hover:bg-brand-secondary/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border border-border bg-card px-4 py-2 text-brand-text transition-colors hover:bg-brand-secondary/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
