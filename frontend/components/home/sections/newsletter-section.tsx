'use client';

import { useState } from 'react';

interface NewsletterSectionProps {
  title: string;
  subtitle?: string;
}

/**
 * UI-only block — wire `onSubmit` to your newsletter / CRM API when the backend is ready.
 */
export function NewsletterSection({ title, subtitle }: NewsletterSectionProps) {
  const [status, setStatus] = useState<'idle' | 'done'>('idle');

  return (
    <section className="rounded-2xl border border-border bg-card px-6 py-10 shadow-sm sm:px-10">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch"
          onSubmit={(e) => {
            e.preventDefault();
            setStatus('done');
          }}
        >
          <label htmlFor="home-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="home-newsletter-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className="min-w-0 flex-1 rounded-md border border-input bg-muted px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Subscribe
          </button>
        </form>
        {status === 'done' && (
          <p className="mt-3 text-sm text-success" role="status">
            Thanks — connect this form to your API to complete signup.
          </p>
        )}
      </div>
    </section>
  );
}
