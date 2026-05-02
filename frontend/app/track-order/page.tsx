'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderApi } from '@/lib/api-client';

export default function TrackOrderPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Track your order | E-commerce';
    return () => { document.title = 'E-commerce'; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    const trimmedEmail = email.trim();
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
      const response = await orderApi.getOrders({
        customerEmail: trimmedEmail,
        limit: 200,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const match = response.data.find(
        (order) => order.orderNumber.trim().toUpperCase() === trimmedOrderNumber.trim().toUpperCase(),
      );

      if (match) {
        router.push(`/orders/${match.id}`);
        return;
      }

      setError('No order found for this email and order number. Please check and try again.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to look up order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">
          Track your order
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
          Enter the email address and order number from your confirmation to view order status.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}
          {validationError && (
            <div
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
              role="alert"
            >
              {validationError}
            </div>
          )}

          <div>
            <label
              htmlFor="track-email"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Email address
            </label>
            <input
              id="track-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400 sm:text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="track-order-number"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Order number
            </label>
            <input
              id="track-order-number"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ORD-20241221-00001"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400 sm:text-sm"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-zinc-900"
            >
              {loading ? 'Looking up…' : 'View order'}
            </button>
            <Link
              href="/"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:focus:ring-offset-zinc-900"
            >
              Cancel
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-zinc-400">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Log in
          </Link>
          {' '}to see all your orders.
        </p>
      </div>
    </div>
  );
}
