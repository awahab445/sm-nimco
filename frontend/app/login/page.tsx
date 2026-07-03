'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth.store';
import Link from 'next/link';
import { safeRedirectPath } from '@/lib/safe-redirect';
import { storefrontUi } from '@/lib/storefront-ui';
import { showStorefrontToast } from '@/lib/storefront-toast';
import { useHydrated } from '@/lib/use-hydrated';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get('redirect'), '/account');
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const hydrated = useHydrated();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      showStorefrontToast('Your password has been reset. You can now sign in.', 'success');
    }
    if (searchParams.get('verified') === 'true') {
      showStorefrontToast('Your email has been verified. You can now sign in.', 'success');
    }
  }, [searchParams]);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) {
      return;
    }

    try {
      await login(formData);
      router.push(redirectTo.startsWith('/') ? redirectTo : '/account');
    } catch {
      // Error is handled by the store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof validationErrors];
        return newErrors;
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link href="/register" className={storefrontUi.link}>
              create a new account
            </Link>
            .{' '}
            <Link href="/track-order" className={storefrontUi.link}>
              Track an order
            </Link>{' '}
            without logging in.
          </p>
        </div>

        {hydrated ? (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={storefrontUi.alertErrorSm} role="alert">
              <p className="text-sm">{error}</p>
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
                value={formData.email}
                onChange={handleChange}
                className={storefrontUi.inputMt}
                placeholder="you@example.com"
                data-lpignore="true"
                data-1p-ignore
                data-form-type="other"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className={storefrontUi.label}>
                  Password
                </label>
                <Link href="/forgot-password" className={`text-sm ${storefrontUi.link}`}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={storefrontUi.inputMt}
                placeholder="••••••••"
                data-lpignore="true"
                data-1p-ignore
                data-form-type="other"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center ${storefrontUi.btnPrimary}`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        ) : (
          <div className="mt-8 space-y-6" aria-hidden>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <span className={storefrontUi.label}>Email address</span>
                <div className={`${storefrontUi.inputMt} text-muted-foreground`}>you@example.com</div>
              </div>
              <div>
                <span className={storefrontUi.label}>Password</span>
                <div className={`${storefrontUi.inputMt} text-muted-foreground`}>••••••••</div>
              </div>
            </div>
            <button type="button" disabled className={`flex w-full justify-center ${storefrontUi.btnPrimary}`}>
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8" />}>
      <LoginContent />
    </Suspense>
  );
}
