'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/lib/checkout-context';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';
import { formatPrice, APP_CURRENCY } from '@/lib/currency';
import { storefrontUi } from '@/lib/storefront-ui';
import { Address, AddressWithId, addressApi, shippingApi, paymentApi, productApi, type CartItem } from '@/lib/api-client';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { CouponApplySection } from '@/components/coupon/coupon-apply-section';
import {
  checkoutItemsToValidateItems,
  clearPendingCouponCode,
  setPendingCouponCode,
} from '@/lib/coupon-sync';
import { formatVariantAttributes } from '@/lib/format-variant-attributes';

const EMPTY_CART_ITEMS: CartItem[] = [];

const emptyAddress: Address = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  label: '',
};

function addressWithIdToAddress(a: AddressWithId): Address {
  return {
    label: a.label,
    firstName: a.firstName,
    lastName: a.lastName,
    company: a.company,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    phone: a.phone,
  };
}

function formatAddressLine(a: AddressWithId): string {
  const parts = [a.addressLine1, a.city, a.state, a.postalCode, a.country].filter(Boolean);
  return parts.join(', ') || `${a.firstName} ${a.lastName}`;
}

function validateAddress(addr: Address): boolean {
  return !!(
    addr.firstName?.trim() &&
    addr.lastName?.trim() &&
    addr.addressLine1?.trim() &&
    addr.city?.trim() &&
    addr.state?.trim() &&
    addr.postalCode?.trim() &&
    addr.country?.trim()
  );
}

