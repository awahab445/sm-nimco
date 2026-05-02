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
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading payment form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        <p className="text-sm">
          Note: This is a simplified Stripe integration. In production, you would render Stripe Elements
          (CardElement) here and collect card details securely.
        </p>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600 mb-2">
          Stripe payment form would be rendered here with:
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Card number input</li>
          <li>Expiry date input</li>
          <li>CVC input</li>
          <li>Cardholder name input</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

