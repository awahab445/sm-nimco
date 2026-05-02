/**
 * @jest-environment jsdom
 */
import { useCartStore } from '../cart.store';

const mockCreateCart = jest.fn();
const mockGetCart = jest.fn();
const mockAddItem = jest.fn();
const mockClearCart = jest.fn();

jest.mock('../api-client', () => ({
  cartApi: {
    createCart: (...args: unknown[]) => mockCreateCart(...args),
    getCart: (...args: unknown[]) => mockGetCart(...args),
    addItem: (...args: unknown[]) => mockAddItem(...args),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: (...args: unknown[]) => mockClearCart(...args),
  },
}));

describe('cart store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useCartStore.setState({
      cartId: null,
      cart: null,
      isLoading: false,
      error: null,
    });
  });

  describe('clearError', () => {
    it('should set error to null', () => {
      useCartStore.setState({ error: 'Some error' });
      useCartStore.getState().clearError();
      expect(useCartStore.getState().error).toBe(null);
    });
  });

  describe('getOrCreateCartId', () => {
    it('should create a new cart when none exists and return cartId', async () => {
      mockCreateCart.mockResolvedValue({ cartId: 'new-cart-123' });

      const cartId = await useCartStore.getState().getOrCreateCartId();

      expect(cartId).toBe('new-cart-123');
      expect(mockCreateCart).toHaveBeenCalledTimes(1);
      expect(useCartStore.getState().cartId).toBe('new-cart-123');
      expect(localStorage.getItem('cart-id')).toBe('new-cart-123');
    });

    it('should return existing cartId from storage and not call createCart', async () => {
      localStorage.setItem('cart-id', 'existing-id');

      const cartId = await useCartStore.getState().getOrCreateCartId();

      expect(cartId).toBe('existing-id');
      expect(mockCreateCart).not.toHaveBeenCalled();
    });

    it('should set error and throw when createCart fails', async () => {
      mockCreateCart.mockRejectedValue(new Error('Network error'));

      await expect(useCartStore.getState().getOrCreateCartId()).rejects.toThrow(
        'Network error',
      );
      expect(useCartStore.getState().error).toBe('Network error');
      expect(useCartStore.getState().isLoading).toBe(false);
    });
  });

  describe('reorderFromOrder', () => {
    it('should return getOrCreateCartId when items array is empty', async () => {
      mockCreateCart.mockResolvedValue({ cartId: 'empty-cart-id' });

      const cartId = await useCartStore.getState().reorderFromOrder([]);

      expect(cartId).toBe('empty-cart-id');
      expect(mockCreateCart).toHaveBeenCalledTimes(1);
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it('should create new cart and add all items then return new cartId', async () => {
      const newCartId = 'reorder-cart-id';
      const mockCart = {
        id: newCartId,
        items: [],
        currency: 'USD',
        createdAt: '',
        updatedAt: '',
      };
      mockCreateCart.mockResolvedValue({ cartId: newCartId });
      mockGetCart.mockResolvedValue(mockCart);
      mockAddItem.mockResolvedValue({ ...mockCart, items: [{ productId: 'p1', variantId: 'v1', quantity: 2 }] });

      const items = [
        { productId: 'p1', variantId: 'v1', quantity: 2 },
        { productId: 'p2', variantId: null, quantity: 1 },
      ];

      const cartId = await useCartStore.getState().reorderFromOrder(items);

      expect(cartId).toBe(newCartId);
      expect(mockCreateCart).toHaveBeenCalledTimes(1);
      expect(mockGetCart).toHaveBeenCalledWith(newCartId);
      expect(mockAddItem).toHaveBeenCalledTimes(2);
      expect(mockAddItem).toHaveBeenNthCalledWith(1, newCartId, {
        productId: 'p1',
        variantId: 'v1',
        quantity: 2,
      });
      expect(mockAddItem).toHaveBeenNthCalledWith(2, newCartId, {
        productId: 'p2',
        variantId: 'p2',
        quantity: 1,
      });
      expect(useCartStore.getState().cartId).toBe(newCartId);
      expect(localStorage.getItem('cart-id')).toBe(newCartId);
    });

    it('should set error and throw when createCart fails during reorder', async () => {
      mockCreateCart.mockRejectedValue(new Error('API error'));

      await expect(
        useCartStore.getState().reorderFromOrder([
          { productId: 'p1', variantId: 'v1', quantity: 1 },
        ]),
      ).rejects.toThrow('API error');
      expect(useCartStore.getState().error).toBe('API error');
    });
  });
});
