/**
 * Cart store (Zustand)
 * Persists cartId in localStorage and exposes cart API with get-or-create cart.
 */

import { create } from 'zustand';
import { cartApi, Cart } from './api-client';

const CART_ID_KEY = 'cart-id';

function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CART_ID_KEY);
}

function setStoredCartId(cartId: string | null): void {
  if (typeof window === 'undefined') return;
  if (cartId) {
    localStorage.setItem(CART_ID_KEY, cartId);
  } else {
    localStorage.removeItem(CART_ID_KEY);
  }
}

interface CartState {
  cartId: string | null;
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  /** Get current cart id from storage (no fetch). */
  getCartId: () => string | null;

  /** Ensure we have a cart id; create one if missing. Returns cartId. */
  getOrCreateCartId: () => Promise<string>;

  /** Fetch current cart and update state. No-op if no cartId. */
  refreshCart: () => Promise<void>;

  /** Add item; creates cart if needed. Updates cart state. */
  addToCart: (productId: string, variantId: string, quantity: number) => Promise<void>;

  /** Update item quantity. */
  updateItem: (variantId: string, quantity: number) => Promise<void>;

  /** Remove item from cart. */
  removeItem: (variantId: string) => Promise<void>;

  /** Clear cart and remove cartId from storage. */
  clearCart: () => Promise<void>;

  /**
   * Reorder: create a new cart, add all given items, update storage and state.
   * variantId can be null (use productId for simple products).
   * Returns the new cartId.
   */
  reorderFromOrder: (items: Array<{ productId: string; variantId: string | null; quantity: number }>) => Promise<string>;

  /** Clear error. */
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null,
  cart: null,
  isLoading: false,
  error: null,

  getCartId: () => {
    const id = getStoredCartId();
    set({ cartId: id });
    return id;
  },

  getOrCreateCartId: async () => {
    let cartId = getStoredCartId();
    if (cartId) {
      set({ cartId });
      return cartId;
    }
    set({ isLoading: true, error: null });
    try {
      const { cartId: newId } = await cartApi.createCart();
      setStoredCartId(newId);
      set({ cartId: newId, isLoading: false, error: null });
      return newId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create cart';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  refreshCart: async () => {
    const cartId = getStoredCartId() ?? get().cartId;
    if (!cartId) {
      set({ cart: null });
      return;
    }
    set({ cartId, isLoading: true, error: null });
    try {
      const cart = await cartApi.getCart(cartId);
      set({ cart, isLoading: false, error: null });
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 404) {
        setStoredCartId(null);
        set({ cartId: null, cart: null, isLoading: false, error: null });
      } else {
        const message = err instanceof Error ? err.message : 'Failed to load cart';
        set({ cart: null, isLoading: false, error: message });
      }
    }
  },

  addToCart: async (productId: string, variantId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cartId = await get().getOrCreateCartId();
      const cart = await cartApi.addItem(cartId, { productId, variantId, quantity });
      set({ cart, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  updateItem: async (variantId: string, quantity: number) => {
    const cartId = getStoredCartId() ?? get().cartId;
    if (!cartId) return;
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.updateItem(cartId, variantId, { quantity });
      set({ cart, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update cart';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  removeItem: async (variantId: string) => {
    const cartId = getStoredCartId() ?? get().cartId;
    if (!cartId) return;
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.removeItem(cartId, variantId);
      set({ cart, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  clearCart: async () => {
    const cartId = getStoredCartId() ?? get().cartId;
    if (!cartId) {
      set({ cartId: null, cart: null });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await cartApi.clearCart(cartId);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        // Cart already deleted (e.g. by another tab or backend); treat as success
      } else {
        const message = err instanceof Error ? err.message : 'Failed to clear cart';
        set({ isLoading: false, error: message });
        throw err;
      }
    } finally {
      setStoredCartId(null);
      set({ cartId: null, cart: null, isLoading: false, error: null });
    }
  },

  reorderFromOrder: async (items) => {
    if (!items.length) {
      const cartId = await get().getOrCreateCartId();
      set({ cartId, isLoading: false });
      return cartId;
    }
    set({ isLoading: true, error: null });
    try {
      const { cartId: newId } = await cartApi.createCart();
      setStoredCartId(newId);
      let cart = await cartApi.getCart(newId);
      for (const item of items) {
        const variantId = item.variantId ?? item.productId;
        cart = await cartApi.addItem(newId, {
          productId: item.productId,
          variantId,
          quantity: Math.max(1, item.quantity),
        });
      }
      set({ cartId: newId, cart, isLoading: false, error: null });
      return newId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add items to cart';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
