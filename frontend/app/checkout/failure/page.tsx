'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { storefrontUi } from '@/lib/storefront-ui';

function CheckoutFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error') || 'Payment could not be processed';

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-card p-8 text-center shadow-sm">
          <div className="mb-4 text-6xl text-destructive">✕</div>

          <h1 className="mb-2 text-3xl font-bold text-foreground">Payment Failed</h1>
          <p className="mb-8 text-muted-foreground">{error}</p>

          <div className="mb-6 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-left">
            <p className="text-sm text-destructive">
              Your order may have been created, but payment could not be completed. Please try
              again or contact support if the problem persists.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {orderId && (
              <button
                type="button"
                onClick={() => router.push(`/checkout?orderId=${orderId}`)}
                className={`${storefrontUi.btnPrimary} px-6 py-2`}
              >
                Retry Payment
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="rounded-md border border-border bg-card px-6 py-2 text-foreground transition-colors hover:bg-muted"
            >
              Return to Home
            </button>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@example.com" className={`${storefrontUi.link} underline`}>
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30 py-8" />}>
      <CheckoutFailureContent />
    </Suspense>
  );
}
