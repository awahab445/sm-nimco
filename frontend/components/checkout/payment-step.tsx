'use client';

import { useState, useEffect } from 'react';
import { useCheckout } from '@/lib/checkout-context';
import { paymentApi } from '@/lib/api-client';
import { storefrontUi } from '@/lib/storefront-ui';

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface PaymentMethod {
  code: string;
  name: string;
  provider: string;
  flowType: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  const { checkout, setPaymentInfo, isLoading, error } = useCheckout();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setLoadingMethods(true);
        const methods = await paymentApi.getPaymentMethods();
        setPaymentMethods(methods);
        // Auto-select COD if available
        const codMethod = methods.find((m) => m.code === 'cod');
        if (codMethod) {
          setSelectedMethod('cod');
        }
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'Failed to load payment methods');
      } finally {
        setLoadingMethods(false);
      }
    };

    void loadPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedMethod) {
      setFormError('Please select a payment method');
      return;
    }

    const email = checkout?.customerEmail?.trim() ?? '';
    if (!email || !email.includes('@')) {
      setFormError('A valid email is required. Please go back and enter your email.');
      return;
    }

    setPaymentInfo({
      paymentMethodCode: selectedMethod,
      customerEmail: email,
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display mb-4 text-2xl font-semibold tracking-tight text-foreground">Payment Method</h2>

        {loadingMethods ? (
          <div className="mb-6 py-8 text-center text-muted-foreground">Loading payment methods...</div>
        ) : paymentMethods.length === 0 ? (
          <div className="mb-6 py-8 text-center text-destructive">No payment methods available</div>
        ) : (
          <div className="mb-6 space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.code}
                className={`block cursor-pointer rounded-sm border p-4 transition-colors ${
                  selectedMethod === method.code
                    ? `${storefrontUi.optionSelected} ring-1 ring-ring`
                    : storefrontUi.optionIdle
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.code}
                    checked={selectedMethod === method.code}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-ring/30"
                  />
                  <span className="ml-3 font-medium text-foreground">{method.name}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {(error || formError) && (
        <div className={storefrontUi.alertError}>
          {error || formError}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className={storefrontUi.btnNeutralLg}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`${storefrontUi.btnPrimary} px-6 py-2`}
        >
          {isLoading ? 'Processing...' : 'Review Order'}
        </button>
      </div>
    </form>
  );
}

