import { BadRequestException } from '@nestjs/common';

export type InsufficientStockResponse = {
  message: string;
  availableStock: number;
};

export class InsufficientStockException extends BadRequestException {
  constructor(availableStock: number) {
    const message =
      availableStock === 0
        ? 'This product is currently out of stock.'
        : `Insufficient stock. Only ${availableStock} items available.`;

    const body: InsufficientStockResponse = {
      message,
      availableStock,
    };

    super(body);
  }
}
