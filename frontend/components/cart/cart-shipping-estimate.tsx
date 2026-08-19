'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { shippingApi, type CartItem } from '@/lib/api-client';
import { formatPrice } from '@/lib/currency';
import { storefrontUi } from '@/lib/storefront-ui';

type CityOption = { id: string; name: string; province: string };

type ShippingOption = {
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

type CartShippingEstimateProps = {
  items: CartItem[];
  subtotal: number;
  currency: string;
  customerGroupId?: string;
};

export function CartShippingEstimate({
  items,
  subtotal,
  currency,
  customerGroupId,
}: CartShippingEstimateProps) {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [cityId, setCityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ShippingOption[] | null>(null);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === cityId) ?? null,
    [cities, cityId],
  );

  const estimateItems = useMemo(
    () =>
      items
        .filter((item) => item.variantId && item.quantity > 0)
        .map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
    [items],
  );

  const cartFingerprint = useMemo(
    () =>
      `${subtotal}|${estimateItems
        .map((item) => `${item.variantId}:${item.quantity}:${item.price}`)
        .join(',')}`,
    [estimateItems, subtotal],
  );

  useEffect(() => {
    let cancelled = false;
    shippingApi
      .getCities()
      .then((list) => {
        if (cancelled) return;
        setCities(
          list
            .map((city) => ({
              id: city.id,
              name: city.name,
              province: city.province,
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        setCitiesError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setCities([]);
          setCitiesError('Could not load cities. Please try again.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOptions(null);
    setError(null);
  }, [cityId, cartFingerprint]);

  const qualifiesForFreeShipping = Boolean(
    options?.some((option) => option.isFreeShipping),
  );

  const handleEstimate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCity) {
      setError('Please select a city.');
      return;
    }
    if (estimateItems.length === 0 && subtotal <= 0) {
      setError('Add items to your cart to estimate shipping.');
      return;
    }

    setLoading(true);
    try {
      const result = await shippingApi.calculateShipping({
        shippingAddress: {
          country: 'PK',
          region: selectedCity.province,
          city: selectedCity.name,
        },
        items: estimateItems,
        subtotal,
        currency,
        customerGroupId,
        cityId: selectedCity.id,
      });
      setOptions(result);
      if (result.length === 0) {
        setError('No shipping options available for this city.');
      }
    } catch (err: unknown) {
      setOptions(null);
      setError(err instanceof Error ? err.message : 'Failed to estimate shipping.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${storefrontUi.card} p-5`}>
      <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
        Estimate Shipping Rates
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Choose your city to preview delivery options for this cart.
      </p>

      <form onSubmit={handleEstimate} className="mt-4 space-y-3">
        <div>
          <label htmlFor="cart-shipping-city" className={storefrontUi.labelMb}>
            City
          </label>
          <select
            id="cart-shipping-city"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className={storefrontUi.select}
            disabled={cities.length === 0}
          >
            <option value="">Select city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.province ? `${city.name} (${city.province})` : city.name}
              </option>
            ))}
          </select>
        </div>

        {citiesError ? (
          <p className="text-xs text-destructive">{citiesError}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !cityId || (estimateItems.length === 0 && subtotal <= 0)}
          className={`${storefrontUi.btnSecondary} w-full py-2.5`}
        >
          {loading ? 'Estimating…' : 'Estimate'}
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      ) : null}

      {options && options.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
          {qualifiesForFreeShipping ? (
            <p className="rounded-sm bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success">
              Qualified for FREE Shipping!
            </p>
          ) : null}
          <ul className="space-y-2">
            {options.map((option) => {
              const displayAmount = Number(
                option.isFreeShipping
                  ? 0
                  : (option.effectivePrice ?? option.cost),
              );
              const originalAmount = Number(option.originalCost ?? option.cost);
              return (
                <li
                  key={option.methodId}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{option.methodName}</p>
                    {option.description ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    ) : null}
                    {option.estimatedDays ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Est. {option.estimatedDays} day{option.estimatedDays === 1 ? '' : 's'}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right font-semibold text-foreground">
                    {option.isFreeShipping ? (
                      <span className="inline-flex items-baseline gap-1.5">
                        {originalAmount > 0 ? (
                          <span className="text-xs font-normal text-muted-foreground line-through">
                            {formatPrice(originalAmount, option.currency || currency)}
                          </span>
                        ) : null}
                        <span className="text-success">FREE</span>
                      </span>
                    ) : (
                      formatPrice(displayAmount, option.currency || currency)
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
