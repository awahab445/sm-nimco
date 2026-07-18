/**
 * Wishlist store (Zustand)
 *
 * Guests: product IDs in localStorage (no server).
 * Authenticated: persisted via /wishlist; guest IDs merge on login.
 */

import { create } from 'zustand';
import {
  wishlistApi,
  productApi,
  type WishlistItem,
  type Product,
  ApiError,
} from './api-client';
import { getToken } from './auth-token';

const WISHLIST_IDS_KEY = 'wishlist-product-ids';

function readGuestIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0))];
  } catch {
    return [];
  }
}

function writeGuestIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  if (ids.length === 0) {
    localStorage.removeItem(WISHLIST_IDS_KEY);
  } else {
    localStorage.setItem(WISHLIST_IDS_KEY, JSON.stringify(ids));
  }
}

function clearGuestIds(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WISHLIST_IDS_KEY);
}

function isAuthenticatedClient(): boolean {
  return typeof window !== 'undefined' && Boolean(getToken());
}

interface WishlistState {
  productIds: string[];
  items: WishlistItem[];
  /** Guest-resolved products for /wishlist page (not used when authenticated). */
  guestProducts: Product[];
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  count: () => number;
  has: (productId: string) => boolean;

  /** Load guest IDs or server list. Call on mount / auth change. */
  hydrate: () => Promise<void>;

  /** After login/register: merge guest IDs then load server list. */
  syncAfterAuth: () => Promise<void>;

  /** Clear server-backed state on logout; re-read empty guest storage. */
  resetToGuest: () => void;

  toggle: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;

  /** Resolve guest product details for the wishlist page. */
  loadGuestProducts: () => Promise<void>;

  clearError: () => void;
}

function setFromItems(
  set: (partial: Partial<WishlistState>) => void,
  items: WishlistItem[],
) {
  set({
    items,
    productIds: items.map((i) => i.productId),
    guestProducts: [],
    isLoading: false,
    isHydrated: true,
    error: null,
  });
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  items: [],
  guestProducts: [],
  isLoading: false,
  isHydrated: false,
  error: null,

  count: () => get().productIds.length,

  has: (productId: string) => get().productIds.includes(productId),

  hydrate: async () => {
    if (isAuthenticatedClient()) {
      set({ isLoading: true, error: null });
      try {
        const items = await wishlistApi.list();
        setFromItems(set, items);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load wishlist';
        // Fall back to guest IDs if session unexpectedly fails
        const ids = readGuestIds();
        set({
          productIds: ids,
          items: [],
          isLoading: false,
          isHydrated: true,
          error: message,
        });
      }
      return;
    }

    const ids = readGuestIds();
    set({
      productIds: ids,
      items: [],
      isLoading: false,
      isHydrated: true,
      error: null,
    });
  },

  syncAfterAuth: async () => {
    const guestIds = readGuestIds();
    set({ isLoading: true, error: null });
    try {
      const items =
        guestIds.length > 0
          ? await wishlistApi.merge(guestIds)
          : await wishlistApi.list();
      clearGuestIds();
      setFromItems(set, items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sync wishlist';
      set({ isLoading: false, isHydrated: true, error: message });
    }
  },

  resetToGuest: () => {
    const ids = readGuestIds();
    set({
      productIds: ids,
      items: [],
      guestProducts: [],
      isLoading: false,
      isHydrated: true,
      error: null,
    });
  },

  toggle: async (productId: string) => {
    if (!productId) return;
    const { productIds, has } = get();
    const inList = has(productId);

    if (!isAuthenticatedClient()) {
      const next = inList
        ? productIds.filter((id) => id !== productId)
        : [productId, ...productIds];
      writeGuestIds(next);
      set({
        productIds: next,
        guestProducts: get().guestProducts.filter((p) => next.includes(p.id)),
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      if (inList) {
        await wishlistApi.remove(productId);
        set({
          productIds: productIds.filter((id) => id !== productId),
          items: get().items.filter((i) => i.productId !== productId),
          isLoading: false,
        });
      } else {
        const item = await wishlistApi.add(productId);
        set({
          productIds: [productId, ...productIds.filter((id) => id !== productId)],
          items: [item, ...get().items.filter((i) => i.productId !== productId)],
          isLoading: false,
        });
      }
    } catch (err: unknown) {
      // Idempotent recovery: refresh list on conflict / not-found races
      if (err instanceof ApiError && (err.status === 409 || err.status === 404)) {
        try {
          const items = await wishlistApi.list();
          setFromItems(set, items);
          return;
        } catch {
          /* fall through */
        }
      }
      const message = err instanceof Error ? err.message : 'Wishlist update failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  remove: async (productId: string) => {
    if (!productId) return;
    if (!isAuthenticatedClient()) {
      const next = get().productIds.filter((id) => id !== productId);
      writeGuestIds(next);
      set({
        productIds: next,
        guestProducts: get().guestProducts.filter((p) => p.id !== productId),
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await wishlistApi.remove(productId);
      set({
        productIds: get().productIds.filter((id) => id !== productId),
        items: get().items.filter((i) => i.productId !== productId),
        isLoading: false,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        set({
          productIds: get().productIds.filter((id) => id !== productId),
          items: get().items.filter((i) => i.productId !== productId),
          isLoading: false,
        });
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  loadGuestProducts: async () => {
    const ids = get().productIds;
    if (ids.length === 0) {
      set({ guestProducts: [] });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            return await productApi.getProductById(id);
          } catch {
            return null;
          }
        }),
      );
      const products = results.filter((p): p is Product => p != null);
      // Drop IDs that no longer resolve
      const validIds = products.map((p) => p.id);
      if (validIds.length !== ids.length) {
        writeGuestIds(validIds);
        set({ productIds: validIds, guestProducts: products, isLoading: false });
      } else {
        set({ guestProducts: products, isLoading: false });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load wishlist products';
      set({ isLoading: false, error: message });
    }
  },

  clearError: () => set({ error: null }),
}));