export function OnePageCheckout() {
  const router = useRouter();
  const {
    checkout,
    checkoutId,
    updateAddresses,
    updateShippingMethod,
    setPaymentInfo,
    confirmCheckout,
    updateItemQuantity,
    setGuestCustomer,
    applyCoupon,
    isLoading,
    error,
    clearError,
  } = useCheckout();
  const clearCart = useCartStore((s) => s.clearCart);
  const cartItems = useCartStore((s) => s.cart?.items ?? EMPTY_CART_ITEMS);

  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const [updatingVariantId, setUpdatingVariantId] = useState<string | null>(null);
  const [fallbackProductImages, setFallbackProductImages] = useState<Record<string, string>>({});

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address>(
    () => checkout?.billingAddress || { ...emptyAddress }
  );
  const [shippingAddress, setShippingAddress] = useState<Address>(
    () => checkout?.shippingAddress || { ...emptyAddress }
  );
  const [customerEmail, setCustomerEmail] = useState(checkout?.customerEmail || '');
  const [customerName, setCustomerName] = useState(checkout?.customerName || '');
  const [notes, setNotes] = useState('');

  const [paymentMethods, setPaymentMethods] = useState<Array<{
    code: string;
    name: string;
    provider: string;
    flowType: string;
    type: string;
  }>>([]);
  const [selectedPaymentCode, setSelectedPaymentCode] = useState<string | null>(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);

  const [shippingOptions, setShippingOptions] = useState<Array<{
    methodId: string;
    methodCode: string;
    methodName: string;
    cost: number;
    currency: string;
    estimatedDays?: number;
    description?: string;
  }>>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    checkout?.shippingMethod?.methodId || null
  );
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const { isAuthenticated } = useAuthStore();
  const [savedAddresses, setSavedAddresses] = useState<AddressWithId[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null);
  const [useSavedAddressForm, setUseSavedAddressForm] = useState(true);
  const [saveBillingAddress, setSaveBillingAddress] = useState(false);
  const [saveShippingAddress, setSaveShippingAddress] = useState(false);

  const effectiveShippingAddress = useSameAddress ? billingAddress : shippingAddress;

  const hasSavedAddresses = savedAddresses.length > 0;
  const showAddressForm = !isAuthenticated || !hasSavedAddresses || useSavedAddressForm;

  // Load saved addresses when logged in
  useEffect(() => {
    if (!isAuthenticated) {
      setSavedAddresses([]);
      setUseSavedAddressForm(true);
      return;
    }
    let cancelled = false;
    setLoadingAddresses(true);
    addressApi
      .getAddresses()
      .then((list) => {
        if (cancelled) return;
        setSavedAddresses(list);
        if (list.length > 0) {
          setUseSavedAddressForm(false);
          const defaultBilling = list.find((a) => a.isDefaultBilling) ?? list[0];
          const defaultShipping = list.find((a) => a.isDefaultShipping) ?? list[0];
          setSelectedBillingAddressId(defaultBilling.id);
          setSelectedShippingAddressId(defaultShipping.id);
          setBillingAddress(addressWithIdToAddress(defaultBilling));
          setShippingAddress(addressWithIdToAddress(defaultShipping));
        } else {
          setUseSavedAddressForm(true);
        }
      })
      .catch(() => {
        if (!cancelled) setUseSavedAddressForm(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingAddresses(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // When user selects a saved billing/shipping address, update form state
  useEffect(() => {
    if (!hasSavedAddresses || showAddressForm) return;
    if (selectedBillingAddressId) {
      const a = savedAddresses.find((x) => x.id === selectedBillingAddressId);
      if (a) setBillingAddress(addressWithIdToAddress(a));
    }
  }, [selectedBillingAddressId, hasSavedAddresses, showAddressForm, savedAddresses]);

  useEffect(() => {
    if (!hasSavedAddresses || showAddressForm || useSameAddress) return;
    if (selectedShippingAddressId) {
      const a = savedAddresses.find((x) => x.id === selectedShippingAddressId);
      if (a) setShippingAddress(addressWithIdToAddress(a));
    }
  }, [selectedShippingAddressId, hasSavedAddresses, showAddressForm, useSameAddress, savedAddresses]);

  useEffect(() => {
    if (useSameAddress && selectedBillingAddressId && hasSavedAddresses && !showAddressForm) {
      const a = savedAddresses.find((x) => x.id === selectedBillingAddressId);
      if (a) setShippingAddress(addressWithIdToAddress(a));
    }
  }, [useSameAddress, selectedBillingAddressId, hasSavedAddresses, showAddressForm, savedAddresses]);

  // Sync from checkout when it loads/updates (only if we don't have saved-address selection)
  useEffect(() => {
    if (checkout?.customerEmail) setCustomerEmail(checkout.customerEmail);
    if (checkout?.customerName) setCustomerName(checkout.customerName || '');
    if (checkout?.shippingMethod?.methodId) setSelectedShippingId(checkout.shippingMethod.methodId);
    if (showAddressForm && checkout?.billingAddress) setBillingAddress(checkout.billingAddress);
    if (showAddressForm && checkout?.shippingAddress) setShippingAddress(checkout.shippingAddress);
  }, [checkout?.id, showAddressForm]);

  // Keep local quantity in sync with checkout items
  useEffect(() => {
    const items = checkout?.items ?? [];
    const next: Record<string, number> = {};
    items.forEach((i) => {
      next[i.variantId] = i.quantity;
    });
    setLocalQty(next);
  }, [checkout?.items]);

  useEffect(() => {
    const items = checkout?.items ?? [];
    const missingProductIds = Array.from(
      new Set(
        items
          .filter((item) => !item.productImage && !!item.productId && !fallbackProductImages[item.productId])
          .map((item) => item.productId),
      ),
    );
    if (missingProductIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      missingProductIds.map(async (productId) => {
        try {
          const product = await productApi.getProductById(productId);
          const primary = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
          return { productId, image: primary?.url ?? '' };
        } catch {
          return { productId, image: '' };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setFallbackProductImages((prev) => {
        const next = { ...prev };
        for (const r of results) {
          next[r.productId] = r.image;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [checkout?.items, fallbackProductImages]);

  // Load payment methods on mount
  useEffect(() => {
    let cancelled = false;
    paymentApi
      .getPaymentMethods()
      .then((methods) => {
        if (!cancelled) {
          setPaymentMethods(methods);
          const cod = methods.find((m) => m.code === 'cod');
          setSelectedPaymentCode(cod ? 'cod' : methods[0]?.code ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setFormError('Failed to load payment methods');
      })
      .finally(() => {
        if (!cancelled) setLoadingPaymentMethods(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load shipping options when shipping address is complete
  useEffect(() => {
    if (!checkout || !validateAddress(effectiveShippingAddress)) {
      setShippingOptions([]);
      setShippingError(null);
      return;
    }

    let cancelled = false;
    setLoadingShipping(true);
    setShippingError(null);

    shippingApi
      .calculateShipping({
        shippingAddress: {
          country: effectiveShippingAddress.country,
          region: effectiveShippingAddress.state,
          city: effectiveShippingAddress.city,
          postalCode: effectiveShippingAddress.postalCode,
        },
        items: checkout.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: checkout.subtotal,
        currency: checkout.currency,
        customerGroupId: checkout.customerGroupId,
      })
      .then((options) => {
        if (!cancelled) {
          setShippingOptions(options);
          if (!selectedShippingId && options.length > 0) {
            setSelectedShippingId(options[0].methodId);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setShippingError(err?.message || 'Failed to load shipping options');
      })
      .finally(() => {
        if (!cancelled) setLoadingShipping(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    checkout?.id,
    checkout?.items,
    checkout?.subtotal,
    checkout?.currency,
    checkout?.customerGroupId,
    effectiveShippingAddress.firstName,
    effectiveShippingAddress.lastName,
    effectiveShippingAddress.city,
    effectiveShippingAddress.state,
    effectiveShippingAddress.postalCode,
    effectiveShippingAddress.country,
    useSameAddress,
  ]);

  const selectedShipping = useMemo(
    () => shippingOptions.find((o) => o.methodId === selectedShippingId),
    [shippingOptions, selectedShippingId]
  );

  const displayCurrency = checkout?.currency ?? APP_CURRENCY;
  const parsedSubtotal = Number(checkout?.subtotal ?? 0);
  const parsedDiscount = Number(checkout?.discountTotal ?? 0);
  const parsedTax = Number(checkout?.taxTotal ?? 0);
  // Prefer the live shipping selection — checkout.shippingTotal is 0 until saved server-side
  const shippingFee = Number(
    selectedShipping != null ? selectedShipping.cost : checkout?.shippingTotal ?? 0,
  );
  const displaySubtotal = parsedSubtotal;
  const displayDiscountTotal = parsedDiscount;
  const displayShippingTotal = Number.isFinite(shippingFee) ? shippingFee : 0;
  const displayGrandTotal = Math.max(
    0,
    parsedSubtotal - parsedDiscount + displayShippingTotal + parsedTax,
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!validateAddress(billingAddress)) {
      setFormError('Please fill in all required billing address fields.');
      return;
    }
    if (!validateAddress(effectiveShippingAddress)) {
      setFormError('Please fill in all required shipping address fields.');
      return;
    }
    if (!selectedShippingId || !selectedShipping) {
      setFormError('Please select a shipping method.');
      return;
    }
    if (!selectedPaymentCode) {
      setFormError('Please select a payment method.');
      return;
    }
    if (!customerEmail?.trim() || !customerEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    try {
      // For guest checkout: set customer on session so confirm receives customerId/customerGroupId
      if (checkoutId && !checkout?.customerId && customerEmail?.trim()) {
        await setGuestCustomer(customerEmail.trim());
      }

      await updateAddresses({
        billingAddress,
        shippingAddress: effectiveShippingAddress,
      });

      if (isAuthenticated) {
        const setAsDefault = savedAddresses.length === 0;
        if (saveBillingAddress) {
          await addressApi.createAddress({
            ...billingAddress,
            isDefaultBilling: setAsDefault,
            isDefaultShipping: useSameAddress && setAsDefault,
          });
        }
        if (saveShippingAddress && !useSameAddress) {
          await addressApi.createAddress({
            ...effectiveShippingAddress,
            isDefaultShipping: setAsDefault,
          });
        }
      }

      await updateShippingMethod({
        methodId: selectedShipping.methodId,
        methodName: selectedShipping.methodName,
        cost: Number(selectedShipping.cost),
        currency: selectedShipping.currency,
        estimatedDays: selectedShipping.estimatedDays ?? 0,
      });

      const paymentPayload = {
        paymentMethodCode: selectedPaymentCode,
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
        ...(checkout?.customerId && { customerId: checkout.customerId }),
        ...(checkout?.customerGroupId && { customerGroupId: checkout.customerGroupId }),
      };
      setPaymentInfo(paymentPayload);

      const result = await confirmCheckout(paymentPayload);

      if (result.paymentIntent?.redirectUrl) {
        window.location.href = result.paymentIntent.redirectUrl;
        return;
      }
      await clearCart();
      const sp = new URLSearchParams({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        email: customerEmail.trim(),
      });
      router.push(`/checkout/success?${sp.toString()}`);
    } catch {
      // Error shown by context
    }
  };

  if (!checkout) return null;

  const inputClass = storefrontUi.input;
  const labelClass = storefrontUi.labelMb;

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-8">
      {error && (
        <div className={storefrontUi.alertError}>
          {error}
        </div>
      )}
      {formError && (
        <div className={storefrontUi.alertError}>
          {formError}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Address: saved-address selector (logged-in with addresses) or form (guest / no addresses / Add new) */}
          {loadingAddresses ? (
            <section>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                Loading your addresses…
              </div>
            </section>
          ) : showAddressForm ? (
            <>
              {isAuthenticated && hasSavedAddresses && (
                <p className="text-sm text-muted-foreground">
                  Adding a new address. You can also{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setUseSavedAddressForm(false);
                      const defaultBilling = savedAddresses.find((a) => a.isDefaultBilling) ?? savedAddresses[0];
                      const defaultShipping = savedAddresses.find((a) => a.isDefaultShipping) ?? savedAddresses[0];
                      setSelectedBillingAddressId(defaultBilling.id);
                      setSelectedShippingAddressId(defaultShipping.id);
                      setBillingAddress(addressWithIdToAddress(defaultBilling));
                      setShippingAddress(addressWithIdToAddress(defaultShipping));
                    }}
                    className={`${storefrontUi.link} underline-offset-2 hover:underline`}
                  >
                    use a saved address
                  </button>
                </p>
              )}
              {/* Billing Address form */}
              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Billing address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billing-firstName" className={labelClass}>First name *</label>
                    <input
                      id="billing-firstName"
                      type="text"
                      required
                      value={billingAddress.firstName}
                      onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-lastName" className={labelClass}>Last name *</label>
                    <input
                      id="billing-lastName"
                      type="text"
                      required
                      value={billingAddress.lastName}
                      onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="billing-addressLine1" className={labelClass}>Address line 1 *</label>
                    <input
                      id="billing-addressLine1"
                      type="text"
                      required
                      value={billingAddress.addressLine1}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, addressLine1: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="billing-addressLine2" className={labelClass}>Address line 2 (optional)</label>
                    <input
                      id="billing-addressLine2"
                      type="text"
                      value={billingAddress.addressLine2 || ''}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, addressLine2: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-city" className={labelClass}>City *</label>
                    <input
                      id="billing-city"
                      type="text"
                      required
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-state" className={labelClass}>State / Province *</label>
                    <input
                      id="billing-state"
                      type="text"
                      required
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-postalCode" className={labelClass}>Postal code *</label>
                    <input
                      id="billing-postalCode"
                      type="text"
                      required
                      value={billingAddress.postalCode}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, postalCode: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-country" className={labelClass}>Country *</label>
                    <input
                      id="billing-country"
                      type="text"
                      required
                      value={billingAddress.country}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, country: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="billing-phone" className={labelClass}>Phone (optional)</label>
                    <input
                      id="billing-phone"
                      type="tel"
                      value={billingAddress.phone || ''}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, phone: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center">
                <input
                  id="use-same-address"
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  className={storefrontUi.checkbox}
                />
                <label htmlFor="use-same-address" className="ml-2 text-sm text-foreground/90">
                  Use same address for shipping
                </label>
              </div>

              {isAuthenticated && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center">
                    <input
                      id="save-billing-address"
                      type="checkbox"
                      checked={saveBillingAddress}
                      onChange={(e) => setSaveBillingAddress(e.target.checked)}
                      className={storefrontUi.checkbox}
                    />
                    <label htmlFor="save-billing-address" className="ml-2 text-sm text-foreground/90">
                      Save billing address to my address book
                    </label>
                  </div>
                  {!useSameAddress && (
                    <div className="flex items-center">
                      <input
                        id="save-shipping-address"
                        type="checkbox"
                        checked={saveShippingAddress}
                        onChange={(e) => setSaveShippingAddress(e.target.checked)}
                        className={storefrontUi.checkbox}
                      />
                      <label htmlFor="save-shipping-address" className="ml-2 text-sm text-foreground/90">
                        Save shipping address to my address book
                      </label>
                    </div>
                  )}
                </div>
              )}

              {!useSameAddress && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Shipping address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shipping-firstName" className={labelClass}>First name *</label>
                      <input
                        id="shipping-firstName"
                        type="text"
                        required
                        value={shippingAddress.firstName}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-lastName" className={labelClass}>Last name *</label>
                      <input
                        id="shipping-lastName"
                        type="text"
                        required
                        value={shippingAddress.lastName}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="shipping-addressLine1" className={labelClass}>Address line 1 *</label>
                      <input
                        id="shipping-addressLine1"
                        type="text"
                        required
                        value={shippingAddress.addressLine1}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-city" className={labelClass}>City *</label>
                      <input
                        id="shipping-city"
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-state" className={labelClass}>State / Province *</label>
                      <input
                        id="shipping-state"
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, state: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-postalCode" className={labelClass}>Postal code *</label>
                      <input
                        id="shipping-postalCode"
                        type="text"
                        required
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-country" className={labelClass}>Country *</label>
                      <input
                        id="shipping-country"
                        type="text"
                        required
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, country: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              {/* Saved addresses: dropdowns */}
              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Billing address
                </h2>
                <label htmlFor="saved-billing" className="sr-only">Choose billing address</label>
                <select
                  id="saved-billing"
                  value={selectedBillingAddressId ?? ''}
                  onChange={(e) => {
                    const id = e.target.value || null;
                    setSelectedBillingAddressId(id);
                    if (id) {
                      const a = savedAddresses.find((x) => x.id === id);
                      if (a) setBillingAddress(addressWithIdToAddress(a));
                    }
                  }}
                  className={storefrontUi.select}
                >
                  {savedAddresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatAddressLine(a)}
                      {a.isDefaultBilling ? ' (default billing)' : ''}
                    </option>
                  ))}
                </select>
              </section>

              <div className="flex items-center">
                <input
                  id="use-same-address-saved"
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => {
                    setUseSameAddress(e.target.checked);
                    if (e.target.checked && selectedBillingAddressId) {
                      const a = savedAddresses.find((x) => x.id === selectedBillingAddressId);
                      if (a) setShippingAddress(addressWithIdToAddress(a));
                    }
                  }}
                  className={storefrontUi.checkbox}
                />
                <label htmlFor="use-same-address-saved" className="ml-2 text-sm text-foreground/90">
                  Use same address for shipping
                </label>
              </div>

              {!useSameAddress && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Shipping address
                  </h2>
                  <label htmlFor="saved-shipping" className="sr-only">Choose shipping address</label>
                  <select
                    id="saved-shipping"
                    value={selectedShippingAddressId ?? ''}
                    onChange={(e) => {
                      const id = e.target.value || null;
                      setSelectedShippingAddressId(id);
                      if (id) {
                        const a = savedAddresses.find((x) => x.id === id);
                        if (a) setShippingAddress(addressWithIdToAddress(a));
                      }
                    }}
                    className={storefrontUi.select}
                  >
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {formatAddressLine(a)}
                        {a.isDefaultShipping ? ' (default shipping)' : ''}
                      </option>
                    ))}
                  </select>
                </section>
              )}

              <p className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setUseSavedAddressForm(true);
                    setBillingAddress(emptyAddress);
                    setShippingAddress(emptyAddress);
                  }}
                  className={`${storefrontUi.link} underline-offset-2 hover:underline`}
                >
                  Add new address
                </button>
              </p>
            </>
          )}

          {/* Shipping Method */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Shipping method
            </h2>
            {!validateAddress(effectiveShippingAddress) ? (
              <p className="text-sm text-muted-foreground">
                Complete the shipping address above to see options.
              </p>
            ) : loadingShipping ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                Loading shipping options…
              </div>
            ) : shippingError ? (
              <p className="text-sm text-destructive">{shippingError}</p>
            ) : shippingOptions.length === 0 ? (
              <p className="text-sm text-warning">
                No shipping options available for this address.
              </p>
            ) : (
              <div className="space-y-2">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.methodId}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                      selectedShippingId === opt.methodId
                        ? storefrontUi.optionSelected
                        : storefrontUi.optionIdle
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.methodId}
                      checked={selectedShippingId === opt.methodId}
                      onChange={() => setSelectedShippingId(opt.methodId)}
                      className="h-4 w-4 text-brand-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-foreground">
                        {opt.methodName}
                      </span>
                      {opt.estimatedDays != null && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({opt.estimatedDays} day{opt.estimatedDays !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {formatPrice(Number(opt.cost), opt.currency || displayCurrency)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment & Contact */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Payment & contact
            </h2>
            {loadingPaymentMethods ? (
              <p className="text-sm text-muted-foreground">Loading payment methods…</p>
            ) : (
              <div className="space-y-2 mb-6">
                {paymentMethods.map((m) => (
                  <label
                    key={m.code}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                      selectedPaymentCode === m.code
                        ? storefrontUi.optionSelected
                        : storefrontUi.optionIdle
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.code}
                      checked={selectedPaymentCode === m.code}
                      onChange={() => setSelectedPaymentCode(m.code)}
                      className="h-4 w-4 text-brand-primary"
                    />
                    <span className="font-medium text-foreground">{m.name}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="customer-email" className={labelClass}>Email *</label>
                <input
                  id="customer-email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="customer-name" className={labelClass}>Full name (optional)</label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>Order notes (optional)</label>
                <textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClass}
                  placeholder="Delivery instructions, etc."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-8 rounded-lg border border-border bg-muted/40 p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Order summary
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Update quantity or remove items before placing your order.
            </p>
            <ul className="mb-4 divide-y divide-border">
              {checkout.items.map((item, idx) => {
                const qty = localQty[item.variantId] ?? item.quantity;
                const rowTotal = item.price * (localQty[item.variantId] ?? item.quantity);
                const isUpdating = updatingVariantId === item.variantId;
                const handleQtyChange = async (newQty: number) => {
                  const n = Math.max(1, Math.floor(newQty));
                  if (n === item.quantity) return;
                  setUpdatingVariantId(item.variantId);
                  try {
                    await updateItemQuantity(item.variantId, n);
                    setLocalQty((prev) => ({ ...prev, [item.variantId]: n }));
                  } finally {
                    setUpdatingVariantId(null);
                  }
                };
                const handleQtyBlur = async () => {
                  const newQty = Math.max(1, Math.floor(Number(qty)) || 1);
                  if (newQty === item.quantity) return;
                  await handleQtyChange(newQty);
                };
                const handleRemove = async () => {
                  setUpdatingVariantId(item.variantId);
                  try {
                    await updateItemQuantity(item.variantId, 0);
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : String(err);
                    if (msg.includes('no items') || msg.includes('empty')) {
                      router.push('/cart');
                    }
                  } finally {
                    setUpdatingVariantId(null);
                  }
                };
                return (
                  <li key={item.variantId + idx} className="py-4 first:pt-0">
                    <div className="flex gap-3">
                      {/* Item image */}
                      {(() => {
                        const fallbackCartImage = cartItems.find((c) => c.variantId === item.variantId)?.productImage;
                        const fallbackProductImage = fallbackProductImages[item.productId];
                        const imageUrl =
                          resolveImageUrl(item.productImage) ??
                          resolveImageUrl(fallbackCartImage) ??
                          resolveImageUrl(fallbackProductImage);
                        return (
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.productName || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                        );
                      })()}
                      {/* Name, variant attributes, price and quantity */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {item.productName ?? 'Product'}
                            </p>
                            {(() => {
                              const attrLines = formatVariantAttributes(
                                item.variantAttributes ?? item.attributes,
                              );
                              if (attrLines.length > 0) {
                                return (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {attrLines.join(' · ')}
                                  </p>
                                );
                              }
                              if (item.variantName) {
                                return (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {item.variantName}
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <p className="shrink-0 text-sm font-medium text-foreground">
                            {formatPrice(rowTotal, displayCurrency)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center rounded-md border border-border bg-card">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => handleQtyChange(Number(qty) - 1)}
                              disabled={isUpdating || qty <= 1}
                              className="flex h-8 w-8 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              −
                            </button>
                            <label htmlFor={`qty-${item.variantId}`} className="sr-only">
                              Quantity for {item.productName || 'item'}
                            </label>
                            <input
                              id={`qty-${item.variantId}`}
                              type="number"
                              min={1}
                              value={qty}
                              onChange={(e) => {
                                const v = e.target.value;
                                const n = parseInt(v, 10);
                                setLocalQty((prev) => ({
                                  ...prev,
                                  [item.variantId]: Number.isNaN(n) ? 1 : Math.max(1, n),
                                }));
                              }}
                              onBlur={handleQtyBlur}
                              disabled={isUpdating}
                              className="h-8 w-12 border-0 border-x border-border bg-transparent text-center text-sm font-medium text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => handleQtyChange(Number(qty) + 1)}
                              disabled={isUpdating}
                              className="flex h-8 w-8 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isUpdating || checkout.items.length <= 1}
                            className="text-xs text-destructive transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating ? '…' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mb-4">
              <CouponApplySection
                appliedCouponCode={checkout.couponCode ?? null}
                subtotal={checkout.subtotal}
                items={checkoutItemsToValidateItems(checkout.items)}
                customerId={checkout.customerId}
                customerGroupId={checkout.customerGroupId}
                disabled={!checkoutId || !checkout.items.length}
                onValidatedApply={async (code) => {
                  await applyCoupon(code);
                  setPendingCouponCode(code);
                }}
                onRemove={async () => {
                  await applyCoupon('');
                  clearPendingCouponCode();
                }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(displaySubtotal, displayCurrency)}</span>
              </div>
              {displayDiscountTotal > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount applied</span>
                  <span>−{formatPrice(displayDiscountTotal, displayCurrency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {selectedShipping
                    ? formatPrice(displayShippingTotal, displayCurrency)
                    : '—'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-semibold text-foreground">
              <span>Total</span>
              <span>{formatPrice(displayGrandTotal, displayCurrency)}</span>
            </div>
            <button
              type="submit"
              disabled={
                isLoading ||
                loadingShipping ||
                !selectedShippingId ||
                !selectedPaymentCode ||
                !validateAddress(billingAddress) ||
                !validateAddress(effectiveShippingAddress) ||
                !customerEmail?.includes('@')
              }
              className={storefrontUi.btnPrimaryCheckout}
            >
              {isLoading ? 'Processing…' : 'Place order'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
