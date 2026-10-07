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
import {
  CreateManualOrderDto,
  CUSTOM_MANUAL_ORDER_PRODUCT_ID,
  isManualCustomItem,
} from '../dto/create-manual-order.dto';
import { TaxCalculationItem } from '../../tax/dto/calculate-tax.dto';
import { APP_CURRENCY } from '../../common/currency';
import {
  DEFAULT_SHIPPING_WEIGHT_KG,
  toShippingWeightKg,
} from '../../shipping/utils/shipping-weight';
import { calculateShippingFee } from '../../shipping/utils/shipping-fee';
import { ORDER_SOURCE_ADMIN_MANUAL } from '../constants/order.constants';

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
    // Fetch cart from Redis (source of truth for order lines after checkout sync)
    const cart = await this.cartRedis.getCart(createOrderDto.cartId);
    if (!cart) {
      throw new NotFoundException(`Cart ${createOrderDto.cartId} not found`);
    }

    // Drop invalid quantities defensively (should already be synced from checkout).
    cart.items = cart.items.filter((item) => item.quantity > 0);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create order from empty cart');
    }

    // Fail closed if checkout passed an explicit line snapshot that diverges from cart.
    const checkoutLineItems = createOrderDto.metadata?.checkoutLineItems as
      | Array<{ variantId: string; quantity: number }>
      | undefined;
    if (checkoutLineItems?.length) {
      if (checkoutLineItems.length !== cart.items.length) {
        throw new BadRequestException(
          'Cart is out of sync with checkout. Please refresh and try again.',
        );
      }
      for (const expected of checkoutLineItems) {
        const cartItem = cart.items.find(
          (item) => item.variantId === expected.variantId,
        );
        if (!cartItem || cartItem.quantity !== expected.quantity) {
          throw new BadRequestException(
            'Cart is out of sync with checkout. Please refresh and try again.',
          );
        }
      }
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

  /**
   * Resolve manual-order line items, tax, weight, and totals from a create/update DTO.
   * Supports catalog products and custom/unlisted lines (no productId).
   */
  private async resolveManualOrderLines(dto: CreateManualOrderDto): Promise<{
    orderItemsData: any[];
    taxCalculationItems: TaxCalculationItem[];
    subtotal: number;
    discountTotal: number;
    shippingTotal: number;
    taxTotal: number;
    grandTotal: number;
    currency: string;
    totalWeightKg: number;
  }> {
    if (!dto.items?.length) {
      throw new BadRequestException('Manual order requires at least one item');
    }

    const currency = (dto.currency || APP_CURRENCY || 'PKR').toUpperCase();

    const orderItemsData: any[] = [];
    const taxCalculationItems: TaxCalculationItem[] = [];
    let totalWeightKg = 0;

    const catalogProductIds = [
      ...new Set(
        dto.items
          .filter((item) => !isManualCustomItem(item))
          .map((item) => item.productId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const products =
      catalogProductIds.length > 0
        ? await this.prisma.product.findMany({
            where: { id: { in: catalogProductIds }, deletedAt: null },
            select: {
              id: true,
              name: true,
              sku: true,
              type: true,
              basePrice: true,
              taxClassId: true,
              shippingWeight: true,
              shippingWeightUnit: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          })
        : [];
    const productById = new Map(products.map((p) => [p.id, p]));

    for (const item of dto.items) {
      if (isManualCustomItem(item)) {
        const title = String(item.title ?? '').trim();
        if (!title) {
          throw new BadRequestException(
            'Custom items require a non-empty title',
          );
        }

        const unitPrice = Number(item.unitPrice);
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new BadRequestException(
            `Invalid unit price for custom item "${title}"`,
          );
        }

        const quantity = item.quantity;
        const weightKgRaw = Number(item.weight);
        const weightKg =
          Number.isFinite(weightKgRaw) && weightKgRaw >= 0
            ? weightKgRaw
            : DEFAULT_SHIPPING_WEIGHT_KG;
        totalWeightKg += weightKg * quantity;

        const customTaxProductId = `custom-line-${orderItemsData.length}`;

        taxCalculationItems.push({
          productId: customTaxProductId,
          taxClassId: null,
          price: unitPrice,
          quantity,
        });

        orderItemsData.push({
          productId: CUSTOM_MANUAL_ORDER_PRODUCT_ID,
          variantId: null,
          sku: 'CUSTOM',
          name: title,
          attributes: {},
          quantity,
          unitPrice,
          discountAmount: 0,
          taxAmount: 0,
          rowTotal: 0,
          quantityFulfilled: 0,
          quantityRefunded: 0,
          metadata: {
            isCustom: true,
            productName: title,
            variantLabel: null,
            productImage: null,
            originalUnitPrice: unitPrice,
            priceOverridden: false,
            weightKg,
            weight: weightKg,
          },
          _taxKey: `${customTaxProductId}:`,
          _inventoryVariantId: null,
          _isCustom: true,
        });
        continue;
      }

      const productId = item.productId as string;
      const product = productById.get(productId);
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      const resolvedVariantId = item.variantId || productId;
      const variant = await this.variantService.findOneOrForSimpleProduct(
        resolvedVariantId,
        productId,
      );

      const catalogUnitPrice = Number(variant.price);
      const hasCustomPrice =
        item.customUnitPrice !== undefined && item.customUnitPrice !== null;
      const unitPrice = hasCustomPrice
        ? Number(item.customUnitPrice)
        : catalogUnitPrice;

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new BadRequestException(
          `Invalid unit price for product ${productId}`,
        );
      }

      const quantity = item.quantity;
      const productImage = product.images?.[0]?.url ?? null;
      const variantLabel =
        variant.name && variant.name !== product.name ? variant.name : null;

      const variantWeight = Number(
        (variant as { shippingWeight?: number }).shippingWeight,
      );
      const productWeight = Number(product.shippingWeight);
      let unitWeightKg = DEFAULT_SHIPPING_WEIGHT_KG;
      const weightUnit = product.shippingWeightUnit ?? 'KG';
      if (Number.isFinite(variantWeight) && variantWeight > 0) {
        unitWeightKg = toShippingWeightKg(
          variantWeight,
          (variant as { shippingWeightUnit?: string }).shippingWeightUnit ??
            weightUnit,
        );
      } else if (Number.isFinite(productWeight) && productWeight > 0) {
        unitWeightKg = toShippingWeightKg(productWeight, weightUnit);
      }
      totalWeightKg += unitWeightKg * quantity;

      taxCalculationItems.push({
        productId,
        ...(resolvedVariantId !== productId
          ? { variantId: resolvedVariantId }
          : {}),
        taxClassId: product.taxClassId || null,
        price: unitPrice,
        quantity,
      });

      orderItemsData.push({
        productId,
        variantId: resolvedVariantId === productId ? null : resolvedVariantId,
        sku: variant.sku,
        name: product.name,
        attributes: variant.attributes || {},
        quantity,
        unitPrice,
        discountAmount: 0,
        taxAmount: 0,
        rowTotal: 0,
        quantityFulfilled: 0,
        quantityRefunded: 0,
        metadata: {
          isCustom: false,
          productName: product.name,
          variantLabel,
          productImage,
          originalUnitPrice: catalogUnitPrice,
          priceOverridden: hasCustomPrice,
          weightKg: unitWeightKg,
          ...(hasCustomPrice ? { customUnitPrice: unitPrice } : {}),
        },
        _taxKey: `${productId}:${resolvedVariantId === productId ? '' : resolvedVariantId}`,
        _inventoryVariantId: resolvedVariantId,
        _isCustom: false,
      });
    }

    const taxCalculation = await this.taxCalculationService.calculate(
      taxCalculationItems,
      {
        country: dto.billingAddress.country,
        region: dto.billingAddress.state,
        currency,
      },
      false,
    );

    const itemTaxMap = new Map<string, number>();
    for (const taxItem of taxCalculation.items) {
      const key = `${taxItem.productId}:${taxItem.variantId || ''}`;
      itemTaxMap.set(key, taxItem.taxAmount);
    }

    for (const row of orderItemsData) {
      const taxAmount = itemTaxMap.get(row._taxKey) || 0;
      row.taxAmount = taxAmount;
      row.rowTotal =
        row.unitPrice * row.quantity - row.discountAmount + taxAmount;
      delete row._taxKey;
    }

    const subtotal = orderItemsData.reduce(
      (sum, row) => sum + Number(row.unitPrice) * row.quantity,
      0,
    );
    const discountTotal = Math.min(
      Math.max(0, Number(dto.customDiscount) || 0),
      subtotal,
    );
    const shippingCity =
      dto.shippingAddress?.city?.trim() ||
      dto.billingAddress?.city?.trim() ||
      '';
    const shippingTotal =
      dto.customDeliveryFee !== undefined && dto.customDeliveryFee !== null
        ? Math.max(0, Number(dto.customDeliveryFee))
        : calculateShippingFee(shippingCity, totalWeightKg);
    const taxTotal = taxCalculation.taxTotal || 0;
    const grandTotal = Math.max(
      0,
      subtotal - discountTotal + shippingTotal + taxTotal,
    );

    return {
      orderItemsData,
      taxCalculationItems,
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
      currency,
      totalWeightKg,
    };
  }

  private buildManualOverridesMetadata(
    dto: CreateManualOrderDto,
    totalWeightKg: number,
    shippingTotal: number,
  ) {
    return {
      customDeliveryFee:
        dto.customDeliveryFee !== undefined && dto.customDeliveryFee !== null
          ? Number(dto.customDeliveryFee)
          : null,
      calculatedDeliveryFee: shippingTotal,
      totalWeightKg,
      customDiscount:
        dto.customDiscount !== undefined && dto.customDiscount !== null
          ? Number(dto.customDiscount)
          : null,
      itemPriceOverrides: dto.items
        .filter(
          (i) =>
            !isManualCustomItem(i) &&
            i.customUnitPrice !== undefined &&
            i.customUnitPrice !== null,
        )
        .map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? null,
          customUnitPrice: Number(i.customUnitPrice),
        })),
      customItems: dto.items
        .filter((i) => isManualCustomItem(i))
        .map((i) => ({
          title: i.title,
          unitPrice: Number(i.unitPrice),
          quantity: i.quantity,
          weightKg:
            i.weight !== undefined && i.weight !== null
              ? Number(i.weight)
              : DEFAULT_SHIPPING_WEIGHT_KG,
        })),
    };
  }

  private buildWhatsappConfirmationPayload(params: {
    orderNumber: string;
    customerName: string | null;
    customerPhone: string;
    shippingCity: string;
    paymentMethod: string | null;
    currency: string;
    subtotal: number;
    shippingTotal: number;
    discountTotal: number;
    grandTotal: number;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
  }) {
    const lines = params.items.map(
      (item) =>
        `• ${item.name} x${item.quantity} @ ${params.currency} ${item.unitPrice.toFixed(2)}`,
    );
    const text = [
      `SM Nimco order confirmation`,
      `Order: ${params.orderNumber}`,
      params.customerName ? `Customer: ${params.customerName}` : null,
      params.customerPhone ? `Phone: ${params.customerPhone}` : null,
      params.shippingCity ? `City: ${params.shippingCity}` : null,
      params.paymentMethod
        ? `Payment: ${params.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'COD'}`
        : null,
      '',
      'Items:',
      ...lines,
      '',
      `Subtotal: ${params.currency} ${params.subtotal.toFixed(2)}`,
      `Delivery: ${params.currency} ${params.shippingTotal.toFixed(2)}`,
      params.discountTotal > 0
        ? `Discount: ${params.currency} ${params.discountTotal.toFixed(2)}`
        : null,
      `Grand total: ${params.currency} ${params.grandTotal.toFixed(2)}`,
    ]
      .filter((line) => line != null)
      .join('\n');

    return {
      channel: 'whatsapp',
      phone: params.customerPhone || null,
      messageText: text,
      generatedAt: new Date().toISOString(),
    };
  }

  private stripTransientItemFields(row: Record<string, unknown>) {
    const {
      _inventoryVariantId: _ignoredInventoryVariantId,
      _taxKey: _ignoredTaxKey,
      _isCustom: _ignoredIsCustom,
      ...persistable
    } = row;
    void _ignoredInventoryVariantId;
    void _ignoredTaxKey;
    void _ignoredIsCustom;
    return persistable;
  }

  /**
   * Create order data for admin manual orders (no cart).
   * Auto-calculates Karachi/outstation delivery from weight unless overridden.
   */
  async createManualOrderData(
    dto: CreateManualOrderDto,
    requestMetadata?: {
      ipAddress?: string;
      userAgent?: string;
      adminUserId?: string;
    },
  ): Promise<{
    orderData: any;
    orderItemsData: any[];
    reservationIds: string[];
    taxCalculationItems: TaxCalculationItem[];
  }> {
    const {
      orderItemsData,
      taxCalculationItems,
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
      currency,
      totalWeightKg,
    } = await this.resolveManualOrderLines(dto);

    const orderNumber = await this.generateOrderNumber();
    const reservationIds: string[] = [];
    const paymentMethod = dto.paymentMethod ?? 'cod';
    const sendWhatsapp = dto.sendWhatsappConfirmation !== false;
    const customerPhone =
      dto.shippingAddress?.phone?.trim() ||
      dto.billingAddress?.phone?.trim() ||
      '';
    const shippingCity = dto.shippingAddress?.city?.trim() || '';

    const whatsappConfirmationPayload = sendWhatsapp
      ? this.buildWhatsappConfirmationPayload({
          orderNumber,
          customerName: dto.customerName || null,
          customerPhone,
          shippingCity,
          paymentMethod,
          currency,
          subtotal,
          shippingTotal,
          discountTotal,
          grandTotal,
          items: orderItemsData.map((row) => ({
            name: String(row.name),
            quantity: Number(row.quantity),
            unitPrice: Number(row.unitPrice),
          })),
        })
      : null;

    const orderData: any = {
      orderNumber,
      customerId: dto.customerId || null,
      customerGroupId: dto.customerGroupId || null,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      customerEmail: dto.customerEmail,
      customerName: dto.customerName || null,
      billingAddress: dto.billingAddress as any,
      shippingAddress: dto.shippingAddress as any,
      currency,
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
      appliedPriceRules: [] as any,
      ipAddress: requestMetadata?.ipAddress || null,
      userAgent: requestMetadata?.userAgent || null,
      notes: dto.notes || null,
      metadata: {
        source: ORDER_SOURCE_ADMIN_MANUAL,
        createdByAdmin: true,
        paymentMethod,
        totalWeightKg,
        ...(requestMetadata?.adminUserId
          ? { createdByAdminUserId: requestMetadata.adminUserId }
          : {}),
        overrides: this.buildManualOverridesMetadata(
          dto,
          totalWeightKg,
          shippingTotal,
        ),
        ...(whatsappConfirmationPayload
          ? {
              whatsappConfirmationPayload,
              whatsappConfirmationRequested: true,
            }
          : { whatsappConfirmationRequested: false }),
      },
      items: {
        create: orderItemsData.map((row) =>
          this.stripTransientItemFields(row as Record<string, unknown>),
        ),
      },
    };

    return {
      orderData,
      orderItemsData: orderItemsData.map((row) => ({
        ...row,
        inventoryVariantId: (row as { _inventoryVariantId?: string | null })
          ._inventoryVariantId,
        isCustom: (row as { _isCustom?: boolean })._isCustom === true,
      })),
      reservationIds,
      taxCalculationItems,
    };
  }

  /**
   * Build update payload for an existing manual order (keeps order number / status).
   */
  async buildManualOrderUpdateData(
    dto: CreateManualOrderDto,
    existingMetadata: Record<string, unknown> | null | undefined,
    requestMetadata?: {
      ipAddress?: string;
      userAgent?: string;
      adminUserId?: string;
      orderNumber?: string;
    },
  ): Promise<{
    orderUpdateData: Record<string, unknown>;
    orderItemsData: any[];
    taxCalculationItems: TaxCalculationItem[];
  }> {
    const {
      orderItemsData,
      taxCalculationItems,
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
      currency,
      totalWeightKg,
    } = await this.resolveManualOrderLines(dto);

    const priorMeta =
      existingMetadata &&
      typeof existingMetadata === 'object' &&
      !Array.isArray(existingMetadata)
        ? { ...existingMetadata }
        : {};

    const paymentMethod =
      dto.paymentMethod ??
      (typeof priorMeta.paymentMethod === 'string'
        ? priorMeta.paymentMethod
        : 'cod');
    const sendWhatsapp = dto.sendWhatsappConfirmation !== false;
    const customerPhone =
      dto.shippingAddress?.phone?.trim() ||
      dto.billingAddress?.phone?.trim() ||
      '';
    const shippingCity = dto.shippingAddress?.city?.trim() || '';
    const orderNumber = requestMetadata?.orderNumber?.trim() || 'ORDER';

    const whatsappConfirmationPayload = sendWhatsapp
      ? this.buildWhatsappConfirmationPayload({
          orderNumber,
          customerName: dto.customerName || null,
          customerPhone,
          shippingCity,
          paymentMethod,
          currency,
          subtotal,
          shippingTotal,
          discountTotal,
          grandTotal,
          items: orderItemsData.map((row) => ({
            name: String(row.name),
            quantity: Number(row.quantity),
            unitPrice: Number(row.unitPrice),
          })),
        })
      : null;

    const orderUpdateData: Record<string, unknown> = {
      customerId: dto.customerId || null,
      customerGroupId: dto.customerGroupId || null,
      customerEmail: dto.customerEmail,
      customerName: dto.customerName || null,
      billingAddress: dto.billingAddress as any,
      shippingAddress: dto.shippingAddress as any,
      currency,
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
      notes: dto.notes || null,
      ...(requestMetadata?.ipAddress
        ? { ipAddress: requestMetadata.ipAddress }
        : {}),
      ...(requestMetadata?.userAgent
        ? { userAgent: requestMetadata.userAgent }
        : {}),
      metadata: {
        ...priorMeta,
        source: ORDER_SOURCE_ADMIN_MANUAL,
        createdByAdmin: true,
        paymentMethod,
        totalWeightKg,
        ...(requestMetadata?.adminUserId
          ? { updatedByAdminUserId: requestMetadata.adminUserId }
          : {}),
        overrides: this.buildManualOverridesMetadata(
          dto,
          totalWeightKg,
          shippingTotal,
        ),
        ...(whatsappConfirmationPayload
          ? {
              whatsappConfirmationPayload,
              whatsappConfirmationRequested: true,
            }
          : { whatsappConfirmationRequested: false }),
      },
    };

    return {
      orderUpdateData,
      orderItemsData: orderItemsData.map((row) => ({
        ...row,
        inventoryVariantId: (row as { _inventoryVariantId?: string | null })
          ._inventoryVariantId,
        isCustom: (row as { _isCustom?: boolean })._isCustom === true,
      })),
      taxCalculationItems,
    };
  }
}
