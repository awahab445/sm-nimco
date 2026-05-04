'use client';

import { useState, useEffect } from 'react';
import { useCheckout } from '@/lib/checkout-context';
import { shippingApi } from '@/lib/api-client';
import { DEFAULT_CURRENCY } from '@/lib/config';

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ShippingStep({ onNext, onBack }: ShippingStepProps) {
  const { checkout, updateShippingMethod, isLoading, error } = useCheckout();
  const [shippingOptions, setShippingOptions] = useState<Array<{
    methodId: string;
    methodCode: string;
    methodName: string;
    cost: number;
    currency: string;
    estimatedDays?: number;
    description?: string;
  }>>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    checkout?.shippingMethod?.methodId || null,
  );
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    const loadShippingOptions = async () => {
      if (!checkout?.shippingAddress) {
        setOptionsError('Please provide shipping address first');
        return;
      }

      try {
        setLoadingOptions(true);
        setOptionsError(null);
        const options = await shippingApi.calculateShipping({
          shippingAddress: {
            country: checkout.shippingAddress.country,
            region: checkout.shippingAddress.state,
            city: checkout.shippingAddress.city,
            postalCode: checkout.shippingAddress.postalCode,
          },
          items: checkout.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: checkout.subtotal,
          currency: checkout.currency,
          customerGroupId: checkout.customerGroupId,
        });
        setShippingOptions(options);
        
        // Auto-select first option if none selected
        if (!selectedMethodId && options.length > 0) {
          setSelectedMethodId(options[0].methodId);
        }
      } catch (err: any) {
        setOptionsError(err.message || 'Failed to load shipping options');
      } finally {
        setLoadingOptions(false);
      }
    };

    loadShippingOptions();
  }, [checkout?.shippingAddress, checkout?.items, checkout?.subtotal, checkout?.currency, checkout?.customerGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethodId) {
      setOptionsError('Please select a shipping method');
      return;
    }

    const selectedOption = shippingOptions.find((opt) => opt.methodId === selectedMethodId);
    if (!selectedOption) return;

    try {
      await updateShippingMethod({
        methodId: selectedOption.methodId,
        methodName: selectedOption.methodName,
        cost: selectedOption.cost,
        currency: selectedOption.currency,
        estimatedDays: selectedOption.estimatedDays || 0,
      });
      onNext();
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Shipping Method</h2>

        {loadingOptions ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="mt-2 text-muted-foreground">Loading shipping options...</p>
          </div>
        ) : optionsError ? (
          <div className="rounded border border-destructive/25 bg-destructive/10 px-4 py-3 text-destructive">
            {optionsError}
          </div>
        ) : shippingOptions.length === 0 ? (
          <div className="rounded border border-warning/30 bg-warning/10 px-4 py-3 text-warning">
            No shipping options available for this address.
          </div>
        ) : (
          <div className="space-y-3">
            {shippingOptions.map((option) => (
              <label
                key={option.methodId}
                className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  selectedMethodId === option.methodId
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-input'
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="shipping-method"
                    value={option.methodId}
                    checked={selectedMethodId === option.methodId}
                    onChange={(e) => setSelectedMethodId(e.target.value)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-ring"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-foreground">{option.methodName}</div>
                        {option.description && (
                          <div className="mt-1 text-sm text-muted-foreground">{option.description}</div>
                        )}
                        {option.estimatedDays && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Estimated delivery: {option.estimatedDays} day
                            {option.estimatedDays !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-lg font-semibold text-foreground">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: DEFAULT_CURRENCY,
                        }).format(option.cost)}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded border border-destructive/25 bg-destructive/10 px-4 py-3 text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-border bg-card px-6 py-2 text-foreground transition-colors hover:bg-muted"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || loadingOptions || !selectedMethodId}
          className="rounded-md bg-primary px-6 py-2 text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );
}

