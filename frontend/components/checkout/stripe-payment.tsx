'use client';

import { useEffect, useState } from 'react';

interface StripePaymentProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function StripePayment({ clientSecret, onSuccess, onError }: StripePaymentProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => setStripeLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeLoaded || !window.Stripe) {
      onError('Stripe.js not loaded');
      return;
    }

    setProcessing(true);

    try {
      // Initialize Stripe (you'll need to set your publishable key)
      const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
      
      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // Card element would be rendered here
            // For now, this is a placeholder
          },
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!stripeLoaded) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="mt-2 text-muted-foreground">Loading payment form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded border border-warning/30 bg-warning/10 px-4 py-3 text-warning">
        <p className="text-sm">
          Note: This is a simplified Stripe integration. In production, you would render Stripe Elements
          (CardElement) here and collect card details securely.
        </p>
      </div>
      
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="mb-2 text-sm text-muted-foreground">
          Stripe payment form would be rendered here with:
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Card number input</li>
          <li>Expiry date input</li>
          <li>CVC input</li>
          <li>Cardholder name input</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full rounded-md bg-primary px-6 py-2 text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

// Extend Window interface for Stripe
declare global {
  interface Window {
    Stripe: any;
  }
}

