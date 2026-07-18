'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth.store';
import Link from 'next/link';
import { storefrontUi } from '@/lib/storefront-ui';
import { useHydrated } from '@/lib/use-hydrated';
import { trackCompleteRegistration } from '@/lib/analytics/events';

function RegisterFormSkeleton() {
  const field = (labelWidth = 'w-24') => (
    <div>
      <div className={`mb-2 h-4 ${labelWidth} rounded bg-muted`} />
      <div className={`${storefrontUi.inputMt} h-10 animate-pulse bg-muted/60`} />
    </div>
  );

  return (
    <div className="mt-8 space-y-6" aria-hidden>
      <div className="space-y-4 rounded-md shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          {field('w-20')}
          {field('w-20')}
        </div>
        {field('w-28')}
        {field('w-32')}
        {field('w-20')}
        {field('w-32')}
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
    </div>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const redirectTo = searchParams.get('redirect') || '/account';
  const { register, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/account');
    }
  }, [isAuthenticated, router]);

  const validate = () => {
    const errors: typeof validationErrors = {};

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

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
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
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      trackCompleteRegistration({ method: 'email', status: true });
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className={storefrontUi.link}>
              Sign in
            </Link>
          </p>
        </div>

        {!hydrated ? (
          <div className={`${storefrontUi.card} border border-border p-6 shadow-product-card sm:p-8`}>
            <RegisterFormSkeleton />
          </div>
        ) : (
        <form
          className={`${storefrontUi.card} space-y-6 border border-border p-6 shadow-product-card sm:p-8`}
          onSubmit={handleSubmit}
        >
          {error && (
            <div className={storefrontUi.alertErrorSm} role="alert">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={storefrontUi.label}>
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={storefrontUi.inputMt}
                  placeholder="John"
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-destructive">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className={storefrontUi.label}>
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={storefrontUi.inputMt}
                  placeholder="Doe"
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-destructive">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

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
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className={storefrontUi.label}>
                Phone number <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={storefrontUi.inputMt}
                placeholder="+1 (555) 123-4567"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.phone}</p>
              )}
            </div>

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
                value={formData.password}
                onChange={handleChange}
                className={storefrontUi.inputMt}
                placeholder="••••••••"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.password}</p>
              )}
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
                value={formData.confirmPassword}
                onChange={handleChange}
                className={storefrontUi.inputMt}
                placeholder="••••••••"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center ${storefrontUi.btnPrimary}`}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8" />}>
      <RegisterContent />
    </Suspense>
  );
}
