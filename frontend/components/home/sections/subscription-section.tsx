'use client';

import { SubscriptionSignupForm } from '@/components/subscription/subscription-signup-form';

interface SubscriptionSectionProps {
  title: string;
  subtitle?: string;
}

/** Kalles newsletter_1 form: pill outline + solid charcoal submit (home band) */
const subscriptionFormClassName =
  'subscription-section__form [&_form]:flex-row [&_form]:items-stretch [&_form]:gap-0 [&_input]:min-h-[44px] [&_input]:flex-1 [&_input]:rounded-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:py-2.5 [&_input]:text-sm [&_input]:text-foreground [&_input]:shadow-none [&_input]:placeholder:text-muted-foreground [&_input]:focus:border-0 [&_input]:focus:ring-0 [&_button]:shrink-0 [&_button]:rounded-[var(--radius-button,3rem)] [&_button]:px-[15px] [&_button]:py-2 [&_button]:text-sm [&_button]:font-semibold';

export function SubscriptionSection({ title, subtitle }: SubscriptionSectionProps) {
  return (
    <section className="subscription-section relative overflow-hidden">
      <div
        className="subscription-section__bg absolute inset-0 bg-[var(--newsletter-band-background,#32355d)] bg-cover bg-center"
        aria-hidden
      />
      <div className="subscription-section__inner relative z-[1] mx-auto grid w-full max-w-[100rem] grid-cols-1 items-center gap-5 px-4 py-8 sm:gap-6 sm:px-8 sm:py-12 md:grid-cols-2 md:gap-8 lg:px-12 xl:px-16">
        <div className="subscription-section__copy text-center md:text-center">
          <h2 className="subscription-section__title font-display text-lg font-normal leading-none tracking-tight text-[var(--newsletter-band-foreground,#fff)] sm:text-xl sm:text-[1.25rem]">
            {title}
          </h2>
          {subtitle ? (
            <p className="subscription-section__subtitle mt-2 text-sm text-[var(--newsletter-band-muted,rgba(255,255,255,0.78))]">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="subscription-section__form-wrap mx-auto w-full max-w-[570px] md:mx-0 md:justify-self-end">
          <SubscriptionSignupForm
            source="home"
            inputId="home-subscription-email"
            placeholder="Enter email address"
            className={subscriptionFormClassName}
          />
        </div>
      </div>
    </section>
  );
}
