import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CartService } from './cart.service';
import { CartRedisService } from './cart.redis';
import { VariantService } from '../../catalog/services/variant.service';
import { ProductService } from '../../catalog/services/product.service';
import { ReservationService } from '../../inventory/services/reservation.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { PromotionsService } from '../../promotions/services/promotions.service';

describe('CartService', () => {
  let service: CartService;
  let cartRedis: CartRedisService;

  const mockCartRedis = {
    createCart: jest.fn(),
    getCart: jest.fn(),
    updateCart: jest.fn(),
    extendCartTTL: jest.fn(),
  };

  const mockVariantService = {
    findOneOrForSimpleProduct: jest.fn(),
  };

  const mockProductService = {
    findOneById: jest.fn(),
  };

  const mockReservationService = {
    reserveStock: jest.fn(),
    releaseStock: jest.fn(),
  };

  const mockInventoryService = {
    hasSufficientStock: jest.fn(),
    getAvailableQuantity: jest.fn(),
  };

  const mockPromotionsService = {
    applyPromotions: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRedisService, useValue: mockCartRedis },
        { provide: VariantService, useValue: mockVariantService },
        { provide: ProductService, useValue: mockProductService },
        { provide: ReservationService, useValue: mockReservationService },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: PromotionsService, useValue: mockPromotionsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRedis = module.get<CartRedisService>(CartRedisService);
  });

  describe('createCart', () => {
    it('should create a cart and return cartId', async () => {
      mockCartRedis.createCart.mockResolvedValue(undefined);
      const result = await service.createCart();
      expect(result).toHaveProperty('cartId');
      expect(typeof result.cartId).toBe('string');
      expect(result.cartId.length).toBeGreaterThan(0);
      expect(mockCartRedis.createCart).toHaveBeenCalledWith(
        result.cartId,
        expect.any(String),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'cart.created',
        expect.any(Object),
      );
    });

    it('should use default currency when not provided', async () => {
      mockCartRedis.createCart.mockResolvedValue(undefined);
      await service.createCart();
      expect(mockCartRedis.createCart).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
    });

    it('should use provided currency', async () => {
      mockCartRedis.createCart.mockResolvedValue(undefined);
      await service.createCart('PKR');
      expect(mockCartRedis.createCart).toHaveBeenCalledWith(
        expect.any(String),
        'PKR',
      );
    });
  });

  describe('getCart', () => {
    it('should throw NotFoundException when cart does not exist', async () => {
      mockCartRedis.getCart.mockResolvedValue(null);
      await expect(service.getCart('non-existent-cart-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getCart('non-existent-cart-id')).rejects.toThrow(
        'Cart with ID non-existent-cart-id not found',
      );
    });

    it('should return enriched cart when cart exists', async () => {
      const cartId = 'test-cart-id';
      const mockCart = {
        id: cartId,
        items: [
          {
            variantId: 'v1',
            productId: 'p1',
            quantity: 2,
            price: 100,
            currency: 'USD',
            attributes: {},
            reservationId: 'res-1',
            addedAt: new Date().toISOString(),
          },
        ],
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCartRedis.getCart.mockResolvedValue(mockCart);
      mockVariantService.findOneOrForSimpleProduct.mockResolvedValue({
        id: 'v1',
        productId: 'p1',
        name: 'Variant 1',
        price: 100,
        attributes: {},
        images: [],
        product: { name: 'Product 1' },
      });
      mockProductService.findOneById.mockResolvedValue({ name: 'Product 1' });

      const result = await service.getCart(cartId);
      expect(result).toHaveProperty('id', cartId);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('productName');
      expect(mockCartRedis.getCart).toHaveBeenCalledWith(cartId);
    });
  });
});
