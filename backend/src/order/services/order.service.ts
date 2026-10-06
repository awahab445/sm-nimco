import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CartRedisService } from '../../cart/services/cart.redis';
import { TaxCalculationService } from '../../tax/services/calculation.service';
import { OrderFactory } from './order.factory';
import { CreateOrderDto } from '../dto/create-order.dto';
import {
  CreateManualOrderDto,
  CUSTOM_MANUAL_ORDER_PRODUCT_ID,
} from '../dto/create-manual-order.dto';
import { UpdateManualOrderDto } from '../dto/update-manual-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { OrderStatus } from '../enums/order-status.enum';
import {
  OrderCreatedEvent,
  OrderPaidEvent,
  OrderCancelledEvent,
} from '../events/order.events';
import { OrderCreatedEvent as InventoryOrderCreatedEvent } from '../../inventory/events/inventory.events';
import { isCustomOrderItemMetadata } from '../../shipping/utils/shipping-weight';
import { isAdminManualOrderSource } from '../constants/order.constants';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartRedis: CartRedisService,
    private readonly orderFactory: OrderFactory,
    private readonly taxCalculationService: TaxCalculationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async enrichItemsWithProductDetails(items: any[]): Promise<any[]> {
    if (!items?.length) return items ?? [];

    const productIds = [
      ...new Set(
        items
          .map((item) => item.productId)
          .filter(
            (id) =>
              Boolean(id) && id !== CUSTOM_MANUAL_ORDER_PRODUCT_ID,
          ),
      ),
    ];
    const products =
      productIds.length > 0
        ? await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
              id: true,
              name: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          })
        : [];

    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    return items.map((item) => {
      const metadata =
        item.metadata &&
        typeof item.metadata === 'object' &&
        !Array.isArray(item.metadata)
          ? (item.metadata as Record<string, unknown>)
          : {};
      const isCustom =
        metadata.isCustom === true ||
        item.productId === CUSTOM_MANUAL_ORDER_PRODUCT_ID;
      const product = isCustom ? undefined : productById.get(item.productId);
      const productName =
        (metadata.productName as string) || product?.name || item.name;
      const productImage =
        (metadata.productImage as string) || product?.images?.[0]?.url || null;
      let variantLabel = (metadata.variantLabel as string) || null;
      if (!variantLabel && item.name && item.name !== productName) {
        variantLabel = item.name;
      }

      return {
        ...item,
        productName,
        productImage,
        variantLabel,
        isCustom,
        product: {
          name: product?.name ?? productName,
          image: productImage,
        },
      };
    });
  }

  private async enrichOrder<T extends { items?: any[] }>(order: T): Promise<T> {
    return {
      ...order,
      items: await this.enrichItemsWithProductDetails(order.items ?? []),
    };
  }

  /**
   * Create order from cart
   */
  async createOrder(
    createOrderDto: CreateOrderDto,
    requestMetadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Create order data from cart
    const { orderData, reservationIds, taxCalculationItems } =
      await this.orderFactory.createOrderData(createOrderDto, requestMetadata);

    // Create order and items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: orderData,
        include: {
          items: true,
        },
      });

      return createdOrder;
    });

    // Store order taxes after order creation (separate from transaction to avoid complexity)
    // Order taxes are stored separately but refer to the created order
    try {
      await this.taxCalculationService.calculateAndStoreForOrder(
        order.id,
        taxCalculationItems,
        {
          country: createOrderDto.billingAddress.country,
          region: createOrderDto.billingAddress.state,
          currency: order.currency,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to store order taxes for order ${order.id}:`,
        error,
      );
      // Don't fail order creation if tax storage fails, but log the error
    }

    // Clear cart after successful order creation
    try {
      await this.cartRedis.deleteCart(createOrderDto.cartId);
      this.logger.log(
        `Cart ${createOrderDto.cartId} cleared after order creation`,
      );
    } catch (error) {
      this.logger.warn(`Failed to clear cart ${createOrderDto.cartId}:`, error);
      // Don't fail order creation if cart clearing fails
    }

    // Emit ORDER_CREATED event for inventory consumption
    // Map order items to reservation IDs (same order as cart items)
    const orderItems = order.items.map((item, index) => ({
      variantId: item.variantId || '',
      quantity: item.quantity,
      reservationId: reservationIds[index],
    }));

    // Emit event for inventory module (listens to 'order.created')
    this.eventEmitter.emit(
      'order.created',
      new InventoryOrderCreatedEvent(order.id, orderItems),
    );

    // Emit order domain event (for future order-specific handlers)
    this.eventEmitter.emit(
      'order.domain.created',
      new OrderCreatedEvent(
        order.id,
        order.orderNumber,
        order.customerId,
        orderItems,
      ),
    );

    this.logger.log(`Order created: ${order.orderNumber} (${order.id})`);

    return this.enrichOrder(order);
  }

  /**
   * Create a manual order from the admin panel (no cart).
   * Honors optional customUnitPrice / customDeliveryFee / customDiscount.
   * Auto-calculates Karachi/outstation shipping from total weight when fee is unset.
   */
  async createManualOrder(
    dto: CreateManualOrderDto,
    requestMetadata?: {
      ipAddress?: string;
      userAgent?: string;
      adminUserId?: string;
    },
  ) {
    const { orderData, orderItemsData, taxCalculationItems } =
      await this.orderFactory.createManualOrderData(dto, requestMetadata);

    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: orderData,
        include: {
          items: true,
        },
      });
    });

    try {
      await this.taxCalculationService.calculateAndStoreForOrder(
        order.id,
        taxCalculationItems,
        {
          country: dto.billingAddress.country,
          region: dto.billingAddress.state,
          currency: order.currency,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to store order taxes for manual order ${order.id}:`,
        error,
      );
    }

    // Inventory only for catalog lines — custom/unlisted lines have no stock row.
    const inventoryItems = order.items
      .map((item, index) => {
        const factoryItem = orderItemsData[index] as
          | {
              inventoryVariantId?: string | null;
              isCustom?: boolean;
              metadata?: unknown;
            }
          | undefined;
        if (
          factoryItem?.isCustom ||
          isCustomOrderItemMetadata(item.metadata) ||
          item.productId === CUSTOM_MANUAL_ORDER_PRODUCT_ID
        ) {
          return null;
        }
        return {
          variantId:
            factoryItem?.inventoryVariantId ||
            item.variantId ||
            item.productId ||
            '',
          quantity: item.quantity,
          reservationId: undefined as string | undefined,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row?.variantId));

    this.eventEmitter.emit(
      'order.created',
      new InventoryOrderCreatedEvent(order.id, inventoryItems),
    );

    this.eventEmitter.emit(
      'order.domain.created',
      new OrderCreatedEvent(
        order.id,
        order.orderNumber,
        order.customerId,
        inventoryItems,
      ),
    );

    this.logger.log(`Manual order created: ${order.orderNumber} (${order.id})`);

    return this.enrichOrder(order);
  }

  private static readonly MUTABLE_MANUAL_ORDER_STATUSES = new Set([
    'pending',
    'processing',
  ]);

  private assertManualOrderEditable(order: {
    id: string;
    status: string;
    metadata: unknown;
  }): void {
    const meta =
      order.metadata &&
      typeof order.metadata === 'object' &&
      !Array.isArray(order.metadata)
        ? (order.metadata as Record<string, unknown>)
        : {};

    if (!isAdminManualOrderSource(meta.source)) {
      throw new BadRequestException(
        'Only manual orders can be edited with this endpoint',
      );
    }

    if (!OrderService.MUTABLE_MANUAL_ORDER_STATUSES.has(order.status)) {
      throw new BadRequestException(
        `Cannot edit order in status "${order.status}". Only pending or processing manual orders can be edited.`,
      );
    }
  }

  /**
   * Update a mutable manual order (items, addresses, customer, notes, fees).
   * Recalculates totals. Inventory deltas are not adjusted on edit.
   */
  async updateManualOrder(
    orderId: string,
    dto: UpdateManualOrderDto,
    requestMetadata?: {
      ipAddress?: string;
      userAgent?: string;
      adminUserId?: string;
    },
  ) {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    this.assertManualOrderEditable(existing);

    const existingMeta =
      existing.metadata &&
      typeof existing.metadata === 'object' &&
      !Array.isArray(existing.metadata)
        ? (existing.metadata as Record<string, unknown>)
        : {};

    const { orderUpdateData, orderItemsData, taxCalculationItems } =
      await this.orderFactory.buildManualOrderUpdateData(
        dto,
        existingMeta,
        {
          ...requestMetadata,
          orderNumber: existing.orderNumber,
        },
      );

    const order = await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.orderTax.deleteMany({ where: { orderId } });

      const persistableItems = orderItemsData.map((row) => {
        const {
          _inventoryVariantId: _ignoredInventoryVariantId,
          inventoryVariantId: _ignoredInventoryVariantIdAlias,
          _taxKey: _ignoredTaxKey,
          _isCustom: _ignoredIsCustom,
          isCustom: _ignoredIsCustomAlias,
          ...persistable
        } = row as Record<string, unknown>;
        void _ignoredInventoryVariantId;
        void _ignoredInventoryVariantIdAlias;
        void _ignoredTaxKey;
        void _ignoredIsCustom;
        void _ignoredIsCustomAlias;
        return persistable;
      });

      return tx.order.update({
        where: { id: orderId },
        data: {
          ...orderUpdateData,
          items: {
            create: persistableItems as any,
          },
        },
        include: {
          items: true,
        },
      });
    });

    try {
      await this.taxCalculationService.calculateAndStoreForOrder(
        order.id,
        taxCalculationItems,
        {
          country: dto.billingAddress.country,
          region: dto.billingAddress.state,
          currency: order.currency,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to store order taxes for updated manual order ${order.id}:`,
        error,
      );
    }

    this.logger.log(`Manual order updated: ${order.orderNumber} (${order.id})`);

    return this.enrichOrder(order);
  }

  /**
   * Get order by ID (user-scoped)
   */
  async findOneById(orderId: string, customerId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // If customerId is provided, verify ownership
    if (customerId && order.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.enrichOrder(order);
  }

  /**
   * Get order by order number (user-scoped)
   */
  async findOneByOrderNumber(orderNumber: string, customerId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    // If customerId is provided, verify ownership
    if (customerId && order.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.enrichOrder(order);
  }

  /**
   * Public-safe order tracking by order number + customer email.
   */
  private normalizeEmail(email: string): string {
    return (email || '').trim().toLowerCase();
  }

  private async emailMatchesOrder(
    order: { customerEmail: string | null; customerId: string | null },
    email: string,
  ): Promise<boolean> {
    const normalized = this.normalizeEmail(email);
    if (!normalized) return false;

    if (this.normalizeEmail(order.customerEmail || '') === normalized) {
      return true;
    }

    if (order.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: order.customerId },
        select: { email: true },
      });
      if (customer && this.normalizeEmail(customer.email) === normalized) {
        return true;
      }
    }

    return false;
  }

  async trackByOrderNumberAndEmail(orderNumber: string, email: string) {
    const normalizedOrderNumber = (orderNumber || '').trim();
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedOrderNumber || !normalizedEmail) {
      throw new BadRequestException('orderNumber and email are required');
    }
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: normalizedOrderNumber },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException(`Order ${normalizedOrderNumber} not found`);
    }
    if (!(await this.emailMatchesOrder(order, normalizedEmail))) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return this.enrichOrder(order);
  }

  /**
   * List orders (admin or user-scoped)
   */
  async findAll(
    query: OrderQueryDto & { customerEmail?: string },
    customerId?: string,
  ) {
    const where: any = {};

    // Apply customer filter (for user-scoped queries)
    if (customerId) {
      where.customerId = customerId;
    } else if (query.customerId) {
      where.customerId = query.customerId;
    }

    // Filter by customer email (temporary solution until authentication is implemented)
    if (query.customerEmail) {
      where.customerEmail = query.customerEmail;
    }

    // Apply status filters
    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    const page = Math.max(1, Math.floor(Number(query.page)) || 1);
    const limit = Math.min(
      500,
      Math.max(1, Math.floor(Number(query.limit)) || 20),
    );
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: Math.floor(skip),
        take: Math.floor(limit),
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: await Promise.all(orders.map((order) => this.enrichOrder(order))),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order status / payment / fulfillment.
   *
   * Rules:
   * - Setting fulfillmentStatus to `fulfilled` (mark as ready) must NOT escalate
   *   order status to `completed`. Prefer `ready_for_pickup` / keep `processing`.
   * - `completed` is allowed only when payment is settled and delivery is finalized.
   */
  async updateOrderStatus(orderId: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (
      updateDto.status === undefined &&
      updateDto.paymentStatus === undefined &&
      updateDto.fulfillmentStatus === undefined
    ) {
      throw new BadRequestException(
        'At least one of status, paymentStatus, or fulfillmentStatus is required',
      );
    }

    const nextPaymentStatus = updateDto.paymentStatus ?? order.paymentStatus;
    const nextFulfillmentStatus =
      updateDto.fulfillmentStatus ?? order.fulfillmentStatus;
    let nextStatus = updateDto.status ?? order.status;

    // Explicit ready_for_pickup must never be demoted (e.g. back to processing).
    if (updateDto.status === OrderStatus.READY_FOR_PICKUP) {
      nextStatus = OrderStatus.READY_FOR_PICKUP;
    } else if (updateDto.fulfillmentStatus === 'fulfilled') {
      // Mark-as-ready / fulfilled must never escalate to completed, and must not
      // leave the order stuck on processing when fulfillment becomes fulfilled.
      if (
        nextStatus === OrderStatus.COMPLETED ||
        updateDto.status === undefined
      ) {
        if (order.status !== OrderStatus.CANCELLED) {
          nextStatus = OrderStatus.READY_FOR_PICKUP;
        }
      }
    }

    // Validate status transitions
    if (
      nextStatus === OrderStatus.CANCELLED &&
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException('Cannot cancel a completed order');
    }

    if (
      nextStatus === OrderStatus.COMPLETED &&
      order.status !== OrderStatus.COMPLETED
    ) {
      const paymentSettled = nextPaymentStatus === 'paid';
      const deliveryFinalized = nextFulfillmentStatus === 'delivered';
      if (!paymentSettled || !deliveryFinalized) {
        throw new BadRequestException(
          'Order can only be marked completed when payment is settled and delivery is fully finalized',
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (nextStatus !== order.status) {
      updateData.status = nextStatus;
    }

    if (
      updateDto.paymentStatus !== undefined &&
      updateDto.paymentStatus !== order.paymentStatus
    ) {
      updateData.paymentStatus = updateDto.paymentStatus;
    }

    if (
      updateDto.fulfillmentStatus !== undefined &&
      updateDto.fulfillmentStatus !== order.fulfillmentStatus
    ) {
      updateData.fulfillmentStatus = updateDto.fulfillmentStatus;
    }

    // Set cancelled_at or completed_at timestamps
    if (
      nextStatus === OrderStatus.CANCELLED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      updateData.cancelledAt = new Date();
    }

    if (
      nextStatus === OrderStatus.COMPLETED &&
      order.status !== OrderStatus.COMPLETED
    ) {
      updateData.completedAt = new Date();
    }

    if (Object.keys(updateData).length === 0) {
      return order;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
      },
    });

    // Emit events based on status changes
    if (
      nextStatus === OrderStatus.CANCELLED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      this.eventEmitter.emit(
        'order.cancelled',
        new OrderCancelledEvent(updatedOrder.id, updatedOrder.orderNumber),
      );
    }

    // Emit event when fulfillment status changes to 'delivered'
    if (
      updateDto.fulfillmentStatus === 'delivered' &&
      order.fulfillmentStatus !== 'delivered'
    ) {
      this.eventEmitter.emit('order.delivered', {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
      });
    }

    this.logger.log(
      `Order ${updatedOrder.orderNumber} status updated to ${updatedOrder.status}` +
        (updateDto.fulfillmentStatus
          ? ` (fulfillment: ${updateDto.fulfillmentStatus})`
          : ''),
    );

    return updatedOrder;
  }

  /**
   * Mark order as paid (called by payment event handler)
   */
  async markOrderAsPaid(orderId: string, paymentId?: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
      },
      include: {
        items: true,
      },
    });

    this.eventEmitter.emit(
      'order.paid',
      new OrderPaidEvent(order.id, order.orderNumber, paymentId),
    );

    this.logger.log(`Order ${order.orderNumber} marked as paid`);

    return order;
  }

  /**
   * Cancel order and release stock (called by payment failure handler)
   */
  async cancelOrder(orderId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.status === 'cancelled') {
      return order; // Already cancelled
    }

    if (order.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed order');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        paymentStatus: 'failed',
        cancelledAt: new Date(),
      },
    });

    // Emit cancellation event (inventory module will handle stock release if needed)
    this.eventEmitter.emit(
      'order.cancelled',
      new OrderCancelledEvent(
        updatedOrder.id,
        updatedOrder.orderNumber,
        reason,
      ),
    );

    this.logger.log(
      `Order ${updatedOrder.orderNumber} cancelled: ${reason || 'No reason provided'}`,
    );

    return updatedOrder;
  }

  /**
   * Permanently delete an order and non-cascading related records.
   * OrderItem / OrderShipping / OrderTax cascade via Prisma relations.
   */
  async deleteOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { orderId: id } });
      await tx.promotionLog.deleteMany({ where: { orderId: id } });
      await tx.inventoryReservation.deleteMany({
        where: { referenceType: 'order', referenceId: id },
      });
      await tx.order.delete({ where: { id } });
    });

    this.logger.log(`Order ${order.orderNumber} permanently deleted`);

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  }
}
