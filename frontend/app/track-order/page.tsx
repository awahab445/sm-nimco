'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderApi } from '@/lib/api-client';
import { storefrontUi } from '@/lib/storefront-ui';
import { useHydrated } from '@/lib/use-hydrated';

export default function TrackOrderPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Track your order | E-commerce';
    return () => {
      document.title = 'E-commerce';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOrderNumber = orderNumber.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!trimmedOrderNumber) {
      setValidationError('Please enter your order number (e.g. ORD-20241221-00001).');
      return;
    }

    setLoading(true);
    try {
      const match = await orderApi.trackOrder(trimmedOrderNumber, trimmedEmail);
      router.push(
        `/orders/${match.id}?orderNumber=${encodeURIComponent(trimmedOrderNumber)}&email=${encodeURIComponent(trimmedEmail)}`,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to look up order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Track your order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the email address and order number from your confirmation to view order status.
        </p>

        {hydrated ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className={storefrontUi.alertErrorSm} role="alert">
                {error}
              </div>
            )}
            {validationError && (
              <div
                className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning"
                role="alert"
              >
                {validationError}
              </div>
            )}

            <div>
              <label htmlFor="track-email" className={storefrontUi.label}>
                Email address
              </label>
              <input
                id="track-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={storefrontUi.inputMt}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="track-order-number" className={storefrontUi.label}>
                Order number
              </label>
              <input
                id="track-order-number"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-20241221-00001"
                className={storefrontUi.inputMt}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${storefrontUi.btnPrimary}`}
              >
                {loading ? 'Looking up…' : 'View order'}
              </button>
              <Link
                href="/"
                className="w-full rounded-md border border-border bg-card px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 focus:ring-offset-background"
              >
                Cancel
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-4" aria-hidden>
            <div className="h-10 rounded-md border border-input bg-muted" />
            <div className="h-10 rounded-md border border-input bg-muted" />
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <div className="h-10 w-full rounded-md bg-primary/80" />
              <div className="h-10 w-full rounded-md border border-border bg-muted" />
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className={storefrontUi.link}>
            Log in
          </Link>{' '}
          to see all your orders.
        </p>
      </div>
    </div>
  );
}
