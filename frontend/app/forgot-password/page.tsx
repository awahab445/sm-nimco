'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { authService, AuthError } from '@/lib/auth.service';
import { showStorefrontToast } from '@/lib/storefront-toast';
import { storefrontUi } from '@/lib/storefront-ui';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    if (!email) {
      setValidationError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    setValidationError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(undefined);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      showStorefrontToast('Reset link sent to your email!', 'success');
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : 'Something went wrong. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="rounded-lg border border-brand-primary/25 bg-brand-secondary/20 p-6 text-center shadow-sm">
            <p className="text-sm text-foreground">
              If an account exists with that email, you will receive a password reset link shortly.
              Please check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className={`mt-6 inline-block ${storefrontUi.link} underline`}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {apiError && (
              <div className={storefrontUi.alertErrorSm} role="alert">
                <p className="text-sm">{apiError}</p>
              </div>
            )}

            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className={storefrontUi.label}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(undefined);
                  }}
                  className={storefrontUi.inputMt}
                  placeholder="you@example.com"
                />
                {validationError && (
                  <p className="mt-1 text-sm text-destructive">{validationError}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative flex w-full justify-center ${storefrontUi.btnPrimary}`}
              >
                {isLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/login" className={storefrontUi.link}>
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8" />
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
