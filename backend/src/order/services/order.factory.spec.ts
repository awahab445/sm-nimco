import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderFactory } from './order.factory';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CartRedisService } from '../../cart/services/cart.redis';
import { VariantService } from '../../catalog/services/variant.service';
import { TaxCalculationService } from '../../tax/services/calculation.service';

describe('OrderFactory', () => {
  let factory: OrderFactory;
  let cartRedis: CartRedisService;

  const mockCartRedis = {
    getCart: jest.fn(),
  };

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
    },
  };

  const mockVariantService = {
    findOneOrForSimpleProduct: jest.fn(),
  };

  const mockTaxCalculationService = {
    calculate: jest.fn(),
  };

  const validCreateOrderDto = {
    cartId: 'test-cart-id',
    customerEmail: 'customer@example.com',
    customerName: 'Test Customer',
    billingAddress: {
      firstName: 'Test',
      lastName: 'User',
      addressLine1: '123 Main St',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      country: 'US',
    },
    shippingAddress: {
      firstName: 'Test',
      lastName: 'User',
      addressLine1: '123 Main St',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      country: 'US',
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderFactory,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CartRedisService, useValue: mockCartRedis },
        { provide: VariantService, useValue: mockVariantService },
        { provide: TaxCalculationService, useValue: mockTaxCalculationService },
      ],
    }).compile();

    factory = module.get<OrderFactory>(OrderFactory);
    cartRedis = module.get<CartRedisService>(CartRedisService);
  });

  describe('createOrderData', () => {
    it('should throw NotFoundException when cart does not exist', async () => {
      mockCartRedis.getCart.mockResolvedValue(null);

      await expect(factory.createOrderData(validCreateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(factory.createOrderData(validCreateOrderDto)).rejects.toThrow(
        'Cart test-cart-id not found',
      );
      expect(mockCartRedis.getCart).toHaveBeenCalledWith(validCreateOrderDto.cartId);
    });

    it('should throw BadRequestException when cart has no items', async () => {
      mockCartRedis.getCart.mockResolvedValue({
        id: validCreateOrderDto.cartId,
        items: [],
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await expect(factory.createOrderData(validCreateOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(factory.createOrderData(validCreateOrderDto)).rejects.toThrow(
        'Cannot create order from empty cart',
      );
    });
  });
});
