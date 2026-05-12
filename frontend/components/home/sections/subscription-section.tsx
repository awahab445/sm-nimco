'use client';

import { SubscriptionSignupForm } from '@/components/subscription/subscription-signup-form';

interface SubscriptionSectionProps {
  title: string;
  subtitle?: string;
}

export function SubscriptionSection({ title, subtitle }: SubscriptionSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card px-6 py-10 shadow-sm sm:px-10">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
        <div className="mt-6">
          <SubscriptionSignupForm source="home" inputId="home-subscription-email" />
        </div>
      </div>
    </section>
  );
}
