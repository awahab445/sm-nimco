'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { orderApi, paymentApi } from '@/lib/api-client';
import { authService } from '@/lib/auth.service';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';
import { storefrontUi } from '@/lib/storefront-ui';

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

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const email = searchParams.get('email');

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
        let orderData: any;
        let payments: Awaited<ReturnType<typeof paymentApi.getPaymentsByOrder>> = [];
        if (email && orderNumber) {
          orderData = await orderApi.trackOrder(orderNumber, email);
          try {
            payments = await paymentApi.trackPayments(orderNumber, email);
          } catch {
            // Order may exist before payments are created; continue without payments
          }
        } else if (orderId) {
          orderData = await orderApi.getOrder(orderId);
          try {
            payments = await paymentApi.getPaymentsByOrder(orderData.id);
          } catch {
            // Order may exist before payments are created; continue without payments
          }
        } else {
          setError('Order tracking link is incomplete. Please use order number + email.');
          setLoading(false);
          return;
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
  }, [orderId, orderNumber, email]);

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="w-full max-w-md rounded-lg bg-card p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl text-destructive">✕</div>
          <h1 className="mb-2 text-2xl font-semibold text-foreground">Order Not Found</h1>
          <p className="mb-6 text-muted-foreground">{error || 'Unable to load order details.'}</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className={`${storefrontUi.btnPrimary} px-6 py-2`}
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
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-card p-8 shadow-sm">
          {/* Success Icon */}
          <div className="mb-6 text-center">
            {isPaymentCompleted || isCODPending ? (
              <div className="mb-4 text-6xl text-success">✓</div>
            ) : isPaymentPending ? (
              <div className="mb-4 text-6xl text-warning">⏳</div>
            ) : (
              <div className="mb-4 text-6xl text-destructive">✕</div>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
            {isPaymentCompleted || isCODPending
              ? 'Order Confirmed!'
              : isPaymentPending
                ? 'Payment Pending'
                : 'Payment Failed'}
          </h1>

          <p className="mb-8 text-center text-muted-foreground">
            {isPaymentCompleted
              ? 'Thank you for your order. We have received your payment and will process your order shortly.'
              : isCODPending
                ? 'Thank you for your order. Please pay when you receive your delivery (Cash on Delivery).'
                : isPaymentPending
                  ? 'Your order has been placed, but payment confirmation is pending. We will update you once payment is confirmed.'
                  : 'Your order was placed, but payment could not be processed. Please try again.'}
          </p>

          {/* Order Details */}
          <div className="mb-6 border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Status:</span>
                <span className="font-medium capitalize">{order.status.toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
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
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">{payment.paymentMethod.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span
                      className={`font-medium ${
                        isPaymentCompleted || isCODPending
                          ? 'text-success'
                          : isPaymentPending
                            ? 'text-warning'
                            : 'text-destructive'
                      }`}
                    >
                      {isCODPending
                        ? 'Pay on delivery'
                        : paymentStatus.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Amount:</span>
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
            <div className="mb-6 rounded-lg border border-brand-secondary/60 bg-brand-secondary/25 p-4">
              <p className="text-sm text-foreground">
                A confirmation email has been sent to <strong>{order.customerEmail}</strong>
              </p>
            </div>
          )}

          {/* Create account with same email (guest checkout) */}
          {order.customerEmail && !isAuthenticated && (
            <div className="mb-6 rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="mb-2 font-medium text-foreground">Create an account</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Use the same email <strong>{order.customerEmail}</strong> to create an account. We&apos;ll send you a link to set your password so you can log in next time.
              </p>
              {accountCreationSent ? (
                <p className="text-sm text-success">
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
                    className={`${storefrontUi.btnPrimary} px-4 py-2 text-sm`}
                  >
                    {accountCreationLoading ? 'Sending…' : 'Create account with this email'}
                  </button>
                  {accountCreationError && (
                    <p className="mt-2 text-sm text-destructive">{accountCreationError}</p>
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
                className={`btn-brand-primary flex-1 px-6 py-2`}
              >
                Retry Payment
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="flex-1 rounded-md border border-border bg-card px-6 py-2 text-foreground transition-colors hover:bg-muted"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30 py-8" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

