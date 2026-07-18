'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth.service';
import { storefrontUi } from '@/lib/storefront-ui';

type VerificationState = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'error');

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        if (cancelled) return;

        setState('success');
        redirectTimer = setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } catch {
        if (!cancelled) {
          setState('error');
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className={`w-full max-w-md ${storefrontUi.card} border border-border p-8 text-center shadow-product-card`}>
        {state === 'loading' && (
          <>
            <div
              className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"
              aria-hidden="true"
            />
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Your email is being verified...
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we confirm your account.
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
              🎉 Your email has been verified successfully!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecting you to sign in in a few seconds...
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <p className="text-base text-foreground">
              {!token ? (
                'Invalid or missing verification token.'
              ) : (
                '❌ Verification failed. The token may be expired or invalid.'
              )}
            </p>
            <Link
              href="/login"
              className={`mt-6 inline-block ${storefrontUi.link} underline`}
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <div className={`w-full max-w-md ${storefrontUi.card} border border-border p-8 text-center shadow-product-card`}>
            <div
              className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"
              aria-hidden="true"
            />
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Your email is being verified...
            </h1>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
