'use client';

import { subscriptionApi } from '@/lib/api-client';
import { useHydrated } from '@/lib/use-hydrated';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { storefrontUi } from '@/lib/storefront-ui';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export type SubscriptionSignupFormProps = {
  source?: string;
  defaultEmail?: string;
  className?: string;
  inputId?: string;
  placeholder?: string;
};

export function SubscriptionSignupForm({
  source,
  defaultEmail = '',
  className = '',
  inputId = 'subscription-email',
  placeholder = 'you@example.com',
}: SubscriptionSignupFormProps) {
  const hydrated = useHydrated();
  const [email, setEmail] = useState(defaultEmail);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail.trim()) {
      setEmail((prev) => (prev.trim() === '' ? defaultEmail : prev));
    }
  }, [defaultEmail]);

  const validate = useCallback((value: string) => {
    const t = value.trim();
    if (!t) return 'Please enter your email address.';
    if (t.length > 255) return 'Email is too long.';
    if (!EMAIL_RE.test(t)) return 'Please enter a valid email address.';
    return null;
  }, []);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSuccessMessage(null);
      setServerError(null);
      const v = validate(email);
      if (v) {
        setClientError(v);
        return;
      }
      setClientError(null);
      setLoading(true);
      try {
        const res = await subscriptionApi.subscribe({
          email: email.trim(),
          ...(source ? { source } : {}),
        });
        setSuccessMessage(res.message || 'Thank you for subscribing!');
        if (source === 'account' && defaultEmail.trim()) {
          setEmail(defaultEmail.trim());
        } else {
          setEmail('');
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: string }).message)
            : 'Something went wrong. Please try again.';
        setServerError(msg);
      } finally {
        setLoading(false);
      }
    },
    [email, source, validate, defaultEmail],
  );

  return (
    <div className={className}>
      {hydrated ? (
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
          onSubmit={(e) => void onSubmit(e)}
          noValidate
        >
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            autoComplete="email"
            disabled={loading}
            suppressHydrationWarning
            className="min-w-0 flex-1 rounded-md border border-input bg-muted px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className={`${storefrontUi.btnPrimary} px-5 py-2.5`}
          >
            {loading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      ) : (
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
          aria-hidden
        >
          <div className="min-h-[42px] min-w-0 flex-1 rounded-md border border-input bg-muted" />
          <div className="h-[42px] w-28 shrink-0 rounded-md bg-primary/80" />
        </div>
      )}
      {clientError ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {clientError}
        </p>
      ) : null}
      {serverError ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {serverError}
        </p>
      ) : null}
      {successMessage ? (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {successMessage}
        </p>
      ) : null}
    </div>
  );
}
