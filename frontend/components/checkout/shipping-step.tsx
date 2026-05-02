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
        <h2 className="text-2xl font-semibold mb-4">Shipping Method</h2>

        {loadingOptions ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading shipping options...</p>
          </div>
        ) : optionsError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {optionsError}
          </div>
        ) : shippingOptions.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            No shipping options available for this address.
          </div>
        ) : (
          <div className="space-y-3">
            {shippingOptions.map((option) => (
              <label
                key={option.methodId}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedMethodId === option.methodId
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="shipping-method"
                    value={option.methodId}
                    checked={selectedMethodId === option.methodId}
                    onChange={(e) => setSelectedMethodId(e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{option.methodName}</div>
                        {option.description && (
                          <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                        )}
                        {option.estimatedDays && (
                          <div className="text-sm text-gray-500 mt-1">
                            Estimated delivery: {option.estimatedDays} day
                            {option.estimatedDays !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 ml-4">
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
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
          disabled={isLoading || loadingOptions || !selectedMethodId}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );
}

