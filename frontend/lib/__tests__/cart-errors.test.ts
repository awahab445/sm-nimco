import { describe, expect, it } from '@jest/globals';
import { ApiError } from '../api-client';
import {
  getAddToCartStockErrorMessage,
  getAvailableStockFromError,
  getCartQtyStockErrorMessage,
  getInlineStockAlertMessage,
} from '../cart-errors';

describe('getAddToCartStockErrorMessage', () => {
  it('returns stock-specific copy when availableStock is present', () => {
    const err = new ApiError('Insufficient stock. Only 5 items available.', 400, {
      message: 'Insufficient stock. Only 5 items available.',
      availableStock: 5,
    });
    expect(getAddToCartStockErrorMessage(err)).toBe(
      'Cannot add to cart. Only 5 items left in stock.',
    );
  });

  it('returns singular copy for one item left', () => {
    const err = new ApiError('Insufficient stock. Only 1 items available.', 400, {
      message: 'Insufficient stock. Only 1 items available.',
      availableStock: 1,
    });
    expect(getAddToCartStockErrorMessage(err)).toBe(
      'Cannot add to cart. Only 1 item left in stock.',
    );
  });

  it('returns out-of-stock copy when availableStock is zero', () => {
    const err = new ApiError('This product is currently out of stock.', 400, {
      message: 'This product is currently out of stock.',
      availableStock: 0,
    });
    expect(getAddToCartStockErrorMessage(err)).toBe(
      'Cannot add to cart. This product is out of stock.',
    );
  });

  it('returns null for unrelated errors', () => {
    const err = new ApiError('Cart not found', 404, { message: 'Cart not found' });
    expect(getAddToCartStockErrorMessage(err)).toBeNull();
  });
});

describe('getInlineStockAlertMessage', () => {
  it('returns shorter stock copy for product detail alerts', () => {
    const err = new ApiError('Insufficient stock. Only 100 items available.', 400, {
      message: 'Insufficient stock. Only 100 items available.',
      availableStock: 100,
    });
    expect(getInlineStockAlertMessage(err)).toBe('Only 100 items left in stock.');
  });

  it('returns out-of-stock copy when availableStock is zero', () => {
    const err = new ApiError('This product is currently out of stock.', 400, {
      message: 'This product is currently out of stock.',
      availableStock: 0,
    });
    expect(getInlineStockAlertMessage(err)).toBe('This product is out of stock.');
  });
});

describe('getAvailableStockFromError', () => {
  it('reads availableStock from payload', () => {
    const err = new ApiError('Insufficient stock. Only 16 items available.', 400, {
      message: 'Insufficient stock. Only 16 items available.',
      availableStock: 16,
    });
    expect(getAvailableStockFromError(err)).toBe(16);
  });

  it('parses available count from message when payload omits it', () => {
    const err = new ApiError('Insufficient stock. Only 16 items available.', 400, {
      message: 'Insufficient stock. Only 16 items available.',
    });
    expect(getAvailableStockFromError(err)).toBe(16);
  });
});

describe('getCartQtyStockErrorMessage', () => {
  it('explains qty was clamped to available stock', () => {
    expect(getCartQtyStockErrorMessage(16)).toBe(
      'Only 16 items left in stock. Quantity updated to the maximum available.',
    );
  });
});
