'use client';

import { useEffect, useMemo, useState } from 'react';
import { shippingApi, type CartItem } from '@/lib/api-client';
import { formatPrice, APP_CURRENCY } from '@/lib/currency';
import { PAKISTAN_PROVINCES } from '@/lib/constants/locations';
import {
  mergeCityOptions,
  pickDefaultShippingMethodId,
  usePakistanAddressOptions,
} from '@/lib/hooks/use-pakistan-address-options';
import {
  getShippingEstimatePreference,
  setShippingEstimatePreference,
} from '@/lib/shipping-estimate-preference';
import {
  shippingDeliveryLabel,
  shippingMethodDisplayName,
  shippingMethodEmoji,
} from '@/lib/shipping-delivery-label';
import { isUuid } from '@/lib/shipping-weight';
import { storefrontUi } from '@/lib/storefront-ui';

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

type CartShippingEstimatorProps = {
  items: CartItem[];
  subtotal: number;
  currency?: string;
  customerGroupId?: string;
  /** Compact layout for the cart drawer footer. */
  compact?: boolean;
  /** Start expanded (cart page default). Drawer starts collapsed. */
  defaultOpen?: boolean;
};

export function CartShippingEstimator({
  items,
  subtotal,
  currency = APP_CURRENCY,
  customerGroupId,
  compact = false,
  defaultOpen = true,
}: CartShippingEstimatorProps) {
  const saved = useMemo(() => getShippingEstimatePreference(), []);
  const [open, setOpen] = useState(defaultOpen);
  const [province, setProvince] = useState(saved?.province ?? '');
  const [city, setCity] = useState(saved?.city ?? '');
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedMethodCode, setSelectedMethodCode] = useState<string | null>(
    saved?.methodCode ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addressOptions = usePakistanAddressOptions(province);
  const provinceOptions =
    addressOptions.provinces.length > 0
      ? addressOptions.provinces
      : PAKISTAN_PROVINCES;
  const cityOptions = mergeCityOptions(addressOptions.cities, city);

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

  const itemsKey = useMemo(
    () =>
      estimateItems
        .map((i) => `${i.variantId}:${i.quantity}:${i.price}`)
        .join('|'),
    [estimateItems],
  );

  useEffect(() => {
    if (!open || !province.trim() || !city.trim() || estimateItems.length === 0) {
      setOptions([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const matchedCity = cityOptions.find(
      (c) => c.name.toLowerCase() === city.trim().toLowerCase(),
    );
    const cityId =
      matchedCity && isUuid(matchedCity.id) ? matchedCity.id : undefined;

    shippingApi
      .calculateShipping({
        shippingAddress: {
          country: 'PK',
          region: province.trim(),
          city: city.trim(),
        },
        items: estimateItems,
        subtotal,
        currency,
        customerGroupId,
        cityId,
      })
      .then((rates) => {
        if (cancelled) return;
        setOptions(rates);
        setSelectedMethodCode((current) => {
          if (current && rates.some((r) => r.methodCode === current)) {
            return current;
          }
          const preferred = getShippingEstimatePreference()?.methodCode;
          if (preferred && rates.some((r) => r.methodCode === preferred)) {
            return preferred;
          }
          const defaultId = pickDefaultShippingMethodId(rates);
          return (
            rates.find((r) => r.methodId === defaultId)?.methodCode ??
            rates[0]?.methodCode ??
            null
          );
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setOptions([]);
          setError(err?.message || 'Failed to estimate shipping');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // cityOptions identity changes often; city/province + itemsKey are enough
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberate deps
  }, [
    open,
    province,
    city,
    itemsKey,
    subtotal,
    currency,
    customerGroupId,
    estimateItems,
  ]);

  useEffect(() => {
    if (!selectedMethodCode || options.length === 0) return;
    const selected = options.find((o) => o.methodCode === selectedMethodCode);
    if (!selected) return;
    const matchedCity = cityOptions.find(
      (c) => c.name.toLowerCase() === city.trim().toLowerCase(),
    );
    setShippingEstimatePreference({
      methodCode: selected.methodCode,
      methodId: selected.methodId,
      methodName: selected.methodName,
      cost: selected.effectivePrice ?? selected.cost,
      currency: selected.currency || currency,
      province: province.trim() || undefined,
      city: city.trim() || undefined,
      cityId:
        matchedCity && isUuid(matchedCity.id) ? matchedCity.id : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- persist on selection/rates change
  }, [selectedMethodCode, options, province, city, currency]);

  if (estimateItems.length === 0) return null;

  return (
    <div
      className={
        compact
          ? 'mt-3 rounded-md border border-border/70 bg-muted/30 p-3'
          : 'mt-4 border-t border-border/60 pt-4'
      }
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span
          className={
            compact
              ? 'text-xs font-semibold uppercase tracking-wide text-foreground'
              : 'text-sm font-semibold text-foreground'
          }
        >
          Calculate Delivery Charges
        </span>
        <span className="text-xs text-muted-foreground" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>

      {open ? (
        <div className={compact ? 'mt-3 space-y-2' : 'mt-3 space-y-3'}>
          <div className={compact ? 'space-y-2' : 'grid gap-3 sm:grid-cols-2'}>
            <div>
              <label
                htmlFor={compact ? 'drawer-ship-province' : 'cart-ship-province'}
                className={storefrontUi.labelMb}
              >
                Province
              </label>
              <select
                id={compact ? 'drawer-ship-province' : 'cart-ship-province'}
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setCity('');
                }}
                className={storefrontUi.select}
              >
                <option value="">Select province</option>
                {(addressOptions.loadingProvinces ? [] : provinceOptions).map(
                  (p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ),
                )}
                {addressOptions.loadingProvinces ? (
                  <option value="" disabled>
                    Loading…
                  </option>
                ) : null}
              </select>
            </div>
            <div>
              <label
                htmlFor={compact ? 'drawer-ship-city' : 'cart-ship-city'}
                className={storefrontUi.labelMb}
              >
                City
              </label>
              <select
                id={compact ? 'drawer-ship-city' : 'cart-ship-city'}
                value={city}
                disabled={!province}
                onChange={(e) => setCity(e.target.value)}
                className={`${storefrontUi.select} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <option value="">
                  {!province
                    ? 'Select province first'
                    : addressOptions.loadingCities
                      ? 'Loading cities…'
                      : 'Select city'}
                </option>
                {cityOptions.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!province || !city ? (
            <p className="text-xs text-muted-foreground">
              Select province and city to see Economy & Overland rates.
            </p>
          ) : null}

          {loading ? (
            <p className="text-xs text-muted-foreground">Calculating rates…</p>
          ) : null}

          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}

          {!loading && !error && options.length > 0 ? (
            <fieldset className="space-y-2">
              <legend className="sr-only">Estimated shipping options</legend>
              {options.map((opt) => {
                const delivery =
                  shippingDeliveryLabel(opt.methodCode) ??
                  (opt.estimatedDays != null
                    ? `${opt.estimatedDays} day${opt.estimatedDays !== 1 ? 's' : ''}`
                    : null);
                const label = shippingMethodDisplayName(
                  opt.methodCode,
                  opt.methodName,
                );
                const emoji = shippingMethodEmoji(opt.methodCode);
                const amount = opt.effectivePrice ?? opt.cost;
                const selected = selectedMethodCode === opt.methodCode;
                return (
                  <label
                    key={opt.methodId}
                    className={`flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm transition-colors ${
                      selected
                        ? `${storefrontUi.optionSelected} ring-1 ring-ring`
                        : storefrontUi.optionIdle
                    }`}
                  >
                    <input
                      type="radio"
                      name={compact ? 'drawer-shipping-estimate' : 'cart-shipping-estimate'}
                      className="mt-0.5 h-4 w-4 text-primary focus:ring-ring/30"
                      checked={selected}
                      onChange={() => setSelectedMethodCode(opt.methodCode)}
                    />
                    <span className="min-w-0 flex-1 leading-snug text-foreground">
                      {emoji ? <span className="mr-1">{emoji}</span> : null}
                      {label}
                      {delivery ? (
                        <span className="text-muted-foreground">
                          {' '}
                          ({delivery})
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-medium text-foreground">
                      {opt.isFreeShipping
                        ? 'FREE'
                        : formatPrice(amount, opt.currency || currency)}
                    </span>
                  </label>
                );
              })}
              <p className="text-[11px] text-muted-foreground">
                Your selection is saved for checkout. Final charges confirm after
                you enter the full delivery address.
              </p>
            </fieldset>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
