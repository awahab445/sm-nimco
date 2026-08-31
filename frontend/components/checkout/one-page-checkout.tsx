'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/lib/checkout-context';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';
import { formatPrice, APP_CURRENCY, resolveDisplayCurrency } from '@/lib/currency';
import { storefrontUi } from '@/lib/storefront-ui';
import { Address, AddressWithId, addressApi, shippingApi, paymentApi, productApi, storeSettingsApi, type CartItem } from '@/lib/api-client';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { CouponApplySection } from '@/components/coupon/coupon-apply-section';
import {
  checkoutItemsToValidateItems,
  clearPendingCouponCode,
  setPendingCouponCode,
} from '@/lib/coupon-sync';
import { formatVariantAttributes } from '@/lib/format-variant-attributes';
import { trackAddPaymentInfo, trackAddShippingInfo } from '@/lib/analytics/events';
import { checkoutItemToGa4Item } from '@/lib/analytics/mappers';
import { PAKISTAN_PROVINCES } from '@/lib/constants/locations';
import { pickDefaultShippingMethodId } from '@/lib/hooks/use-pakistan-address-options';
import { getShippingEstimatePreference } from '@/lib/shipping-estimate-preference';

type CityOption = { id: string; name: string };

function CheckoutLineThumb({
  imageUrl,
  alt,
}: {
  imageUrl?: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
      {showImage ? (
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          No image
        </div>
      )}
    </div>
  );
}

const EMPTY_CART_ITEMS: CartItem[] = [];
const DEFAULT_MIN_ORDER_VALUE = 800;
const DEFAULT_FREE_DELIVERY_THRESHOLD = 2000;

const emptyAddress: Address = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'PK',
  phone: '',
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
  const country = addr.country?.trim() || 'PK';
  return !!(
    addr.firstName?.trim() &&
    addr.lastName?.trim() &&
    addr.addressLine1?.trim() &&
    addr.city?.trim() &&
    addr.state?.trim() &&
    country &&
    addr.phone?.trim()
  );
}

type CheckoutValidationIssue = {
  fieldId: string;
  message: string;
};

function getAddressFieldIssues(
  prefix: 'billing' | 'shipping',
  addr: Address,
): CheckoutValidationIssue[] {
  const issues: CheckoutValidationIssue[] = [];
  const push = (field: string, message: string, missing: boolean) => {
    if (missing) issues.push({ fieldId: `${prefix}-${field}`, message });
  };

  push('firstName', 'First name is required.', !addr.firstName?.trim());
  push('lastName', 'Last name is required.', !addr.lastName?.trim());
  push('addressLine1', 'Address line 1 is required.', !addr.addressLine1?.trim());
  push('state', 'Please select a province.', !addr.state?.trim());
  push('city', 'Please select a city.', !addr.city?.trim());
  push('phone', 'Phone number is required.', !addr.phone?.trim());
  return issues;
}

function focusCheckoutField(fieldId: string) {
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      const el = document.getElementById(fieldId);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
      ) {
        el.focus({ preventScroll: true });
      }
    }, 150);
  });
}

