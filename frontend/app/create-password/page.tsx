'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth.store';
import Link from 'next/link';

export default function CreatePasswordPage() {
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Invalid link</h1>
          <p className="mt-2 text-gray-600">
            This page requires a valid link from your email. Please use the link we sent you after placing an order, or request a new one from the order confirmation page.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-blue-600 hover:underline"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Create your password
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Set a password to sign in to your account.
          </p>
        </div>

        <form className="mt-8 space-y-6 rounded-lg bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
