import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import {
  CheckoutRedisService,
  CheckoutSession,
  CheckoutAddress,
  CheckoutShippingMethod,
} from './checkout.redis';
import { CheckoutTotalsService } from './checkout.totals';
import { CheckoutValidatorService } from './checkout.validator';
import { CartRedisService, Cart } from '../../cart/services/cart.redis';
import { CartService } from '../../cart/services/cart.service';
import { OrderService } from '../../order/services/order.service';
import { PaymentService } from '../../payment/services/payment.service';
import { VariantService } from '../../catalog/services/variant.service';
import { ProductService } from '../../catalog/services/product.service';
import { CustomerService } from '../../customer/services/customer.service';
import { CustomerGroupService } from '../../customer-group/services/customer-group.service';
import { StartCheckoutDto } from '../dto/start-checkout.dto';
import { UpdateAddressDto } from '../dto/address.dto';
import { ShippingMethodDto } from '../dto/shipping-method.dto';
import { ConfirmCheckoutDto } from '../dto/confirm-checkout.dto';
import { UpdateCheckoutItemDto } from '../dto/update-checkout-item.dto';
import { SetGuestCustomerDto } from '../dto/set-guest-customer.dto';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import {
  CheckoutStartedEvent,
  CheckoutUpdatedEvent,
  CheckoutCompletedEvent,
} from '../events/checkout.events';
import { PaymentIntentCreatedEvent } from '../events/checkout.events';
import { CapiService } from '../../common/services/capi.service';
import { buildCapiUserData } from '../../common/utils/capi-request.util';
import { resolveMetaCapiClient } from '../../common/utils/meta-capi-client.util';
import { APP_CURRENCY } from '../../common/currency';
import { StoreSettingsService } from '../../store-settings/services/store-settings.service';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private readonly defaultMinimumOrderValue = 800;

  constructor(
    private readonly checkoutRedis: CheckoutRedisService,
    private readonly checkoutTotals: CheckoutTotalsService,
    private readonly checkoutValidator: CheckoutValidatorService,
    private readonly cartRedis: CartRedisService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly variantService: VariantService,
    private readonly productService: ProductService,
    private readonly customerService: CustomerService,
    private readonly customerGroupService: CustomerGroupService,
    private readonly eventEmitter: EventEmitter2,
    private readonly capiService: CapiService,
    private readonly storeSettingsService: StoreSettingsService,
  ) {}

  /**
   * Keep the cart (and its stock reservations) aligned with checkout line edits.
   * Orders are created from the cart, so checkout qty changes must not drift.
   */
  private async syncCartItemWithCheckout(
    cartId: string,
    variantId: string,
    quantity: number,
  ): Promise<string | undefined> {
    if (quantity === 0) {
      await this.cartService.removeCartItem(cartId, variantId);
      return undefined;
    }

    const cart = await this.cartService.updateCartItem(cartId, variantId, {
      quantity,
    });
    return cart.items.find((item) => item.variantId === variantId)
      ?.reservationId;
  }

  /**
   * Final pre-order guard: force cart quantities/reservations to match checkout.
   */
  private async ensureCartMatchesCheckout(
    checkout: CheckoutSession,
  ): Promise<Cart> {
    const cart = await this.cartRedis.getCart(checkout.cartId);
    if (!cart) {
      throw new NotFoundException(`Cart ${checkout.cartId} not found`);
    }

    const checkoutVariantIds = new Set(
      checkout.items.map((item) => item.variantId),
    );

    // Remove cart lines that are no longer in checkout (releases reservations).
    for (const cartItem of [...cart.items]) {
      if (!checkoutVariantIds.has(cartItem.variantId)) {
        await this.cartService.removeCartItem(
          checkout.cartId,
          cartItem.variantId,
        );
      }
    }

    // Sync quantities for every checkout line (re-reserves stock as needed).
    for (const item of checkout.items) {
      const reservationId = await this.syncCartItemWithCheckout(
        checkout.cartId,
        item.variantId,
        item.quantity,
      );
      item.reservationId = reservationId ?? item.reservationId;
    }

    const synced = await this.cartRedis.getCart(checkout.cartId);
    if (!synced || synced.items.length === 0) {
      throw new BadRequestException('Cannot create order from empty cart');
    }

    // Fail closed if any quantity still diverges.
    for (const item of checkout.items) {
      const cartItem = synced.items.find((c) => c.variantId === item.variantId);
      if (!cartItem || cartItem.quantity !== item.quantity) {
        throw new BadRequestException(
          'Cart is out of sync with checkout. Please refresh and try again.',
        );
      }
    }

    return synced;
  }

  private async assertMinimumOrderAmount(subtotal: number): Promise<void> {
    const settings = await this.storeSettingsService.getPublicOrderSettings();
    const minimumOrderValue =
      settings.minimumOrderAmount ?? this.defaultMinimumOrderValue;
    if (subtotal >= minimumOrderValue) {
      return;
    }

    const freeDeliveryNote =
      settings.freeDeliveryThreshold > 0
        ? ` Note: Shopping of Rs. ${settings.freeDeliveryThreshold} or more qualifies for Free Delivery!`
        : '';

    throw new BadRequestException(
      `A minimum order value of Rs. ${minimumOrderValue} is required to place an order. Please add more items to your cart.${freeDeliveryNote}`,
    );
  }

  /**
   * Start checkout from cart
   * Creates or fetches customer and assigns customer group
   */
  async startCheckout(
    startCheckoutDto: StartCheckoutDto,
    req?: Request,
  ): Promise<{ checkoutId: string }> {
    const { cartId, customerEmail, customerId } = startCheckoutDto;

    // Load cart from Redis
    const cart = await this.cartRedis.getCart(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    // Validate cart has items
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot start checkout with empty cart');
    }

    // Resolve customer and customer group
    let resolvedCustomerId: string | undefined;
    let resolvedCustomerGroupId: string | undefined;
    let resolvedCustomerEmail: string | undefined;
    let resolvedCustomerPhone: string | undefined;

    if (customerId) {
      // If customer ID is provided, fetch customer to get group
      try {
        const customer = await this.customerService.findOne(customerId);
        resolvedCustomerId = customer.id;
        resolvedCustomerGroupId = customer.customerGroupId;
        resolvedCustomerEmail = customer.email;
        resolvedCustomerPhone = customer.phone ?? undefined;
        this.logger.log(
          `Using existing customer: ${resolvedCustomerId} with group: ${resolvedCustomerGroupId}`,
        );
      } catch (error) {
        this.logger.warn(`Failed to fetch customer ${customerId}:`, error);
        throw new NotFoundException(`Customer ${customerId} not found`);
      }
    } else if (customerEmail) {
      // Create or fetch customer by email (guest if doesn't exist)
      const customer = await this.customerService.getOrCreateByEmail(
        customerEmail,
        true,
      );
      resolvedCustomerId = customer.id;
      resolvedCustomerGroupId = customer.customerGroupId;
      resolvedCustomerEmail = customer.email;
      resolvedCustomerPhone = customer.phone ?? undefined;
      this.logger.log(
        `Resolved customer: ${resolvedCustomerId} (${customerEmail}) with group: ${resolvedCustomerGroupId}`,
      );
    } else {
      // No customer provided - this should not happen in normal flow
      // But we'll create a guest customer with a placeholder email
      // In production, you might want to require email at checkout start
      this.logger.warn(
        'No customer email or ID provided at checkout start. Customer will be required at confirmation.',
      );
    }

    // If we still don't have a customer group, use default
    if (!resolvedCustomerGroupId) {
      try {
        const defaultGroup = await this.customerGroupService.findDefault();
        resolvedCustomerGroupId = defaultGroup.id;
        this.logger.log(
          `Using default customer group: ${resolvedCustomerGroupId}`,
        );
      } catch (error) {
        this.logger.warn('Failed to get default customer group:', error);
        // Continue without group - totals calculation will handle gracefully
      }
    }

    // Create checkout session ID
    const checkoutId = randomUUID();

    // Convert cart items to checkout items (snapshot)
    const checkoutItems = cart.items.map((item) => ({
      variantId: item.variantId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
      attributes: item.attributes || {},
      reservationId: item.reservationId,
    }));

    // Create initial checkout session with customer context
    const initialCheckout: CheckoutSession = {
      id: checkoutId,
      cartId,
      items: checkoutItems,
      currency: cart.currency,
      status: 'pending',
      customerId: resolvedCustomerId,
      customerGroupId: resolvedCustomerGroupId,
      customerEmail: resolvedCustomerEmail,
      subtotal: 0,
      discountTotal: 0,
      shippingTotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
    };

    // Calculate initial totals with customer group context
    const initialTotals =
      await this.checkoutTotals.calculateTotals(initialCheckout);

    await this.assertMinimumOrderAmount(initialTotals.subtotal);

    // Create checkout session
    const checkout: Omit<
      CheckoutSession,
      'id' | 'createdAt' | 'updatedAt' | 'expiresAt'
    > = {
      cartId,
      items: checkoutItems,
      currency: cart.currency,
      status: 'pending',
      customerId: resolvedCustomerId,
      customerGroupId: resolvedCustomerGroupId,
      customerEmail: resolvedCustomerEmail,
      ...initialTotals,
    };

    const session = await this.checkoutRedis.createCheckout(
      checkoutId,
      checkout,
    );

    // Emit event
    this.eventEmitter.emit(
      'checkout.started',
      new CheckoutStartedEvent(checkoutId, cartId),
    );

    this.logger.log(
      `Checkout started: ${checkoutId} from cart ${cartId} for customer ${resolvedCustomerId || 'pending'}`,
    );

    const meta = resolveMetaCapiClient(startCheckoutDto);
    const eventId = meta.eventId?.trim() || `begin_checkout_${checkoutId}`;
    try {
      const enriched = await this.getCheckout(checkoutId);
      type EnrichedLine = (typeof enriched.items)[number] & {
        sku?: string;
      };
      const lines = enriched.items as EnrichedLine[];
      const contentIds = lines
        .map((i) => i.sku?.trim())
        .filter((s): s is string => Boolean(s));
      const contents = lines
        .filter((i) => i.sku?.trim())
        .map((i) => ({
          id: i.sku!.trim(),
          quantity: i.quantity,
          item_price: Number(i.price),
        }));
      const numItems = lines.reduce((sum, i) => sum + i.quantity, 0);
      this.capiService.enqueue(
        'InitiateCheckout',
        eventId,
        buildCapiUserData(meta, req, {
          email: resolvedCustomerEmail || customerEmail,
          phone: resolvedCustomerPhone,
          external_id: resolvedCustomerId,
        }),
        {
          content_ids: contentIds,
          contents,
          value: Number(enriched.grandTotal) || Number(enriched.subtotal) || 0,
          currency: enriched.currency || APP_CURRENCY,
          num_items: numItems,
          content_type: 'product',
        },
      );
    } catch (error) {
      this.logger.warn(
        `Meta CAPI InitiateCheckout skipped for ${checkoutId}:`,
        error,
      );
    }

    return { checkoutId };
  }

  /**
   * Get checkout session
   */
  async getCheckout(checkoutId: string): Promise<
    CheckoutSession & {
      items: Array<
        CheckoutSession['items'][0] & {
          productName?: string;
          productImage?: string;
          variantName?: string;
          variantAttributes?: Record<string, unknown>;
          /** Catalog retailer id for Meta (variant.sku or product.sku). */
          sku?: string;
          productSku?: string;
        }
      >;
    }
  > {
    const checkout = await this.checkoutRedis.getCheckout(checkoutId);
    if (!checkout) {
      throw new NotFoundException(`Checkout ${checkoutId} not found`);
    }

    // Extend TTL on access
    await this.checkoutRedis.extendCheckoutTTL(checkoutId);

    // Enrich items with product details and variant attributes (size, color, etc.)
    // Use findOneOrForSimpleProduct so both configurable and simple products get product name
    const enrichedItems = await Promise.all(
      checkout.items.map(async (item) => {
        try {
          const variant = await this.variantService.findOneOrForSimpleProduct(
            item.variantId,
            item.productId,
          );
          const imgs = variant.images as
            | { isPrimary?: boolean; url: string }[]
            | undefined;
          const primaryImage = imgs?.find((img) => img.isPrimary) || imgs?.[0];
          const variantObj = variant as {
            product?: { name?: unknown };
            name?: unknown;
          };
          let productName: string | null = null;
          if (variantObj.product?.name != null) {
            productName = String(variantObj.product.name);
          } else if (variantObj.name != null) {
            productName = String(variantObj.name);
          }
          if (!productName || productName.trim() === '') {
            try {
              const product = await this.productService.findOneById(
                item.productId,
              );
              productName = product?.name != null ? String(product.name) : null;
            } catch {
              // keep null
            }
          }
          const variantAttributes =
            variant.attributes &&
            typeof variant.attributes === 'object' &&
            !Array.isArray(variant.attributes)
              ? (variant.attributes as Record<string, unknown>)
              : (item.attributes ?? {});

          const variantSku =
            variant.sku != null ? String(variant.sku).trim() : '';
          const productSkuRaw =
            (variant as { product?: { sku?: unknown } }).product?.sku != null
              ? String(
                  (variant as { product?: { sku?: unknown } }).product?.sku,
                ).trim()
              : '';

          return {
            ...item,
            productName: productName?.trim() || 'Product',
            variantName:
              variant.name != null ? String(variant.name) : undefined,
            productImage: primaryImage?.url,
            variantAttributes,
            sku: variantSku || productSkuRaw || undefined,
            productSku: productSkuRaw || variantSku || undefined,
          };
        } catch (error) {
          this.logger.warn(
            `Failed to fetch product details for variant ${item.variantId}:`,
            error,
          );
          let fallbackName = 'Product';
          let fallbackSku: string | undefined;
          try {
            const product = await this.productService.findOneById(
              item.productId,
            );
            if (product?.name) fallbackName = String(product.name);
            if (product?.sku) fallbackSku = String(product.sku);
          } catch {
            // ignore
          }
          return {
            ...item,
            productName: fallbackName,
            variantAttributes: item.attributes ?? {},
            sku: fallbackSku,
            productSku: fallbackSku,
          };
        }
      }),
    );

    return {
      ...checkout,
      items: enrichedItems,
    };
  }

  /**
   * Update addresses
   * Triggers recalculation of pricing, tax, and shipping with customer group context
   */
  async updateAddresses(
    checkoutId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<CheckoutSession> {
    const checkout = await this.getCheckout(checkoutId);

    // Validate checkout state
    this.checkoutValidator.validateCheckoutState(checkout, ['pending']);

    // Ensure customer group is loaded (for totals). Guest checkout may not have customer until confirm.
    await this.ensureCustomerGroup(checkout);

    // Update addresses
    if (updateAddressDto.billingAddress) {
      checkout.billingAddress = updateAddressDto.billingAddress;
    }

    if (updateAddressDto.shippingAddress) {
      checkout.shippingAddress = updateAddressDto.shippingAddress;
    }

    // Recalculate totals (tax, shipping, and pricing may change with address and customer group)
    const updated = await this.checkoutTotals.recalculateAndUpdate(checkout);

    // Save updated checkout
    await this.checkoutRedis.updateCheckout(updated);

    // Emit event
    this.eventEmitter.emit(
      'checkout.updated',
      new CheckoutUpdatedEvent(checkoutId),
    );

    this.logger.log(`Addresses updated for checkout ${checkoutId}`);
    return updated;
  }

  /**
   * Update shipping method
   * Recalculates totals with customer group context (may affect shipping discounts)
   */
  async updateShippingMethod(
    checkoutId: string,
    shippingMethodDto: ShippingMethodDto,
  ): Promise<CheckoutSession> {
    const checkout = await this.getCheckout(checkoutId);

    // Validate checkout state
    this.checkoutValidator.validateCheckoutState(checkout, ['pending']);

    // Ensure customer group is loaded
    await this.ensureCustomerGroup(checkout);

    // Update shipping method
    const shippingMethod: CheckoutShippingMethod = {
      methodId: shippingMethodDto.methodId,
      methodName: shippingMethodDto.methodName,
      cost: Number(shippingMethodDto.cost),
      currency: shippingMethodDto.currency,
      estimatedDays: shippingMethodDto.estimatedDays,
    };

    checkout.shippingMethod = shippingMethod;

    // Recalculate totals with customer group context
    const updated = await this.checkoutTotals.recalculateAndUpdate(checkout);

    // Save updated checkout
    await this.checkoutRedis.updateCheckout(updated);

    // Emit event
    this.eventEmitter.emit(
      'checkout.updated',
      new CheckoutUpdatedEvent(checkoutId),
    );

    this.logger.log(`Shipping method updated for checkout ${checkoutId}`);
    return updated;
  }

  /**
   * Set guest customer by email (get-or-create). Updates session and recalculates totals.
   */
  async setGuestCustomer(
    checkoutId: string,
    dto: SetGuestCustomerDto,
  ): Promise<CheckoutSession> {
    const checkout = await this.checkoutRedis.getCheckout(checkoutId);
    if (!checkout) {
      throw new NotFoundException(`Checkout ${checkoutId} not found`);
    }
    this.checkoutValidator.validateCheckoutState(checkout, ['pending']);

    const customer = await this.customerService.getOrCreateByEmail(
      dto.customerEmail.trim().toLowerCase(),
      true,
    );
    checkout.customerId = customer.id;
    checkout.customerGroupId = customer.customerGroupId;
    checkout.customerEmail = customer.email;

    const updated = await this.checkoutTotals.recalculateAndUpdate(checkout);
    await this.checkoutRedis.updateCheckout(updated);
    this.eventEmitter.emit(
      'checkout.updated',
      new CheckoutUpdatedEvent(checkoutId),
    );
    this.logger.log(
      `Guest customer set for checkout ${checkoutId}: ${customer.id}`,
    );
    return updated;
  }

  /**
   * Apply or clear coupon code on checkout. Recalculates totals.
   */
  async applyCoupon(
    checkoutId: string,
    dto: ApplyCouponDto,
  ): Promise<CheckoutSession> {
    const checkout = await this.checkoutRedis.getCheckout(checkoutId);
    if (!checkout) {
      throw new NotFoundException(`Checkout ${checkoutId} not found`);
    }
    this.checkoutValidator.validateCheckoutState(checkout, ['pending']);

    checkout.couponCode = dto.couponCode?.trim() || undefined;

    const updated = await this.checkoutTotals.recalculateAndUpdate(checkout);
    await this.checkoutRedis.updateCheckout(updated);
    this.eventEmitter.emit(
      'checkout.updated',
      new CheckoutUpdatedEvent(checkoutId),
    );
    this.logger.log(
      `Coupon ${checkoutId}: ${updated.couponCode ? `applied "${updated.couponCode}"` : 'cleared'}`,
    );
    // Return same enriched payload as GET /checkout (totals read back from store).
    return this.getCheckout(checkoutId);
  }

  /**
   * Update checkout item quantity (or remove if quantity is 0)
   */
  async updateCheckoutItem(
    checkoutId: string,
    variantId: string,
    updateDto: UpdateCheckoutItemDto,
  ): Promise<
    CheckoutSession & {
      items: Array<
        CheckoutSession['items'][0] & {
          productName?: string;
          productImage?: string;
          variantName?: string;
        }
      >;
    }
  > {
    const rawCheckout = await this.checkoutRedis.getCheckout(checkoutId);
    if (!rawCheckout) {
      throw new NotFoundException(`Checkout ${checkoutId} not found`);
    }

    this.checkoutValidator.validateCheckoutState(rawCheckout, ['pending']);

    const itemIndex = rawCheckout.items.findIndex(
      (item) => item.variantId === variantId,
    );
    if (itemIndex === -1) {
      throw new NotFoundException(
        `Item with variant ${variantId} not found in checkout`,
      );
    }

    const { quantity } = updateDto;

    // Sync cart + reservations first so order creation cannot drift from checkout UI.
    const reservationId = await this.syncCartItemWithCheckout(
      rawCheckout.cartId,
      variantId,
      quantity,
    );

    if (quantity === 0) {
      rawCheckout.items.splice(itemIndex, 1);
    } else {
      rawCheckout.items[itemIndex] = {
        ...rawCheckout.items[itemIndex],
        quantity,
        ...(reservationId !== undefined && { reservationId }),
      };
    }

    if (rawCheckout.items.length === 0) {
      throw new BadRequestException('Cannot leave checkout with no items');
    }

    const updated = await this.checkoutTotals.recalculateAndUpdate(rawCheckout);
    await this.checkoutRedis.updateCheckout(updated);

    this.eventEmitter.emit(
      'checkout.updated',
      new CheckoutUpdatedEvent(checkoutId),
    );
    this.logger.log(
      `Checkout ${checkoutId} item ${variantId} quantity updated to ${quantity}`,
    );

    return this.getCheckout(checkoutId);
  }

  /**
   * Confirm checkout and create order
   * Ensures customer context is set, snapshots customer group and addresses
   */
  async confirmCheckout(
    checkoutId: string,
    confirmCheckoutDto: ConfirmCheckoutDto,
    req?: Request,
  ): Promise<{ orderId: string; orderNumber: string; paymentIntent?: any }> {
    const checkout = await this.getCheckout(checkoutId);

    // Resolve customer - prefer checkout session customer, then DTO, then create guest
    let customerId = checkout.customerId || confirmCheckoutDto.customerId;
    let customerGroupId =
      checkout.customerGroupId || confirmCheckoutDto.customerGroupId;
    const customerEmail = (
      confirmCheckoutDto.customerEmail ||
      checkout.customerEmail ||
      ''
    )
      .trim()
      .toLowerCase();

    if (!customerEmail) {
      throw new BadRequestException(
        'Customer email is required to confirm checkout',
      );
    }

    // Resolve customer if not already set
    if (!customerId) {
      // Create or fetch customer by email (guest if doesn't exist)
      const customer = await this.customerService.getOrCreateByEmail(
        customerEmail,
        true, // isGuest = true for checkout
      );
      customerId = customer.id;
      customerGroupId = customer.customerGroupId;
      this.logger.log(
        `Resolved customer: ${customerId} (${customerEmail}) with group: ${customerGroupId}`,
      );
    } else {
      // If customer ID exists, ensure we have the group
      if (!customerGroupId) {
        try {
          const customer = await this.customerService.findOne(customerId);
          customerGroupId = customer.customerGroupId;
          this.logger.log(
            `Loaded customer group ${customerGroupId} for customer ${customerId}`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to fetch customer ${customerId}, will use default group:`,
            error,
          );
        }
      }
    }

    // If we still don't have a group, use default
    if (!customerGroupId) {
      try {
        const defaultGroup = await this.customerGroupService.findDefault();
        customerGroupId = defaultGroup.id;
        this.logger.log(`Using default customer group: ${customerGroupId}`);
      } catch (error) {
        this.logger.warn('Failed to get default customer group:', error);
        throw new BadRequestException(
          'Unable to determine customer group for checkout',
        );
      }
    }

    // Update checkout with final customer information
    checkout.customerEmail = customerEmail;
    checkout.customerName = confirmCheckoutDto.customerName;
    checkout.customerId = customerId;
    checkout.customerGroupId = customerGroupId;

    // Recalculate totals with final customer group (may affect discounts, pricing, tax)
    const updated = await this.checkoutTotals.recalculateAndUpdate(checkout, {
      recordPromotionRedemptions: true,
    });
    await this.checkoutRedis.updateCheckout(updated);

    await this.assertMinimumOrderAmount(updated.subtotal);

    // Comprehensive validation
    await this.checkoutValidator.validateForConfirmation(updated);

    // Align cart + reservations with checkout before cart-backed order creation.
    await this.ensureCartMatchesCheckout(updated);
    await this.checkoutRedis.updateCheckout(updated);

    // Snapshot customer group for order (load full group details)
    let customerGroupSnapshot: {
      id: string;
      name: string;
      discountPercent: number | null;
      taxClassId: string | null;
    } | null = null;
    if (customerGroupId) {
      try {
        const customerGroup =
          await this.customerGroupService.findOne(customerGroupId);
        customerGroupSnapshot = {
          id: customerGroup.id,
          name: customerGroup.name,
          discountPercent: customerGroup.discountPercent,
          taxClassId: customerGroup.taxClassId,
        };
      } catch (error) {
        this.logger.warn(`Failed to load customer group snapshot:`, error);
      }
    }

    const checkoutLineItems = updated.items.map((item) => ({
      variantId: item.variantId,
      productId: item.productId,
      quantity: item.quantity,
      reservationId: item.reservationId,
    }));

    // Create order from checkout (snapshots customer group and addresses)
    const order = await this.orderService.createOrder(
      {
        cartId: checkout.cartId,
        customerEmail: customerEmail,
        customerName: confirmCheckoutDto.customerName,
        customerId: customerId,
        customerGroupId: customerGroupId, // Snapshot customer group ID
        billingAddress: updated.billingAddress!,
        shippingAddress: updated.shippingAddress!,
        totals: {
          subtotal: updated.subtotal,
          discountTotal: updated.discountTotal,
          shippingTotal: updated.shippingTotal,
          taxTotal: updated.taxTotal,
          grandTotal: updated.grandTotal,
        },
        notes: confirmCheckoutDto.notes,
        metadata: {
          ...confirmCheckoutDto.metadata,
          checkoutId: checkoutId,
          checkoutLineItems,
          customerGroupSnapshot, // Include group snapshot in metadata
          shippingMethod: updated.shippingMethod ?? null,
        },
      },
      {
        // Request metadata can be passed from controller
      },
    );

    const enrichReturnUrl = (rawUrl?: string): string | undefined => {
      if (!rawUrl) return undefined;
      try {
        const u = new URL(rawUrl);
        u.searchParams.set('orderId', order.id);
        u.searchParams.set('orderNumber', order.orderNumber);
        // Do not put customer email in the return URL — Meta Pixel PageView
        // captures the page URL and flags unhashed PII (Business Tools Terms).
        return u.toString();
      } catch {
        return rawUrl;
      }
    };

    // Create payment intent using PaymentService
    const paymentIntent = await this.paymentService.createIntent(
      order.id,
      confirmCheckoutDto.paymentMethodCode,
      enrichReturnUrl(confirmCheckoutDto.returnUrl),
      enrichReturnUrl(confirmCheckoutDto.cancelUrl),
    );

    // Emit payment intent created event
    this.eventEmitter.emit(
      'payment.intent.created',
      new PaymentIntentCreatedEvent(
        paymentIntent.paymentId,
        order.id,
        Number(updated.grandTotal),
        updated.currency,
      ),
    );

    // Mark checkout as completed
    updated.status = 'completed';
    await this.checkoutRedis.updateCheckout(updated);

    // Emit checkout completed event
    this.eventEmitter.emit(
      'checkout.completed',
      new CheckoutCompletedEvent(
        checkoutId,
        order.id,
        order.orderNumber,
        paymentIntent.paymentId,
      ),
    );

    this.logger.log(
      `Checkout ${checkoutId} completed. Order: ${order.orderNumber} (${order.id}), Payment: ${paymentIntent.paymentId}`,
    );

    const meta = resolveMetaCapiClient(confirmCheckoutDto);
    const purchaseEventId =
      meta.eventId?.trim() || `purchase_${order.orderNumber}`;
    const phone =
      updated.shippingAddress?.phone || updated.billingAddress?.phone || null;
    const contentIds = (order.items ?? [])
      .map((i) => i.sku?.trim())
      .filter((s): s is string => Boolean(s));
    const contents = (order.items ?? [])
      .filter((i) => i.sku?.trim())
      .map((i) => ({
        id: i.sku.trim(),
        quantity: i.quantity,
        item_price: Number(i.unitPrice),
      }));
    const numItems = (order.items ?? []).reduce(
      (sum, i) => sum + i.quantity,
      0,
    );
    this.capiService.enqueue(
      'Purchase',
      purchaseEventId,
      buildCapiUserData(meta, req, {
        email: customerEmail,
        phone,
      }),
      {
        content_ids: contentIds,
        contents,
        value: Number(updated.grandTotal),
        currency: updated.currency || APP_CURRENCY,
        num_items: numItems,
        order_id: order.orderNumber,
        content_type: 'product',
      },
    );

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentIntent: {
        paymentId: paymentIntent.paymentId,
        gatewayTransactionId: paymentIntent.gatewayTransactionId,
        flowType: paymentIntent.flowType,
        // Storefront lifecycle alias (client_side | redirect | hosted | offline).
        type: paymentIntent.type,
        clientSecret: paymentIntent.clientSecret,
        redirectUrl: paymentIntent.redirectUrl,
      },
    };
  }

  /**
   * Ensure customer group is loaded for checkout
   * Helper method to guarantee customer group context
   */
  private async ensureCustomerGroup(checkout: CheckoutSession): Promise<void> {
    // If customer exists but group is missing, load it
    if (checkout.customerId && !checkout.customerGroupId) {
      try {
        const customer = await this.customerService.findOne(
          checkout.customerId,
        );
        checkout.customerGroupId = customer.customerGroupId;
        this.logger.log(
          `Loaded customer group ${customer.customerGroupId} for customer ${checkout.customerId}`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to load customer group for ${checkout.customerId}:`,
          error,
        );
      }
    }

    // If we still don't have a group, use default
    if (!checkout.customerGroupId) {
      try {
        const defaultGroup = await this.customerGroupService.findDefault();
        checkout.customerGroupId = defaultGroup.id;
        this.logger.log(`Using default customer group: ${defaultGroup.id}`);
      } catch (error) {
        this.logger.warn('Failed to get default customer group:', error);
        // Continue without group - totals calculation will handle gracefully
      }
    }
  }

  /**
   * Cancel checkout (cleanup)
   */
  async cancelCheckout(checkoutId: string, reason?: string): Promise<void> {
    const checkout = await this.checkoutRedis.getCheckout(checkoutId);
    if (!checkout) {
      return; // Already deleted
    }

    checkout.status = 'cancelled';
    await this.checkoutRedis.updateCheckout(checkout);

    // Delete after a short delay to allow event processing
    // In production, you might want to keep cancelled checkouts for audit
    setTimeout(async () => {
      await this.checkoutRedis.deleteCheckout(checkoutId);
    }, 5000);

    this.logger.log(
      `Checkout ${checkoutId} cancelled: ${reason || 'No reason provided'}`,
    );
  }
}
