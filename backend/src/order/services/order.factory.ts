import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CartRedisService, Cart } from '../../cart/services/cart.redis';
import { VariantService } from '../../catalog/services/variant.service';
import { TaxCalculationService } from '../../tax/services/calculation.service';
import { CreateOrderDto, OrderTotalsDto } from '../dto/create-order.dto';
import { TaxCalculationItem } from '../../tax/dto/calculate-tax.dto';

@Injectable()
export class OrderFactory {
  private readonly logger = new Logger(OrderFactory.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartRedis: CartRedisService,
    private readonly variantService: VariantService,
    private readonly taxCalculationService: TaxCalculationService,
  ) {}

  /**
   * Generate human-readable order number
   * Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20241221-00001)
   */
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `ORD-${datePrefix}-`;

    // Find the highest order number for today
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
      select: {
        orderNumber: true,
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-5), 10);
      sequence = lastSequence + 1;
    }

    const sequenceStr = sequence.toString().padStart(5, '0');
    return `${prefix}${sequenceStr}`;
  }

  /**
   * Calculate order totals from cart items and tax calculation
   */
  private async calculateTotals(
    cart: Cart,
    taxCalculationResult?: { taxTotal: number; itemTaxes: Map<string, number> },
    checkoutTotals?: OrderTotalsDto,
  ): Promise<{
    subtotal: number;
    discountTotal: number;
    shippingTotal: number;
    taxTotal: number;
    grandTotal: number;
  }> {
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    if (checkoutTotals) {
      const discountTotal = Number(checkoutTotals.discountTotal) || 0;
      const shippingTotal = Number(checkoutTotals.shippingTotal) || 0;
      const taxTotal = Number(checkoutTotals.taxTotal) || 0;
      const resolvedSubtotal =
        Number(checkoutTotals.subtotal) > 0
          ? Number(checkoutTotals.subtotal)
          : subtotal;
      const grandTotal =
        Number(checkoutTotals.grandTotal) > 0
          ? Number(checkoutTotals.grandTotal)
          : Math.max(
              0,
              resolvedSubtotal - discountTotal + shippingTotal + taxTotal,
            );

      return {
        subtotal: resolvedSubtotal,
        discountTotal,
        shippingTotal,
        taxTotal,
        grandTotal,
      };
    }

    const discountTotal = 0;
    const shippingTotal = 0;
    const taxTotal = taxCalculationResult?.taxTotal || 0;
    const grandTotal = subtotal - discountTotal + shippingTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
    };
  }

  /**
   * Create order data from cart and DTO
   */
  async createOrderData(
    createOrderDto: CreateOrderDto,
    requestMetadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<{
    orderData: any;
    orderItemsData: any[];
    reservationIds: string[];
    taxCalculationItems: TaxCalculationItem[];
  }> {
    // Fetch cart from Redis
    const cart = await this.cartRedis.getCart(createOrderDto.cartId);
    if (!cart) {
      throw new NotFoundException(`Cart ${createOrderDto.cartId} not found`);
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create order from empty cart');
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Prepare tax calculation items
    const taxCalculationItems: TaxCalculationItem[] = [];
    const productTaxClassMap = new Map<string, string | null>();

    // Fetch products to get tax class IDs
    const productIds = [...new Set(cart.items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, taxClassId: true },
    });

    for (const product of products) {
      productTaxClassMap.set(product.id, product.taxClassId);
    }

    // Calculate taxes
    for (const cartItem of cart.items) {
      taxCalculationItems.push({
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        taxClassId: productTaxClassMap.get(cartItem.productId) || null,
        price: Number(cartItem.price),
        quantity: cartItem.quantity,
      });
    }

    const taxCalculation = await this.taxCalculationService.calculate(
      taxCalculationItems,
      {
        country: createOrderDto.billingAddress.country,
        region: createOrderDto.billingAddress.state,
        currency: cart.currency,
      },
      false, // Will emit event after order creation
    );

    // Create map of item tax amounts by productId+variantId
    const itemTaxMap = new Map<string, number>();
    for (const item of taxCalculation.items) {
      const key = `${item.productId}:${item.variantId || ''}`;
      itemTaxMap.set(key, item.taxAmount);
    }

    // Calculate totals
    const totals = await this.calculateTotals(
      cart,
      {
        taxTotal: taxCalculation.taxTotal,
        itemTaxes: itemTaxMap,
      },
      createOrderDto.totals,
    );

    // Fetch product/variant information for each cart item to create immutable snapshots
    const orderItemsData: any[] = [];
    const reservationIds: string[] = [];

    for (const cartItem of cart.items) {
      // Fetch variant (or synthetic variant for simple product when variantId === productId)
      const variant = await this.variantService.findOneOrForSimpleProduct(
        cartItem.variantId,
        cartItem.productId,
      );
      const product = await this.prisma.product.findUnique({
        where: { id: cartItem.productId },
        select: {
          name: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product ${cartItem.productId} not found`);
      }

      const productImage = product.images?.[0]?.url ?? null;
      const variantLabel =
        variant.name && variant.name !== product.name ? variant.name : null;

      // Calculate row totals with tax
      const unitPrice = Number(cartItem.price);
      const quantity = cartItem.quantity;
      const discountAmount = 0; // Can be calculated from applied discounts
      const itemKey = `${cartItem.productId}:${cartItem.variantId}`;
      const taxAmount = itemTaxMap.get(itemKey) || 0;
      const rowTotal = unitPrice * quantity - discountAmount + taxAmount;

      orderItemsData.push({
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        sku: variant.sku,
        name: product.name,
        attributes: cartItem.attributes || {},
        quantity,
        unitPrice,
        discountAmount,
        taxAmount,
        rowTotal,
        quantityFulfilled: 0,
        quantityRefunded: 0,
        metadata: {
          productName: product.name,
          variantLabel,
          productImage,
          ...(cartItem.isBundleComponent
            ? {
                bundleDealId: cartItem.bundleDealId,
                bundleGroupId: cartItem.bundleGroupId,
                bundleTitle:
                  cart.bundleGroups?.[cartItem.bundleGroupId!]?.title,
                bundleQuantity:
                  cart.bundleGroups?.[cartItem.bundleGroupId!]?.quantity,
                listPrice: cartItem.listPrice,
                allocatedDealPrice: unitPrice,
              }
            : {}),
        },
      });

      if (cartItem.reservationId) {
        reservationIds.push(cartItem.reservationId);
      }
    }

    // Create order data
    const orderData: any = {
      orderNumber,
      customerId: createOrderDto.customerId || null,
      customerGroupId: createOrderDto.customerGroupId || null,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      customerEmail: createOrderDto.customerEmail,
      customerName: createOrderDto.customerName || null,
      billingAddress: createOrderDto.billingAddress as any,
      shippingAddress: createOrderDto.shippingAddress as any,
      currency: cart.currency,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      shippingTotal: totals.shippingTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      appliedPriceRules: [] as any,
      ipAddress: requestMetadata?.ipAddress || null,
      userAgent: requestMetadata?.userAgent || null,
      notes: createOrderDto.notes || null,
      metadata: createOrderDto.metadata || {},
      items: {
        create: orderItemsData,
      },
    };

    return {
      orderData,
      orderItemsData,
      reservationIds,
      taxCalculationItems,
    };
  }
}
