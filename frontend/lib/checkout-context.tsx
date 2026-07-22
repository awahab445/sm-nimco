'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  checkoutApi,
  orderApi,
  CheckoutSession,
  Address,
  ShippingMethod,
  ApiError,
} from './api-client';
import { useCartStore } from './cart.store';
import {
  trackBeginCheckout,
} from './analytics/events';
import { checkoutItemToGa4Item } from './analytics/mappers';
import { metaCapiClientFields } from './analytics/meta-capi-client';
import { setGuestOrderEmail } from './guest-order-session';
import { useAuthStore } from './auth.store';
import {
  getPendingCouponCode,
  clearPendingCouponCode,
  validateCouponCodeForCartLike,
  checkoutItemsToValidateItems,
} from './coupon-sync';

export interface PaymentInfo {
  paymentMethodCode: string;
  customerEmail: string;
  customerName?: string;
  notes?: string;
}

interface CheckoutState {
  checkoutId: string | null;
  checkout: CheckoutSession | null;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  paymentRedirectUrl: string | null;
  orderId: string | null;
  orderNumber: string | null;
  paymentInfo: PaymentInfo | null;
}

interface CheckoutContextType extends CheckoutState {
  startCheckout: (cartId: string, options?: { customerId?: string; customerEmail?: string }) => Promise<void>;
  updateAddresses: (addresses: { billingAddress?: Address; shippingAddress?: Address }) => Promise<void>;
  updateShippingMethod: (shipping: ShippingMethod) => Promise<void>;
  setPaymentInfo: (info: PaymentInfo) => void;
  confirmCheckout: (paymentPayload?: PaymentInfo) => Promise<{ orderId: string; orderNumber: string; paymentIntent?: any }>;
  setCurrentStep: (step: number) => void;
  setPaymentRedirectUrl: (url: string | null) => void;
  refreshCheckout: () => Promise<void>;
  updateItemQuantity: (variantId: string, quantity: number) => Promise<void>;
  setGuestCustomer: (customerEmail: string) => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  clearError: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

function isCartNotFoundError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    /cart.*not found/i.test(error.message)
  );
}

