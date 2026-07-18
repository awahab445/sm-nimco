'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth.store';
import Link from 'next/link';
import { storefrontUi } from '@/lib/storefront-ui';

function CreatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setPasswordFromToken, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/account');
    }
  }, [isAuthenticated, router]);

  const validate = () => {
    const errors: { password?: string; confirmPassword?: string } = {};
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!token) {
      setValidationErrors({ password: 'Missing link. Please use the link from your email.' });
      return;
    }
    if (!validate()) return;

    try {
      await setPasswordFromToken(token, password);
      router.push('/account');
    } catch {
      // Error is set in store
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className={`w-full max-w-md ${storefrontUi.card} border border-border p-8 shadow-product-card`}>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Invalid link</h1>
          <p className="mt-2 text-muted-foreground">
            This page requires a valid link from your email. Please use the link we sent you after placing an order, or request a new one from the order confirmation page.
          </p>
          <Link href="/" className={`mt-6 inline-block ${storefrontUi.link} underline`}>
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Create your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set a password to sign in to your account.
          </p>
        </div>

        <form
          className={`${storefrontUi.card} space-y-6 border border-border p-6 shadow-product-card sm:p-8`}
          onSubmit={handleSubmit}
        >
          {error && (
            <div className={storefrontUi.alertErrorSm} role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className={storefrontUi.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors((p) => ({ ...p, password: undefined }));
              }}
              className={storefrontUi.inputMt}
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-destructive">{validationErrors.password}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={storefrontUi.label}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationErrors.confirmPassword) setValidationErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
              className={storefrontUi.inputMt}
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${storefrontUi.btnPrimary}`}
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className={`${storefrontUi.link} underline`}>
              Return to home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12" />}>
      <CreatePasswordContent />
    </Suspense>
  );
}
