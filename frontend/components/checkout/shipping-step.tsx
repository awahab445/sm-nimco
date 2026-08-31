'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCheckout } from '@/lib/checkout-context';
import { shippingApi, storeSettingsApi } from '@/lib/api-client';
import { pickDefaultShippingMethodId } from '@/lib/hooks/use-pakistan-address-options';
import { getShippingEstimatePreference } from '@/lib/shipping-estimate-preference';
import { shippingDeliveryLabel } from '@/lib/shipping-delivery-label';
import { formatPrice } from '@/lib/currency';
import { storefrontUi } from '@/lib/storefront-ui';

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

type ShippingOptionRow = {
  methodId: string;
  methodCode: string;
  methodName: string;
  cost: number;
  currency: string;
  estimatedDays?: number;
  description?: string;
  originalCost?: number;
  effectivePrice?: number;
  isFreeShipping?: boolean;
};

export function ShippingStep({ onNext, onBack }: ShippingStepProps) {
  const { checkout, updateShippingMethod, isLoading, error } = useCheckout();
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionRow[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    checkout?.shippingMethod?.methodId || null,
  );
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(2000);

  useEffect(() => {
    let cancelled = false;
    storeSettingsApi
      .getStoreSettings()
      .then((res) => {
        if (cancelled) return;
        const freeDelivery = Number(res.data.freeDeliveryThreshold);
        if (Number.isFinite(freeDelivery) && freeDelivery >= 0) {
          setFreeDeliveryThreshold(freeDelivery);
        }
      })
      .catch(() => {
        /* keep default */
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

        if (!selectedMethodId && options.length > 0) {
          const preferredCode = getShippingEstimatePreference()?.methodCode;
          const preferred = preferredCode
            ? options.find((o) => o.methodCode === preferredCode)
            : undefined;
          setSelectedMethodId(
            preferred?.methodId ?? pickDefaultShippingMethodId(options),
          );
        }
      } catch (err: unknown) {
        setOptionsError(
          err instanceof Error ? err.message : 'Failed to load shipping options',
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    void loadShippingOptions();
  }, [
    checkout?.shippingAddress,
    checkout?.items,
    checkout?.subtotal,
    checkout?.currency,
    checkout?.customerGroupId,
  ]);

  const qualifiesForFreeDelivery = useMemo(() => {
    const subtotal = Number(checkout?.subtotal ?? 0);
    return (
      (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) ||
      shippingOptions.some((o) => o.isFreeShipping === true)
    );
  }, [checkout?.subtotal, freeDeliveryThreshold, shippingOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethodId) {
      setOptionsError('Please select a shipping method');
      return;
    }

    const selectedOption = shippingOptions.find(
      (opt) => opt.methodId === selectedMethodId,
    );
    if (!selectedOption) return;

    const effectiveCost =
      qualifiesForFreeDelivery || selectedOption.isFreeShipping
        ? 0
        : Number(selectedOption.effectivePrice ?? selectedOption.cost);

    try {
      await updateShippingMethod({
        methodCode: selectedOption.methodCode,
        methodId: selectedOption.methodId,
        methodName: selectedOption.methodName,
        cost: effectiveCost,
        currency: selectedOption.currency,
        estimatedDays: selectedOption.estimatedDays || 0,
      });
      onNext();
    } catch {
      // Error is handled by context
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display mb-4 text-2xl font-semibold tracking-tight text-foreground">
          Shipping Method
        </h2>

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
            {shippingOptions.map((option) => {
              const optionIsFree =
                qualifiesForFreeDelivery ||
                option.isFreeShipping === true ||
                Number(option.effectivePrice ?? option.cost) === 0;
              const original = Number(
                option.originalCost ??
                  (optionIsFree && Number(option.cost) > 0 ? option.cost : 0),
              );
              const showStrike = optionIsFree && original > 0;
              return (
                <label
                  key={option.methodId}
                  className={`block cursor-pointer rounded-sm border p-4 transition-colors ${
                    selectedMethodId === option.methodId
                      ? `${storefrontUi.optionSelected} ring-1 ring-ring`
                      : storefrontUi.optionIdle
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="shipping-method"
                      value={option.methodId}
                      checked={selectedMethodId === option.methodId}
                      onChange={(e) => setSelectedMethodId(e.target.value)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-ring/30"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-foreground">
                            {option.methodName}
                          </div>
                          {option.description && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          )}
                          {(option.methodCode === 'economy_shipping' ||
                            option.methodCode === 'overland_shipping' ||
                            option.estimatedDays) && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              Estimated delivery:{' '}
                              {shippingDeliveryLabel(option.methodCode) ??
                                `${option.estimatedDays} day${option.estimatedDays !== 1 ? 's' : ''}`}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                          {showStrike ? (
                            <>
                              <span className="text-sm font-normal text-muted-foreground line-through">
                                {formatPrice(original, option.currency)}
                              </span>
                              <span className="text-emerald-700 dark:text-emerald-400">
                                FREE
                              </span>
                            </>
                          ) : optionIsFree ? (
                            <span className="text-emerald-700 dark:text-emerald-400">
                              FREE
                            </span>
                          ) : (
                            formatPrice(
                              Number(option.effectivePrice ?? option.cost),
                              option.currency,
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
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
          className={storefrontUi.btnNeutralLg}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || loadingOptions || !selectedMethodId}
          className={`${storefrontUi.btnPrimary} px-6 py-2`}
        >
          {isLoading ? 'Saving...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );
}
