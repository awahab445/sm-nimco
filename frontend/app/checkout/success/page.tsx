'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { orderApi, paymentApi } from '@/lib/api-client';
import { authService } from '@/lib/auth.service';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';

interface OrderPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod?: { code: string; name: string; provider: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  currency: string;
  customerEmail: string;
  payments?: OrderPayment[];
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountCreationSent, setAccountCreationSent] = useState(false);
  const [accountCreationLoading, setAccountCreationLoading] = useState(false);
  const [accountCreationError, setAccountCreationError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear cart as soon as we land on success (so cart is empty without reload)
  useEffect(() => {
    if (orderId || orderNumber) {
      clearCart();
    }
  }, [orderId, orderNumber, clearCart]);

  useEffect(() => {
    const fetchOrderAndPayments = async () => {
      if (!orderId && !orderNumber) {
        setError('No order ID or order number provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = orderId
          ? await orderApi.getOrder(orderId)
          : await orderApi.getOrderByNumber(orderNumber!);
        const resolvedOrderId = orderData.id;

        let payments: Awaited<ReturnType<typeof paymentApi.getPaymentsByOrder>> = [];
        try {
          payments = await paymentApi.getPaymentsByOrder(resolvedOrderId);
        } catch {
          // Order may exist before payments are created; continue without payments
        }

        setOrder({
          ...orderData,
          payments: payments.map((p) => ({
            id: p.id,
            status: p.status,
            amount: typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount,
            currency: p.currency,
            paymentMethod: p.paymentMethod,
          })),
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndPayments();
  }, [orderId, orderNumber]);

  // Poll for payment status updates (only for online/redirect gateways; not for COD)
  useEffect(() => {
    const isCOD = (p: OrderPayment) =>
      p.paymentMethod?.provider?.toLowerCase() === 'cod';
    const isTerminal = (status: string) =>
      /^(COMPLETED|CAPTURED|FAILED|REFUNDED)$/i.test(status);
    const allCODOrTerminal =
      !order?.payments?.length ||
      order.payments.every((p) => isCOD(p) || isTerminal(p.status));

    if (!order?.id || allCODOrTerminal) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const payments = await paymentApi.getPaymentsByOrder(order.id);
        const merged: OrderPayment[] = payments.map((p) => ({
          id: p.id,
          status: p.status,
          amount: typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount,
          currency: p.currency,
          paymentMethod: p.paymentMethod,
        }));
        setOrder((prev) => (prev ? { ...prev, payments: merged } : null));

        if (merged.some((p) => isTerminal(p.status))) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Failed to poll payment status:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.id, order?.payments]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">✕</div>
          <h1 className="text-2xl font-semibold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order details.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const payment = order.payments?.[0];
  const isCOD = payment?.paymentMethod?.provider?.toLowerCase() === 'cod';
  const paymentStatus = payment?.status || 'PENDING';
  const isPaymentCompleted =
    /^(COMPLETED|CAPTURED)$/i.test(paymentStatus);
  // COD with PENDING = "pay on delivery" → show as order confirmed, not "pending"
  const isPaymentPending =
    !isCOD &&
    !isPaymentCompleted &&
    /^(PENDING|PROCESSING)$/i.test(paymentStatus);
  const isPaymentFailed = /^FAILED$/i.test(paymentStatus);
  const isCODPending = isCOD && /^(PENDING|PROCESSING)$/i.test(paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            {isPaymentCompleted || isCODPending ? (
              <div className="text-green-600 text-6xl mb-4">✓</div>
            ) : isPaymentPending ? (
              <div className="text-yellow-600 text-6xl mb-4">⏳</div>
            ) : (
              <div className="text-red-600 text-6xl mb-4">✕</div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2">
            {isPaymentCompleted || isCODPending
              ? 'Order Confirmed!'
              : isPaymentPending
                ? 'Payment Pending'
                : 'Payment Failed'}
          </h1>

          <p className="text-center text-gray-600 mb-8">
            {isPaymentCompleted
              ? 'Thank you for your order. We have received your payment and will process your order shortly.'
              : isCODPending
                ? 'Thank you for your order. Please pay when you receive your delivery (Cash on Delivery).'
                : isPaymentPending
                  ? 'Your order has been placed, but payment confirmation is pending. We will update you once payment is confirmed.'
                  : 'Your order was placed, but payment could not be processed. Please try again.'}
          </p>

          {/* Order Details */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium capitalize">{order.status.toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: order.currency,
                  }).format(order.grandTotal)}
                </span>
              </div>
              {payment && (
                <>
                  {payment.paymentMethod?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{payment.paymentMethod.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-medium ${
                        isPaymentCompleted || isCODPending
                          ? 'text-green-600'
                          : isPaymentPending
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {isCODPending
                        ? 'Pay on delivery'
                        : paymentStatus.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Amount:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: payment.currency,
                      }).format(payment.amount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Customer Email */}
          {order.customerEmail && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                A confirmation email has been sent to <strong>{order.customerEmail}</strong>
              </p>
            </div>
          )}

          {/* Create account with same email (guest checkout) */}
          {order.customerEmail && !isAuthenticated && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">Create an account</h3>
              <p className="text-sm text-gray-600 mb-3">
                Use the same email <strong>{order.customerEmail}</strong> to create an account. We&apos;ll send you a link to set your password so you can log in next time.
              </p>
              {accountCreationSent ? (
                <p className="text-sm text-green-700">
                  Check your email for a link to create your password. The link expires in 24 hours.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={accountCreationLoading}
                    onClick={async () => {
                      setAccountCreationError(null);
                      setAccountCreationLoading(true);
                      try {
                        await authService.requestAccountCreation(order.customerEmail!);
                        setAccountCreationSent(true);
                      } catch (e) {
                        setAccountCreationError(e instanceof Error ? e.message : 'Request failed. Please try again.');
                      } finally {
                        setAccountCreationLoading(false);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {accountCreationLoading ? 'Sending…' : 'Create account with this email'}
                  </button>
                  {accountCreationError && (
                    <p className="text-sm text-red-600 mt-2">{accountCreationError}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isPaymentFailed && (
              <button
                onClick={() => router.push(`/checkout?orderId=${order.id}`)}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry Payment
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

