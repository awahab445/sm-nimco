'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import Link from 'next/link';

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getFulfillmentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      unfulfilled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      fulfilled: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  useEffect(() => {
    document.title = 'Order History | E-commerce';
    return () => { document.title = 'E-commerce'; };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-50">
          Order History
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
          View and track your orders
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400" role="alert">
          {error}
        </div>
      )}
      {reorderError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200" role="alert">
          {reorderError}
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-zinc-600 dark:border-t-blue-400" aria-hidden />
          <p className="mt-4 text-gray-500 dark:text-zinc-400">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-16 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-gray-600 dark:text-zinc-400">You haven’t placed any orders yet.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Start shopping
          </Link>
        </div>
      ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: order.currency,
                        }).format(order.grandTotal)}
                      </div>
                      <div className="flex gap-2 mt-2 justify-end">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            order.status,
                          )}`}
                          title="Order Status"
                        >
                          {order.status}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(
                            order.paymentStatus,
                          )}`}
                          title="Payment Status"
                        >
                          {order.paymentStatus}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getFulfillmentStatusColor(
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
                  <div className="border-t border-gray-200 dark:border-zinc-800 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-900 dark:text-zinc-50">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: order.currency,
                            }).format(item.rowTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="border-t border-gray-200 dark:border-zinc-800 pt-4 mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      disabled={reorderOrderId === order.id}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
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
                  className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300"
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
