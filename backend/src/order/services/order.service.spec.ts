import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderService } from './order.service';
import { OrderFactory } from './order.factory';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CartRedisService } from '../../cart/services/cart.redis';
import { TaxCalculationService } from '../../tax/services/calculation.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { CUSTOM_MANUAL_ORDER_PRODUCT_ID } from '../dto/create-manual-order.dto';

describe('OrderService cancellation stock restore', () => {
  let service: OrderService;

  const items = [
    { productId: 'prod-1', variantId: 'var-1', quantity: 2, metadata: {} },
    { productId: 'prod-2', variantId: null, quantity: 1, metadata: {} },
    {
      productId: CUSTOM_MANUAL_ORDER_PRODUCT_ID,
      variantId: null,
      quantity: 5,
      metadata: {},
    },
  ];

  const pendingOrder = {
    id: 'order-1',
    orderNumber: 'ORD-1',
    status: 'pending',
    fulfillmentStatus: 'unfulfilled',
    items,
  };

  const mockOrder = {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
  };
  const mockPrisma = {
    order: mockOrder,
    $transaction: jest.fn((cb: (tx: unknown) => unknown) =>
      cb({ order: mockOrder }),
    ),
  };

  const mockInventory = { restoreStockForOrder: jest.fn() };
  const mockEvents = { emit: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CartRedisService, useValue: {} },
        { provide: OrderFactory, useValue: {} },
        { provide: TaxCalculationService, useValue: {} },
        { provide: InventoryService, useValue: mockInventory },
        { provide: EventEmitter2, useValue: mockEvents },
      ],
    }).compile();

    service = module.get(OrderService);
    mockOrder.findUnique.mockResolvedValue(pendingOrder);
    mockOrder.findUniqueOrThrow.mockResolvedValue({
      ...pendingOrder,
      status: 'cancelled',
    });
  });

  it('cancelOrder restores stock for catalog lines and skips custom lines', async () => {
    mockOrder.updateMany.mockResolvedValue({ count: 1 });

    await service.cancelOrder('order-1', 'payment failed');

    expect(mockInventory.restoreStockForOrder).toHaveBeenCalledTimes(2);
    expect(mockInventory.restoreStockForOrder).toHaveBeenCalledWith(
      'var-1',
      2,
      expect.any(Object),
    );
    // Simple product: deducted by productId when variantId is null
    expect(mockInventory.restoreStockForOrder).toHaveBeenCalledWith(
      'prod-2',
      1,
      expect.any(Object),
    );
    expect(mockEvents.emit).toHaveBeenCalledWith(
      'order.cancelled',
      expect.anything(),
    );
  });

  it('does not restore stock twice when the order was already cancelled concurrently', async () => {
    mockOrder.updateMany.mockResolvedValue({ count: 0 });

    await service.cancelOrder('order-1');

    expect(mockInventory.restoreStockForOrder).not.toHaveBeenCalled();
    expect(mockEvents.emit).not.toHaveBeenCalled();
  });

  it('only claims orders that are not cancelled or completed', async () => {
    mockOrder.updateMany.mockResolvedValue({ count: 1 });

    await service.cancelOrderAndRestoreStock('order-1', {}, ['unconfirmed']);

    expect(mockOrder.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'order-1',
          status: { notIn: ['cancelled', 'completed'], in: ['unconfirmed'] },
        },
      }),
    );
  });

  it('updateOrderStatus to cancelled restores stock', async () => {
    mockOrder.updateMany.mockResolvedValue({ count: 1 });

    await service.updateOrderStatus('order-1', { status: 'cancelled' } as any);

    expect(mockInventory.restoreStockForOrder).toHaveBeenCalledTimes(2);
    expect(mockOrder.update).not.toHaveBeenCalled();
  });

  it('updateOrderStatus refuses to reopen a cancelled order', async () => {
    mockOrder.findUnique.mockResolvedValue({
      ...pendingOrder,
      status: 'cancelled',
    });

    await expect(
      service.updateOrderStatus('order-1', { status: 'pending' } as any),
    ).rejects.toThrow(BadRequestException);
    expect(mockOrder.update).not.toHaveBeenCalled();
  });

  it('cannot cancel a completed order', async () => {
    mockOrder.findUnique.mockResolvedValue({
      ...pendingOrder,
      status: 'completed',
    });

    await expect(service.cancelOrder('order-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockInventory.restoreStockForOrder).not.toHaveBeenCalled();
  });
});
