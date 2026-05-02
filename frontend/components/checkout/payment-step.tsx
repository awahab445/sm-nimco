'use client';

import { useState, useEffect } from 'react';
import { useCheckout } from '@/lib/checkout-context';
import { paymentApi } from '@/lib/api-client';

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
  metadata?: Record<string, any>;
}

export function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  const { setPaymentInfo, isLoading, error } = useCheckout();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
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
      } catch (err: any) {
        setFormError(err.message || 'Failed to load payment methods');
      } finally {
        setLoadingMethods(false);
      }
    };

    loadPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedMethod) {
      setFormError('Please select a payment method');
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    // Store payment info in context and proceed to review step
    setPaymentInfo({
      paymentMethodCode: selectedMethod,
      customerEmail,
      customerName: customerName || undefined,
      notes: notes || undefined,
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>

        {loadingMethods ? (
          <div className="mb-6 text-center py-8 text-gray-500">Loading payment methods...</div>
        ) : paymentMethods.length === 0 ? (
          <div className="mb-6 text-center py-8 text-red-500">No payment methods available</div>
        ) : (
          <div className="space-y-3 mb-6">
            {paymentMethods.map((method) => (
              <label
                key={method.code}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.code
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.code}
                    checked={selectedMethod === method.code}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 font-medium text-gray-900">{method.name}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="customer-email" className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              id="customer-email"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium mb-1">
              Full Name (optional)
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Order Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Special delivery instructions, etc."
            />
          </div>
        </div>
      </div>

      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || formError}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Review Order'}
        </button>
      </div>
    </form>
  );
}