function focusCheckoutSection(sectionId: string, inputName?: string) {
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (inputName) {
        const input = section?.querySelector<HTMLInputElement>(
          `input[name="${inputName}"]`,
        );
        input?.focus({ preventScroll: true });
      }
    }, 150);
  });
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

  const [apiProvinces, setApiProvinces] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<CityOption[]>([]);

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
    originalCost?: number;
    effectivePrice?: number;
    isFreeShipping?: boolean;
  }>>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    checkout?.shippingMethod?.methodId || null
  );
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationIssue, setValidationIssue] =
    useState<CheckoutValidationIssue | null>(null);
  const [showMinimumOrderModal, setShowMinimumOrderModal] = useState(false);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(DEFAULT_MIN_ORDER_VALUE);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    DEFAULT_FREE_DELIVERY_THRESHOLD,
  );

  const { isAuthenticated, user } = useAuthStore();
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

  // Prefill province/city from cart shipping estimator when address is empty
  useEffect(() => {
    const preferred = getShippingEstimatePreference();
    if (!preferred?.province || !preferred?.city) return;
    setBillingAddress((prev) => {
      if (prev.state?.trim() || prev.city?.trim()) return prev;
      return { ...prev, state: preferred.province!, city: preferred.city! };
    });
    setShippingAddress((prev) => {
      if (prev.state?.trim() || prev.city?.trim()) return prev;
      return { ...prev, state: preferred.province!, city: preferred.city! };
    });
  }, []);

  useEffect(() => {
    shippingApi.getProvinces().then(setApiProvinces).catch(() => {});
    shippingApi
      .getCities()
      .then((cities) => setAllCities(cities.map((city) => ({ id: city.id, name: city.name }))))
      .catch(() => setAllCities([]));
  }, []);

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
        // Legacy addresses may not have a phone — exclude them from checkout.
        const contactableAddresses = list.filter((address) =>
          validateAddress(address),
        );
        setSavedAddresses(contactableAddresses);
        if (contactableAddresses.length > 0) {
          setUseSavedAddressForm(false);
          const defaultBilling =
            contactableAddresses.find((a) => a.isDefaultBilling) ??
            contactableAddresses[0];
          const defaultShipping =
            contactableAddresses.find((a) => a.isDefaultShipping) ??
            contactableAddresses[0];
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

  useEffect(() => {
    let cancelled = false;
    storeSettingsApi
      .getStoreSettings()
      .then((res) => {
        if (cancelled) return;
        const minOrder = Number(res.data.minimumOrderAmount);
        const freeDelivery = Number(res.data.freeDeliveryThreshold);
        if (Number.isFinite(minOrder) && minOrder >= 0) {
          setMinimumOrderAmount(minOrder);
        }
        if (Number.isFinite(freeDelivery) && freeDelivery >= 0) {
          setFreeDeliveryThreshold(freeDelivery);
        }
      })
      .catch(() => {
        // Keep defaults when settings cannot be loaded.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    // Logged-in users always use their account email (field is locked below)
    if (isAuthenticated && user?.email) {
      setCustomerEmail(user.email);
    } else if (checkout?.customerEmail) {
      setCustomerEmail(checkout.customerEmail);
    }
    if (checkout?.shippingMethod?.methodId) setSelectedShippingId(checkout.shippingMethod.methodId);
    if (showAddressForm && checkout?.billingAddress) {
      setBillingAddress({ ...checkout.billingAddress, country: 'PK' });
    }
    if (showAddressForm && checkout?.shippingAddress) {
      setShippingAddress({ ...checkout.shippingAddress, country: 'PK' });
    }
  }, [checkout?.id, checkout?.customerEmail, checkout?.shippingMethod?.methodId, checkout?.billingAddress, checkout?.shippingAddress, showAddressForm, isAuthenticated, user?.email]);

  const isEmailValid = (email: string) => !!email.trim() && email.includes('@');

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

    const matchedCity = allCities.find(
      (c) => c.name.toLowerCase() === effectiveShippingAddress.city.trim().toLowerCase(),
    );

    shippingApi
      .calculateShipping({
        shippingAddress: {
          country: effectiveShippingAddress.country || 'PK',
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
        cityId: matchedCity?.id,
      })
      .then((options) => {
        if (!cancelled) {
          setShippingOptions(options);
          const stillValid = options.some((o) => o.methodId === selectedShippingId);
          if (!stillValid && options.length > 0) {
            const preferredCode = getShippingEstimatePreference()?.methodCode;
            const preferred = preferredCode
              ? options.find((o) => o.methodCode === preferredCode)
              : undefined;
            const karachiOpt = options.find(
              (o) =>
                o.methodCode === 'standard_karachi' ||
                o.methodCode === 'karachi_standard',
            );
            setSelectedShippingId(
              preferred?.methodId ??
                karachiOpt?.methodId ??
                pickDefaultShippingMethodId(options) ??
                options[0].methodId,
            );
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
    checkout,
    checkout?.id,
    checkout?.items,
    checkout?.subtotal,
    checkout?.currency,
    checkout?.customerGroupId,
    effectiveShippingAddress,
    selectedShippingId,
    allCities,
  ]);

  const selectedShipping = useMemo(
    () => shippingOptions.find((o) => o.methodId === selectedShippingId),
    [shippingOptions, selectedShippingId]
  );

  const displayCurrency = resolveDisplayCurrency(checkout?.currency ?? APP_CURRENCY);
  const parsedSubtotal = Number(checkout?.subtotal ?? 0);
  const parsedDiscount = Number(checkout?.discountTotal ?? 0);
  const parsedTax = Number(checkout?.taxTotal ?? 0);
  const shippingFee = Number(
    selectedShipping != null
      ? (selectedShipping.originalCost ?? selectedShipping.cost)
      : checkout?.shippingTotal ?? 0,
  );
  const displaySubtotal = parsedSubtotal;
  const displayDiscountTotal = parsedDiscount;
  const qualifiesForFreeDelivery =
    (freeDeliveryThreshold > 0 &&
      displaySubtotal >= freeDeliveryThreshold) ||
    Boolean(selectedShipping?.isFreeShipping);
  const displayShippingTotal = qualifiesForFreeDelivery
    ? 0
    : Number.isFinite(shippingFee)
      ? shippingFee
      : 0;
  const displayGrandTotal = Math.max(
    0,
    parsedSubtotal - parsedDiscount + displayShippingTotal + parsedTax,
  );
  const amountRemainingForFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - displaySubtotal,
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setFormError(null);
    setValidationIssue(null);
    clearError();

    const issue = (() => {
      if (!isEmailValid(customerEmail)) {
        return {
          fieldId: 'customer-email',
          message: 'Please enter a valid email address.',
        } satisfies CheckoutValidationIssue;
      }
      if (!showAddressForm) {
        if (!validateAddress(billingAddress)) {
          return {
            fieldId: 'saved-billing',
            message: 'Please choose a complete billing address with phone.',
          } satisfies CheckoutValidationIssue;
        }
        if (!validateAddress(effectiveShippingAddress)) {
          return {
            fieldId: useSameAddress ? 'saved-billing' : 'saved-shipping',
            message: useSameAddress
              ? 'Please choose a complete billing address with phone.'
              : 'Please choose a complete shipping address with phone.',
          } satisfies CheckoutValidationIssue;
        }
      } else {
        const billingIssues = getAddressFieldIssues('billing', billingAddress);
        if (billingIssues.length > 0) return billingIssues[0];
        if (!useSameAddress) {
          const shippingIssues = getAddressFieldIssues('shipping', shippingAddress);
          if (shippingIssues.length > 0) return shippingIssues[0];
        }
      }
      if (!selectedShippingId || !selectedShipping) {
        return {
          fieldId: 'checkout-shipping-method',
          message: 'Please select a shipping method.',
        } satisfies CheckoutValidationIssue;
      }
      if (!selectedPaymentCode) {
        return {
          fieldId: 'checkout-payment',
          message: 'Please select a payment method.',
        } satisfies CheckoutValidationIssue;
      }
      return null;
    })();

    if (issue) {
      setValidationIssue(issue);
      setFormError(issue.message);
      if (issue.fieldId.startsWith('checkout-')) {
        focusCheckoutSection(
          issue.fieldId,
          issue.fieldId === 'checkout-shipping-method' ? 'shipping' : 'payment',
        );
      } else {
        focusCheckoutField(issue.fieldId);
      }
      return;
    }

    if (displaySubtotal < minimumOrderAmount) {
      setShowMinimumOrderModal(true);
      return;
    }

    const billingWithCountry = { ...billingAddress, country: 'PK' };
    const shippingWithCountry = { ...effectiveShippingAddress, country: 'PK' };

    try {
      if (checkoutId && !checkout?.customerId && customerEmail.trim()) {
        await setGuestCustomer(customerEmail.trim().toLowerCase());
      }

      await updateAddresses({
        billingAddress: billingWithCountry,
        shippingAddress: shippingWithCountry,
      });

      if (isAuthenticated) {
        const setAsDefault = savedAddresses.length === 0;
        if (saveBillingAddress) {
          await addressApi.createAddress({
            ...billingWithCountry,
            isDefaultBilling: setAsDefault,
            isDefaultShipping: useSameAddress && setAsDefault,
          });
        }
        if (saveShippingAddress && !useSameAddress) {
          await addressApi.createAddress({
            ...shippingWithCountry,
            isDefaultShipping: setAsDefault,
          });
        }
      }

      await updateShippingMethod({
        methodCode: selectedShipping.methodCode,
        methodId: selectedShipping.methodId,
        methodName: selectedShipping.methodName,
        cost: Number(
          qualifiesForFreeDelivery || selectedShipping.isFreeShipping
            ? (selectedShipping.effectivePrice ?? 0)
            : (selectedShipping.effectivePrice ?? selectedShipping.cost),
        ),
        currency: selectedShipping.currency,
        estimatedDays: selectedShipping.estimatedDays ?? 0,
      });

      if (checkout?.items?.length) {
        const gaItems = checkout.items.map(checkoutItemToGa4Item);
        trackAddShippingInfo(selectedShipping.methodName, gaItems);
      }

      const paymentPayload = {
        paymentMethodCode: selectedPaymentCode,
        customerEmail: customerEmail.trim().toLowerCase(),
        ...(checkout?.customerId && { customerId: checkout.customerId }),
        ...(checkout?.customerGroupId && { customerGroupId: checkout.customerGroupId }),
      };
      setPaymentInfo(paymentPayload);

      if (checkout?.items?.length) {
        const gaItems = checkout.items.map(checkoutItemToGa4Item);
        trackAddPaymentInfo(selectedPaymentCode, gaItems);
      }

      const result = await confirmCheckout(paymentPayload);

      if (result.paymentIntent?.redirectUrl) {
        window.location.href = result.paymentIntent.redirectUrl;
        return;
      }
      await clearCart();
      const sp = new URLSearchParams({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        email: customerEmail.trim().toLowerCase(),
      });
      router.push(`/checkout/success?${sp.toString()}`);
    } catch {
      // Error shown by context
    }
  };

  if (!checkout) return null;

  const inputClass = storefrontUi.input;
  const labelClass = storefrontUi.labelMb;
  const isEmailLocked = isAuthenticated && !!user?.email;

  const clearValidationIf = (fieldId: string) => {
    setValidationIssue((current) =>
      current?.fieldId === fieldId ? null : current,
    );
  };

  const inputClassFor = (fieldId: string) =>
    validationIssue?.fieldId === fieldId
      ? `${inputClass} border-destructive ring-1 ring-destructive/40`
      : inputClass;

  const selectClassFor = (fieldId: string) =>
    validationIssue?.fieldId === fieldId
      ? `${storefrontUi.select} border-destructive ring-1 ring-destructive/40`
      : storefrontUi.select;

  const renderFieldError = (fieldId: string) =>
    validationIssue?.fieldId === fieldId ? (
      <p className="mt-1 text-xs text-destructive" role="alert">
        {validationIssue.message}
      </p>
    ) : null;

  const emailField = (
    <div className="sm:col-span-2">
      <label htmlFor="customer-email" className={labelClass}>Email *</label>
      <input
        id="customer-email"
        type="email"
        required
        autoComplete="email"
        value={customerEmail}
        onChange={(e) => {
          clearValidationIf('customer-email');
          setCustomerEmail(e.target.value);
        }}
        readOnly={isEmailLocked}
        aria-invalid={validationIssue?.fieldId === 'customer-email'}
        className={
          isEmailLocked
            ? `${inputClass} bg-muted cursor-not-allowed`
            : inputClassFor('customer-email')
        }
        placeholder="you@example.com"
        aria-readonly={isEmailLocked || undefined}
      />
      {renderFieldError('customer-email')}
      {isEmailLocked && (
        <p className="mt-1 text-xs text-muted-foreground">
          Using the email on your account.
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handlePlaceOrder}
      className="space-y-8 pb-[calc(5.5rem+3.4375rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
    >
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
                <h2 className="font-display mb-4 text-xl font-semibold tracking-tight text-foreground">
                  Billing address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {emailField}
                  <div>
                    <label htmlFor="billing-firstName" className={labelClass}>First name *</label>
                    <input
                      id="billing-firstName"
                      type="text"
                      required
                      value={billingAddress.firstName}
                      onChange={(e) => {
                        clearValidationIf('billing-firstName');
                        setBillingAddress({ ...billingAddress, firstName: e.target.value });
                      }}
                      aria-invalid={validationIssue?.fieldId === 'billing-firstName'}
                      className={inputClassFor('billing-firstName')}
                    />
                    {renderFieldError('billing-firstName')}
                  </div>
                  <div>
                    <label htmlFor="billing-lastName" className={labelClass}>Last name *</label>
                    <input
                      id="billing-lastName"
                      type="text"
                      required
                      value={billingAddress.lastName}
                      onChange={(e) => {
                        clearValidationIf('billing-lastName');
                        setBillingAddress({ ...billingAddress, lastName: e.target.value });
                      }}
                      aria-invalid={validationIssue?.fieldId === 'billing-lastName'}
                      className={inputClassFor('billing-lastName')}
                    />
                    {renderFieldError('billing-lastName')}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="billing-addressLine1" className={labelClass}>Address line 1 *</label>
                    <input
                      id="billing-addressLine1"
                      type="text"
                      required
                      value={billingAddress.addressLine1}
                      onChange={(e) => {
                        clearValidationIf('billing-addressLine1');
                        setBillingAddress({ ...billingAddress, addressLine1: e.target.value });
                      }}
                      aria-invalid={validationIssue?.fieldId === 'billing-addressLine1'}
                      className={inputClassFor('billing-addressLine1')}
                    />
                    {renderFieldError('billing-addressLine1')}
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
                    <label htmlFor="billing-state" className={labelClass}>State / Province *</label>
                    <select
                      id="billing-state"
                      required
                      value={billingAddress.state}
                      onChange={(e) => {
                        clearValidationIf('billing-state');
                        setBillingAddress({ ...billingAddress, state: e.target.value, city: '' });
                      }}
                      aria-invalid={validationIssue?.fieldId === 'billing-state'}
                      className={selectClassFor('billing-state')}
                    >
                      <option value="">Select province</option>
                      {(apiProvinces.length > 0 ? apiProvinces : PAKISTAN_PROVINCES).map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {renderFieldError('billing-state')}
                  </div>
                  <div>
                    <label htmlFor="billing-city" className={labelClass}>City *</label>
                    <select
                      id="billing-city"
                      required
                      value={billingAddress.city}
                      onChange={(e) => {
                        clearValidationIf('billing-city');
                        setBillingAddress({ ...billingAddress, city: e.target.value });
                      }}
                      aria-invalid={validationIssue?.fieldId === 'billing-city'}
                      className={selectClassFor('billing-city')}
                    >
                      <option value="">Select city</option>
                      {allCities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {renderFieldError('billing-city')}
                  </div>
                  <div>
                    <label htmlFor="billing-postalCode" className={labelClass}>Postal code (optional)</label>
                    <input
                      id="billing-postalCode"
                      type="text"
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
                      readOnly
                      value="PK"
                      className={`${inputClass} bg-muted cursor-not-allowed`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="billing-phone" className={labelClass}>Mobile Number *</label>
                    <input
                      id="billing-phone"
                      type="tel"
                      required
                      minLength={10}
                      value={billingAddress.phone || ''}
                      onChange={(e) => {
                        clearValidationIf('billing-phone');
                        setBillingAddress({ ...billingAddress, phone: e.target.value });
                      }}
                      aria-invalid={validationIssue?.fieldId === 'billing-phone'}
                      className={inputClassFor('billing-phone')}
                      placeholder="03001234567"
                    />
                    {renderFieldError('billing-phone')}
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
                  <h2 className="font-display mb-4 text-xl font-semibold tracking-tight text-foreground">
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
                        onChange={(e) => {
                          clearValidationIf('shipping-firstName');
                          setShippingAddress({ ...shippingAddress, firstName: e.target.value });
                        }}
                        aria-invalid={validationIssue?.fieldId === 'shipping-firstName'}
                        className={inputClassFor('shipping-firstName')}
                      />
                      {renderFieldError('shipping-firstName')}
                    </div>
                    <div>
                      <label htmlFor="shipping-lastName" className={labelClass}>Last name *</label>
                      <input
                        id="shipping-lastName"
                        type="text"
                        required
                        value={shippingAddress.lastName}
                        onChange={(e) => {
                          clearValidationIf('shipping-lastName');
                          setShippingAddress({ ...shippingAddress, lastName: e.target.value });
                        }}
                        aria-invalid={validationIssue?.fieldId === 'shipping-lastName'}
                        className={inputClassFor('shipping-lastName')}
                      />
                      {renderFieldError('shipping-lastName')}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="shipping-addressLine1" className={labelClass}>Address line 1 *</label>
                      <input
                        id="shipping-addressLine1"
                        type="text"
                        required
                        value={shippingAddress.addressLine1}
                        onChange={(e) => {
                          clearValidationIf('shipping-addressLine1');
                          setShippingAddress({ ...shippingAddress, addressLine1: e.target.value });
                        }}
                        aria-invalid={validationIssue?.fieldId === 'shipping-addressLine1'}
                        className={inputClassFor('shipping-addressLine1')}
                      />
                      {renderFieldError('shipping-addressLine1')}
                    </div>
                    <div>
                      <label htmlFor="shipping-state" className={labelClass}>State / Province *</label>
                      <select
                        id="shipping-state"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => {
                          clearValidationIf('shipping-state');
                          setShippingAddress({ ...shippingAddress, state: e.target.value, city: '' });
                        }}
                        aria-invalid={validationIssue?.fieldId === 'shipping-state'}
                        className={selectClassFor('shipping-state')}
                      >
                        <option value="">Select province</option>
                        {(apiProvinces.length > 0 ? apiProvinces : PAKISTAN_PROVINCES).map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                      {renderFieldError('shipping-state')}
                    </div>
                    <div>
                      <label htmlFor="shipping-city" className={labelClass}>City *</label>
                      <select
                        id="shipping-city"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => {
                          clearValidationIf('shipping-city');
                          setShippingAddress({ ...shippingAddress, city: e.target.value });
                        }}
                        aria-invalid={validationIssue?.fieldId === 'shipping-city'}
                        className={selectClassFor('shipping-city')}
                      >
                        <option value="">Select city</option>
                        {allCities.map((city) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      {renderFieldError('shipping-city')}
                    </div>
                    <div>
                      <label htmlFor="shipping-postalCode" className={labelClass}>Postal code (optional)</label>
                      <input
                        id="shipping-postalCode"
                        type="text"
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
                        readOnly
                        value="PK"
                        className={`${inputClass} bg-muted cursor-not-allowed`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="shipping-phone" className={labelClass}>Mobile Number *</label>
                      <input
                        id="shipping-phone"
                        type="tel"
                        required
                        minLength={10}
                        value={shippingAddress.phone || ''}
                        onChange={(e) => {
                          clearValidationIf('shipping-phone');
                          setShippingAddress({ ...shippingAddress, phone: e.target.value });
                        }}
                        aria-invalid={validationIssue?.fieldId === 'shipping-phone'}
                        className={inputClassFor('shipping-phone')}
                        placeholder="03001234567"
                      />
                      {renderFieldError('shipping-phone')}
                    </div>
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              {/* Saved addresses: dropdowns */}
              <section>
                <h2 className="font-display mb-4 text-xl font-semibold tracking-tight text-foreground">
                  Billing address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {emailField}
                </div>
                <label htmlFor="saved-billing" className="sr-only">Choose billing address</label>
                <select
                  id="saved-billing"
                  value={selectedBillingAddressId ?? ''}
                  onChange={(e) => {
                    clearValidationIf('saved-billing');
                    const id = e.target.value || null;
                    setSelectedBillingAddressId(id);
                    if (id) {
                      const a = savedAddresses.find((x) => x.id === id);
                      if (a) setBillingAddress(addressWithIdToAddress(a));
                    }
                  }}
                  aria-invalid={validationIssue?.fieldId === 'saved-billing'}
                  className={selectClassFor('saved-billing')}
                >
                  {savedAddresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatAddressLine(a)}
                      {a.isDefaultBilling ? ' (default billing)' : ''}
                    </option>
                  ))}
                </select>
                {renderFieldError('saved-billing')}
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
                  <h2 className="font-display mb-4 text-xl font-semibold tracking-tight text-foreground">
                    Shipping address
                  </h2>
                  <label htmlFor="saved-shipping" className="sr-only">Choose shipping address</label>
                  <select
                    id="saved-shipping"
                    value={selectedShippingAddressId ?? ''}
                    onChange={(e) => {
                      clearValidationIf('saved-shipping');
                      const id = e.target.value || null;
                      setSelectedShippingAddressId(id);
                      if (id) {
                        const a = savedAddresses.find((x) => x.id === id);
                        if (a) setShippingAddress(addressWithIdToAddress(a));
                      }
                    }}
                    aria-invalid={validationIssue?.fieldId === 'saved-shipping'}
                    className={selectClassFor('saved-shipping')}
                  >
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {formatAddressLine(a)}
                        {a.isDefaultShipping ? ' (default shipping)' : ''}
                      </option>
                    ))}
                  </select>
                  {renderFieldError('saved-shipping')}
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
          <section id="checkout-shipping-method">
            <h2 className="font-display mb-4 text-xl font-semibold tracking-tight text-foreground">
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
                    className={`flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors ${
                      selectedShippingId === opt.methodId
                        ? `${storefrontUi.optionSelected} ring-1 ring-ring`
                        : storefrontUi.optionIdle
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.methodId}
                      checked={selectedShippingId === opt.methodId}
                      onChange={() => {
                        clearValidationIf('checkout-shipping-method');
                        setSelectedShippingId(opt.methodId);
                      }}
                      className="h-4 w-4 text-primary focus:ring-ring/30"
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
                      {opt.isFreeShipping || qualifiesForFreeDelivery ? (
                        <span className="inline-flex items-baseline gap-2">
                          {(opt.originalCost ?? opt.cost) > 0 ? (
                            <span className="text-sm font-normal text-muted-foreground line-through">
                              {formatPrice(
                                Number(opt.originalCost ?? opt.cost),
                                opt.currency || displayCurrency,
                              )}
                            </span>
                          ) : null}
                          <span className="text-success">FREE</span>
                        </span>
                      ) : (
                        formatPrice(Number(opt.effectivePrice ?? opt.cost), opt.currency || displayCurrency)
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {renderFieldError('checkout-shipping-method')}
          </section>

          {/* Payment */}
          <section id="checkout-payment">
            <h2 className="font-display mb-4 text-xl font-semibold tracking-tight text-foreground">
              Payment
            </h2>
            {loadingPaymentMethods ? (
              <p className="text-sm text-muted-foreground">Loading payment methods…</p>
            ) : (
              <div className="space-y-2">
                {paymentMethods
                  .map((m) => (
                  <label
                    key={m.code}
                    className={`flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors ${
                      selectedPaymentCode === m.code
                        ? `${storefrontUi.optionSelected} ring-1 ring-ring`
                        : storefrontUi.optionIdle
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.code}
                      checked={selectedPaymentCode === m.code}
                      onChange={() => {
                        clearValidationIf('checkout-payment');
                        setSelectedPaymentCode(m.code);
                      }}
                      className="h-4 w-4 text-primary focus:ring-ring/30"
                    />
                    <span className="font-medium text-foreground">{m.name}</span>
                  </label>
                ))}
              </div>
            )}
            {renderFieldError('checkout-payment')}
          </section>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className={`lg:sticky lg:top-8 ${storefrontUi.card} p-6`}>
            <h2 className="font-display mb-4 text-lg font-semibold tracking-tight text-foreground">
              Order summary
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Update quantity or remove items before placing your order.
            </p>
            <ul className="mb-4 divide-y divide-border/60">
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
                      <CheckoutLineThumb
                        imageUrl={imageUrl}
                        alt={item.productName || 'Product'}
                      />
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
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {attrLines.map((line, lineIndex) => (
                                      <span
                                        key={`${item.variantId}-${lineIndex}-${line}`}
                                        className="inline-flex max-w-full items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground"
                                      >
                                        <span className="truncate">{line}</span>
                                      </span>
                                    ))}
                                  </div>
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
                          <div className="inline-flex items-center rounded-sm border border-border bg-card">
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
                            className={`${storefrontUi.btnDestructiveText} text-xs`}
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
                  {loadingShipping
                    ? 'Calculating…'
                    : qualifiesForFreeDelivery
                      ? (
                        <span className="inline-flex items-baseline gap-2">
                          {shippingFee > 0 ? (
                            <span className="text-sm font-normal text-muted-foreground line-through">
                              {formatPrice(shippingFee, displayCurrency)}
                            </span>
                          ) : null}
                          <span className="text-success">FREE</span>
                        </span>
                      )
                      : selectedShipping
                        ? formatPrice(displayShippingTotal, displayCurrency)
                        : '—'}
                </span>
              </div>
            </div>
            {!qualifiesForFreeDelivery &&
            freeDeliveryThreshold > 0 &&
            displaySubtotal >= minimumOrderAmount &&
            displaySubtotal < freeDeliveryThreshold ? (
              <p className="mt-3 rounded-sm bg-secondary/50 px-3 py-2 text-xs font-medium text-foreground">
                Add {formatPrice(amountRemainingForFreeDelivery, displayCurrency)} more to get Free
                Delivery.
              </p>
            ) : null}
            {qualifiesForFreeDelivery ? (
              <p className="mt-3 rounded-sm bg-success/10 px-3 py-2 text-xs font-medium text-success">
                Congratulations! Your order qualifies for Free Delivery.
              </p>
            ) : null}
            <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-lg font-semibold text-foreground">
              <span>Total</span>
              <span>{formatPrice(displayGrandTotal, displayCurrency)}</span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`${storefrontUi.btnPrimaryCheckout} hidden lg:block`}
            >
              {isLoading ? 'Processing…' : 'Place order'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sticky Place order — pinned above bottom toolbar */}
      <div
        className="fixed inset-x-0 z-[95] border-t border-border/70 bg-background/95 px-3 py-2.5 shadow-[0_0_0.9rem_rgba(0,0,0,0.12)] backdrop-blur-[8px] lg:hidden"
        style={{ bottom: 'calc(3.4375rem + var(--mobile-mini-cart-height, 0px) + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">Total</p>
            <p className="truncate text-base font-semibold text-foreground">
              {formatPrice(displayGrandTotal, displayCurrency)}
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`${storefrontUi.btnPrimaryCheckout} mt-0 min-w-[9.5rem] flex-none px-5 py-2.5`}
          >
            {isLoading ? 'Processing…' : 'Place order'}
          </button>
        </div>
      </div>

      {showMinimumOrderModal ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/55 px-4 backdrop-blur-[1px]">
          <div className={`w-full max-w-md ${storefrontUi.card} border border-border p-6 shadow-product-card`}>
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Minimum order required
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A minimum order value of {formatPrice(minimumOrderAmount, displayCurrency)} is
              required to place an order. Please add more items to your cart.
              {freeDeliveryThreshold > 0 ? (
                <>
                  <br />
                  <span className="mt-1 inline-block font-medium text-foreground">
                    Note: Shopping of {formatPrice(freeDeliveryThreshold, displayCurrency)} or more
                    qualifies for Free Delivery!
                  </span>
                </>
              ) : null}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMinimumOrderModal(false)}
                className={storefrontUi.btnPrimary}
              >
                Back to cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
