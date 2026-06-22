import { BadRequestException } from '@nestjs/common';
import { InsufficientStockException } from './insufficient-stock.exception';

describe('InsufficientStockException', () => {
  it('includes availableStock in the response body', () => {
    const error = new InsufficientStockException(5);
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error.getResponse()).toEqual({
      message: 'Insufficient stock. Only 5 items available.',
      availableStock: 5,
    });
  });

  it('uses out-of-stock message when availableStock is zero', () => {
    const error = new InsufficientStockException(0);
    expect(error.getResponse()).toEqual({
      message: 'This product is currently out of stock.',
      availableStock: 0,
    });
  });
});
