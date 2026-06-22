'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService, AuthError } from '@/lib/auth.service';
import { storefrontUi } from '@/lib/storefront-ui';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors: { password?: string; confirmPassword?: string } = {};
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(undefined);

    if (!token) {
      setApiError('Missing reset token. Please use the link from your email.');
      return;
    }

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      router.push('/login?reset=success');
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

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Invalid link</h1>
          <p className="mt-2 text-muted-foreground">
            This page requires a valid password reset link from your email. Please request a new
            one if your link has expired.
          </p>
          <Link
            href="/forgot-password"
            className={`mt-6 inline-block ${storefrontUi.link} underline`}
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Enter a new password for your account.
          </p>
        </div>

        <form className="mt-8 space-y-6 rounded-lg bg-card p-8 shadow-sm" onSubmit={handleSubmit}>
          {apiError && (
            <div className={storefrontUi.alertErrorSm} role="alert">
              <p className="text-sm">{apiError}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className={storefrontUi.label}>
              New password
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
                if (validationErrors.password) {
                  setValidationErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className={storefrontUi.inputMt}
              placeholder="••••••••"
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-destructive">{validationErrors.password}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={storefrontUi.label}>
              Confirm new password
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
                if (validationErrors.confirmPassword) {
                  setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              className={storefrontUi.inputMt}
              placeholder="••••••••"
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
              {isLoading ? 'Resetting…' : 'Reset password'}
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className={`${storefrontUi.link} underline`}>
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12" />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
