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
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className={`${storefrontUi.card} p-8 text-center`}>
          <div className="mb-4 text-6xl text-destructive">✕</div>

          <h1 className="font-display mb-2 text-3xl font-semibold tracking-tight text-foreground">Payment Failed</h1>
          <p className="mb-8 text-muted-foreground">{error}</p>

          <div className={`mb-6 ${storefrontUi.alertError} text-left`}>
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
              className={storefrontUi.btnNeutralLg}
            >
              Return to Home
            </button>
          </div>

          <div className="mt-8 border-t border-border/60 pt-6">
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
      <Suspense fallback={<div className="min-h-screen bg-background py-8" />}>
      <CheckoutFailureContent />
    </Suspense>
  );
}