function mergeCheckoutWithCartImages(checkout: CheckoutSession): CheckoutSession {
  const cartItems = useCartStore.getState().cart?.items ?? [];
  if (!checkout.items?.length || !cartItems.length) return checkout;

  const imageByVariantId = new Map<string, string>();
  for (const item of cartItems) {
    if (item.productImage) imageByVariantId.set(item.variantId, item.productImage);
  }

  return {
    ...checkout,
    items: checkout.items.map((item) => ({
      ...item,
      productImage: item.productImage || imageByVariantId.get(item.variantId),
    })),
  };
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>({
    checkoutId: null,
    checkout: null,
    currentStep: 1,
    isLoading: false,
    error: null,
    paymentRedirectUrl: null,
    orderId: null,
    orderNumber: null,
    paymentInfo: null,
  });

  const refreshCheckout = useCallback(async () => {
    if (!state.checkoutId) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const checkoutRaw = await checkoutApi.getCheckout(state.checkoutId);
      const checkout = mergeCheckoutWithCartImages(checkoutRaw);
      setState((prev) => ({
        ...prev,
        checkout,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to load checkout';
      setState((prev) => ({
        ...prev,
        error: message,
        isLoading: false,
      }));
    }
  }, [state.checkoutId]);

  const startCheckout = useCallback(
    async (cartId: string, options?: { customerId?: string; customerEmail?: string }) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const authUser = useAuthStore.getState().user;
        const matchUser = authUser
          ? {
              id: authUser.id,
              email: authUser.email,
              phone: authUser.phone,
            }
          : options?.customerEmail
            ? { email: options.customerEmail }
            : options?.customerId
              ? { id: options.customerId }
              : null;
        const { checkoutId } = await checkoutApi.startCheckout(cartId, {
          ...options,
          ...metaCapiClientFields(undefined, matchUser),
        });
        let checkoutRaw = await checkoutApi.getCheckout(checkoutId);
        const pending = getPendingCouponCode();
        if (
          pending &&
          !checkoutRaw.couponCode &&
          checkoutRaw.items?.length > 0
        ) {
          const validated = await validateCouponCodeForCartLike({
            code: pending,
            subtotal: checkoutRaw.subtotal,
            items: checkoutItemsToValidateItems(checkoutRaw.items),
            customerId: options?.customerId ?? checkoutRaw.customerId,
            customerGroupId: checkoutRaw.customerGroupId,
          });
          if (validated.ok) {
            try {
              checkoutRaw = await checkoutApi.applyCoupon(checkoutId, pending);
            } catch {
              clearPendingCouponCode();
            }
          } else {
            clearPendingCouponCode();
          }
        }
        const checkout = mergeCheckoutWithCartImages(checkoutRaw);

        setState((prev) => ({
          ...prev,
          checkoutId,
          checkout,
          currentStep: 1,
          isLoading: false,
          error: null,
        }));

        const gaItems = checkout.items.map(checkoutItemToGa4Item);
        trackBeginCheckout(
          checkoutId,
          gaItems,
          checkout.couponCode,
          matchUser ??
            (checkout.customerId || checkout.customerEmail
              ? {
                  id: checkout.customerId,
                  email: checkout.customerEmail,
                }
              : null),
        );
    } catch (error) {
      if (isCartNotFoundError(error)) {
        try {
          await useCartStore.getState().recoverFromNotFound();
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
          if (typeof window !== 'undefined') {
            window.location.replace('/cart');
          }
          return;
        } catch {
          setState((prev) => ({
            ...prev,
            error: 'Your cart expired and we could not create a new one. Please try again.',
            isLoading: false,
          }));
          return;
        }
      }

      const message = error instanceof ApiError ? error.message : 'Failed to start checkout';
      setState((prev) => ({
        ...prev,
        error: message,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateAddresses = useCallback(
    async (addresses: { billingAddress?: Address; shippingAddress?: Address }) => {
      if (!state.checkoutId) throw new Error('No checkout session');

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const checkoutRaw = await checkoutApi.updateAddress(state.checkoutId, addresses);
        const checkout = mergeCheckoutWithCartImages(checkoutRaw);
        
        setState((prev) => ({
          ...prev,
          checkout,
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to update addresses';
        setState((prev) => ({
          ...prev,
          error: message,
          isLoading: false,
        }));
        throw error;
      }
    },
    [state.checkoutId],
  );

  const updateShippingMethod = useCallback(
    async (shipping: ShippingMethod) => {
      if (!state.checkoutId) throw new Error('No checkout session');

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const checkoutRaw = await checkoutApi.updateShipping(state.checkoutId, shipping);
        const checkout = mergeCheckoutWithCartImages(checkoutRaw);
        
        setState((prev) => ({
          ...prev,
          checkout,
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to update shipping method';
        setState((prev) => ({
          ...prev,
          error: message,
          isLoading: false,
        }));
        throw error;
      }
    },
    [state.checkoutId],
  );

  const setPaymentInfo = useCallback((info: PaymentInfo) => {
    setState((prev) => ({ ...prev, paymentInfo: info }));
  }, []);

  const confirmCheckout = useCallback(
    async (paymentPayload?: PaymentInfo) => {
      if (!state.checkoutId) throw new Error('No checkout session');
      const info = paymentPayload ?? state.paymentInfo;
      if (!info) throw new Error('Payment information not set');

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        let base =
          (typeof window !== 'undefined' && window.location?.origin) ||
          process.env.NEXT_PUBLIC_APP_URL ||
          '';
        if (base && !/^https?:\/\//i.test(base) && process.env.NEXT_PUBLIC_VERCEL_URL) {
          base = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
        }
        const hasValidBase = base && (base.startsWith('http://') || base.startsWith('https://'));
        const returnUrl = hasValidBase ? `${base.replace(/\/$/, '')}/checkout/success` : undefined;
        const cancelUrl = hasValidBase ? `${base.replace(/\/$/, '')}/checkout/failure` : undefined;

        const payload = {
          ...info,
          ...(returnUrl && { returnUrl }),
          ...(cancelUrl && { cancelUrl }),
          ...(state.checkout?.customerId && { customerId: state.checkout.customerId }),
          ...(state.checkout?.customerGroupId && { customerGroupId: state.checkout.customerGroupId }),
          ...metaCapiClientFields(),
        };
        if (info.customerEmail) {
          setGuestOrderEmail(info.customerEmail);
        }
        const result = await checkoutApi.confirmCheckout(state.checkoutId, payload);

        setState((prev) => ({
          ...prev,
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          paymentRedirectUrl: result.paymentIntent?.redirectUrl || null,
          paymentInfo: info,
          isLoading: false,
        }));

        return result;
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to confirm checkout';
        setState((prev) => ({
          ...prev,
          error: message,
          isLoading: false,
        }));
        throw error;
      }
    },
    [state.checkoutId, state.paymentInfo],
  );

  const setCurrentStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const setPaymentRedirectUrl = useCallback((url: string | null) => {
    setState((prev) => ({ ...prev, paymentRedirectUrl: url }));
  }, []);

  const updateItemQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      if (!state.checkoutId) return;

      try {
        setState((prev) => ({ ...prev, error: null }));
        const checkoutRaw = await checkoutApi.updateItemQuantity(
          state.checkoutId,
          variantId,
          quantity,
        );
        const checkout = mergeCheckoutWithCartImages(checkoutRaw);
        setState((prev) => ({ ...prev, checkout }));
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to update quantity';
        setState((prev) => ({ ...prev, error: message }));
      }
    },
    [state.checkoutId],
  );

  const setGuestCustomer = useCallback(
    async (customerEmail: string) => {
      if (!state.checkoutId) throw new Error('No checkout session');
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const checkoutRaw = await checkoutApi.setGuestCustomer(state.checkoutId, customerEmail);
        const checkout = mergeCheckoutWithCartImages(checkoutRaw);
        setState((prev) => ({ ...prev, checkout, isLoading: false }));
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to set guest customer';
        setState((prev) => ({ ...prev, error: message, isLoading: false }));
        throw error;
      }
    },
    [state.checkoutId],
  );

  const applyCoupon = useCallback(
    async (couponCode: string) => {
      if (!state.checkoutId) throw new Error('No checkout session');
      try {
        setState((prev) => ({ ...prev, error: null }));
        const checkoutRaw = await checkoutApi.applyCoupon(state.checkoutId, couponCode);
        const checkout = mergeCheckoutWithCartImages(checkoutRaw);
        setState((prev) => ({ ...prev, checkout }));
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to apply coupon';
        setState((prev) => ({ ...prev, error: message }));
        throw error;
      }
    },
    [state.checkoutId],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        ...state,
        startCheckout,
        updateAddresses,
        updateShippingMethod,
        setPaymentInfo,
        confirmCheckout,
        setCurrentStep,
        setPaymentRedirectUrl,
        refreshCheckout,
        updateItemQuantity,
        setGuestCustomer,
        applyCoupon,
        clearError,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
}

