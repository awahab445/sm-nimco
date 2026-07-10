import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import {
  CartRedisService,
  Cart,
  CartItem,
  CartBundleGroup,
} from './cart.redis';
import { VariantService } from '../../catalog/services/variant.service';
import { ReservationService } from '../../inventory/services/reservation.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ProductService } from '../../catalog/services/product.service';
import { PromotionsService } from '../../promotions/services/promotions.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { APP_CURRENCY } from '../../common/currency';
import {
  CartCreatedEvent,
  CartItemAddedEvent,
  CartItemRemovedEvent,
  CartExpiredEvent,
} from '../events/cart.events';
import { InsufficientStockException } from '../errors/insufficient-stock.exception';
import { AddBundleToCartDto } from '../dto/add-bundle-to-cart.dto';
import { UpdateBundleCartDto } from '../dto/update-bundle-cart.dto';
import { BundleDealService } from '../../bundle-deals/services/bundle-deal.service';
import { BundleDealPricingService } from '../../bundle-deals/services/bundle-deal-pricing.service';
import { BundleDealItemDto } from '../../bundle-deals/dto/bundle-deal-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly CART_RESERVATION_EXPIRY_MINUTES = 30; // Match cart TTL

  constructor(
    private readonly cartRedis: CartRedisService,
    private readonly variantService: VariantService,
    private readonly productService: ProductService,
    private readonly reservationService: ReservationService,
    private readonly inventoryService: InventoryService,
    private readonly promotionsService: PromotionsService,
    private readonly bundleDealService: BundleDealService,
    private readonly bundleDealPricingService: BundleDealPricingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new cart
   */
  async createCart(currency?: string): Promise<{ cartId: string }> {
    const cartId = randomUUID();
    const cartCurrency = currency || APP_CURRENCY;

    await this.cartRedis.createCart(cartId, cartCurrency);

    // Emit event
    this.eventEmitter.emit('cart.created', new CartCreatedEvent(cartId));

    this.logger.log(`Cart created: ${cartId}`);
    return { cartId };
  }

  /**
   * Get cart by ID with enriched item details (product name, variant attributes, image)
   */
  async getCart(cartId: string): Promise<
    Cart & {
      items: Array<
        CartItem & {
          productName?: string;
          variantName?: string;
          variantAttributes?: Record<string, unknown>;
          productImage?: string;
        }
      >;
      bundles?: Array<
        CartBundleGroup & { bundleGroupId: string; imageUrl?: string }
      >;
    }
  > {
    const cart = await this.cartRedis.getCart(cartId);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
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

          return {
            ...item,
            productName: productName?.trim() || 'Product',
            variantName:
              variant.name != null ? String(variant.name) : undefined,
            variantAttributes:
              Object.keys(variantAttributes).length > 0
                ? variantAttributes
                : undefined,
            productImage: primaryImage?.url,
          };
        } catch (error) {
          this.logger.warn(
            `Failed to enrich cart item ${item.variantId}:`,
            error,
          );
          let fallbackName: string = 'Product';
          try {
            const product = await this.productService.findOneById(
              item.productId,
            );
            if (product?.name) fallbackName = String(product.name);
          } catch {
            // ignore
          }
          return { ...item, productName: fallbackName };
        }
      }),
    );

    const visibleItems = enrichedItems.filter(
      (item) => !item.isBundleComponent,
    );
    const bundles = this.buildBundlesView(cart, enrichedItems);

    return { ...cart, items: visibleItems, bundles };
  }

  private buildBundlesView(
    cart: Cart,
    enrichedItems: Array<CartItem & { productName?: string }>,
  ): Array<CartBundleGroup & { bundleGroupId: string }> {
    if (!cart.bundleGroups) return [];

    return Object.entries(cart.bundleGroups).map(([bundleGroupId, group]) => ({
      bundleGroupId,
      ...group,
    }));
  }

  /** Placeholder reservation id for simple products (no variant = no inventory reservation). */
  private static SIMPLE_PRODUCT_RESERVATION_PREFIX = 'simple-';

  private isSimpleProductReservation(reservationId: string): boolean {
    return reservationId.startsWith(
      CartService.SIMPLE_PRODUCT_RESERVATION_PREFIX,
    );
  }

  private async assertSufficientStock(
    variantId: string,
    requestedQuantity: number,
  ): Promise<void> {
    const hasStock = await this.inventoryService.hasSufficientStock(
      variantId,
      requestedQuantity,
      'default-warehouse',
    );
    if (hasStock) return;

    const available = await this.inventoryService.getAvailableQuantity(
      variantId,
      'default-warehouse',
    );
    throw new InsufficientStockException(available);
  }

  /**
   * Add item to cart
   * Supports both configurable products (variantId) and simple products (variantId === productId, no variants).
   */
  async addItemToCart(
    cartId: string,
    addToCartDto: AddToCartDto,
  ): Promise<Cart> {
    const { productId, variantId, quantity } = addToCartDto;

    // Get or create cart
    let cart = await this.cartRedis.getCart(cartId);
    if (!cart) {
      cart = await this.cartRedis.createCart(cartId, APP_CURRENCY);
    }

    // Fetch variant (or synthetic variant for simple product when variantId === productId)
    const variant = await this.variantService.findOneOrForSimpleProduct(
      variantId,
      productId,
    );
    const isSimpleProduct = variant.id === variant.productId;

    // Check if variant is already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.variantId === variantId && !item.isBundleComponent,
    );

    if (existingItemIndex >= 0) {
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      await this.assertSufficientStock(variantId, newQuantity);
      if (
        existingItem.reservationId &&
        !this.isSimpleProductReservation(existingItem.reservationId)
      ) {
        await this.reservationService.releaseStock({
          reservationId: existingItem.reservationId,
        });
      }

      const reservationId = (
        await this.reservationService.reserveStock({
          variantId,
          quantity: newQuantity,
          referenceType: 'cart',
          referenceId: cartId,
          expiresInMinutes: this.CART_RESERVATION_EXPIRY_MINUTES,
        })
      ).reservation.id;

      cart.items[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        reservationId,
      };
    } else {
      await this.assertSufficientStock(variantId, quantity);

      const reservationId = (
        await this.reservationService.reserveStock({
          variantId,
          quantity,
          referenceType: 'cart',
          referenceId: cartId,
          expiresInMinutes: this.CART_RESERVATION_EXPIRY_MINUTES,
        })
      ).reservation.id;

      const newItem: CartItem = {
        variantId,
        productId,
        quantity,
        price: Number(variant.price),
        currency: cart.currency,
        attributes: (variant.attributes &&
        typeof variant.attributes === 'object' &&
        !Array.isArray(variant.attributes)
          ? variant.attributes
          : {}) as Record<string, any>,
        reservationId,
        addedAt: new Date().toISOString(),
      };

      cart.items.push(newItem);
      this.eventEmitter.emit(
        'cart.item.added',
        new CartItemAddedEvent(cartId, variantId, quantity, reservationId),
      );
    }

    await this.cartRedis.updateCart(cart);
    await this.cartRedis.extendCartTTL(cartId);
    this.logger.log(
      `Item added to cart ${cartId}: variant ${variantId}, quantity ${quantity}`,
    );
    return cart;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    cartId: string,
    variantId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getCart(cartId);
    const itemIndex = cart.items.findIndex(
      (item) => item.variantId === variantId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Item with variant ${variantId} not found in cart`,
      );
    }

    const existingItem = cart.items[itemIndex];
    const { quantity: newQuantity } = updateDto;

    if (newQuantity === existingItem.quantity) {
      await this.cartRedis.extendCartTTL(cartId);
      return cart;
    }

    const isSimpleProduct = this.isSimpleProductReservation(
      existingItem.reservationId ?? '',
    );

    if (newQuantity > 0) {
      await this.assertSufficientStock(variantId, newQuantity);
    }
    if (existingItem.reservationId) {
      await this.reservationService.releaseStock({
        reservationId: existingItem.reservationId,
      });
    }

    const reservationId =
      newQuantity > 0
        ? (
            await this.reservationService.reserveStock({
              variantId,
              quantity: newQuantity,
              referenceType: 'cart',
              referenceId: cartId,
              expiresInMinutes: this.CART_RESERVATION_EXPIRY_MINUTES,
            })
          ).reservation.id
        : '';

    cart.items[itemIndex] = {
      ...existingItem,
      quantity: newQuantity,
      reservationId,
    };

    // Update cart and extend TTL
    await this.cartRedis.updateCart(cart);
    await this.cartRedis.extendCartTTL(cartId);

    this.logger.log(
      `Cart item updated in cart ${cartId}: variant ${variantId}, quantity ${newQuantity}`,
    );
    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(cartId: string, variantId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);
    const itemIndex = cart.items.findIndex(
      (item) => item.variantId === variantId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Item with variant ${variantId} not found in cart`,
      );
    }

    const item = cart.items[itemIndex];

    if (
      item.reservationId &&
      !this.isSimpleProductReservation(item.reservationId)
    ) {
      await this.reservationService.releaseStock({
        reservationId: item.reservationId,
      });
    }
    this.eventEmitter.emit(
      'cart.item.removed',
      new CartItemRemovedEvent(
        cartId,
        variantId,
        item.quantity,
        item.reservationId,
      ),
    );

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    // Update cart and extend TTL
    await this.cartRedis.updateCart(cart);
    await this.cartRedis.extendCartTTL(cartId);

    this.logger.log(`Item removed from cart ${cartId}: variant ${variantId}`);
    return cart;
  }

  /**
   * Clear cart (delete all items and release reservations).
   * Idempotent: if cart is already missing (e.g. deleted when order was created), no-op.
   */
  async clearCart(cartId: string): Promise<void> {
    const cart = await this.cartRedis.getCart(cartId);
    if (!cart) {
      return; // Already deleted (e.g. after order placement)
    }

    // Release all reservations (skip legacy placeholder ids for simple products)
    for (const item of cart.items) {
      if (
        item.reservationId &&
        !this.isSimpleProductReservation(item.reservationId)
      ) {
        try {
          await this.reservationService.releaseStock({
            reservationId: item.reservationId,
          });
        } catch (error) {
          this.logger.warn(
            `Failed to release reservation ${item.reservationId}:`,
            error,
          );
        }
      }
    }

    // Delete cart
    await this.cartRedis.deleteCart(cartId);

    this.logger.log(`Cart cleared: ${cartId}`);
  }

  /**
   * Handle cart expiration (called by scheduled job or TTL expiry)
   */
  async handleCartExpiration(cartId: string): Promise<void> {
    const cart = await this.cartRedis.getCart(cartId);

    if (!cart) {
      return; // Cart already deleted
    }

    // Emit expiration event (handler will release reservations)
    this.eventEmitter.emit('cart.expired', new CartExpiredEvent(cartId));

    // Delete cart
    await this.cartRedis.deleteCart(cartId);

    this.logger.log(`Cart expired and cleaned up: ${cartId}`);
  }

  /**
   * Apply promotions to cart and return discount information
   */
  async applyPromotions(
    cartId: string,
    couponCode?: string,
    customerId?: string,
    customerGroupId?: string,
  ): Promise<{
    discountTotal: number;
    appliedPromotions: Array<{
      promotionId: string;
      promotionCode: string | null;
      discountAmount: number;
    }>;
  }> {
    const cart = await this.cartRedis.getCart(cartId);

    if (!cart?.items || cart.items.length === 0) {
      return { discountTotal: 0, appliedPromotions: [] };
    }

    // Convert cart items to promotion format with category IDs
    const promotionItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await this.productService.findOneById(item.productId);
          const categoryIds =
            product.categories?.map((cat) => cat.categoryId) || [];
          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            categoryIds,
          };
        } catch (error) {
          this.logger.warn(
            `Failed to fetch product ${item.productId} for promotion:`,
            error,
          );
          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            categoryIds: [],
          };
        }
      }),
    );

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Apply promotions
    const appliedPromotions = await this.promotionsService.applyPromotions(
      {
        cartId,
        couponCode,
        customerId,
        customerGroupId,
      },
      promotionItems,
      subtotal,
    );

    const discountTotal = appliedPromotions.reduce(
      (sum, p) => sum + p.discountAmount,
      0,
    );

    return {
      discountTotal,
      appliedPromotions: appliedPromotions.map((p) => ({
        promotionId: p.promotionId,
        promotionCode: p.promotionCode,
        discountAmount: p.discountAmount,
      })),
    };
  }

  async addBundleToCart(
    cartId: string,
    dto: AddBundleToCartDto,
  ): Promise<Cart> {
    const deal = await this.bundleDealService.getActiveDealForCart(
      dto.bundleDealId,
    );
    const itemDtos: BundleDealItemDto[] = deal.items.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      quantity: item.quantity,
    }));

    const pricing = await this.bundleDealPricingService.computePricing(
      itemDtos,
      deal.dealPrice,
    );

    let cart = await this.cartRedis.getCart(cartId);
    if (!cart) {
      cart = await this.cartRedis.createCart(cartId, APP_CURRENCY);
    }

    for (const allocation of pricing.allocations) {
      const requiredQty = allocation.quantity * dto.quantity;
      await this.assertSufficientStock(allocation.variantId, requiredQty);
    }

    const bundleGroupId = randomUUID();
    if (!cart.bundleGroups) {
      cart.bundleGroups = {};
    }

    cart.bundleGroups[bundleGroupId] = {
      bundleDealId: deal.id,
      title: deal.title,
      slug: deal.slug,
      quantity: dto.quantity,
      dealUnitPrice: pricing.dealPrice,
      compareAtTotal: pricing.compareAtTotal,
      savingsAmount: pricing.savingsAmount,
    };

    for (let i = 0; i < pricing.allocations.length; i++) {
      const allocation = pricing.allocations[i];
      const resolved = pricing.items[i];
      const lineQty = allocation.quantity * dto.quantity;

      const reservationId = (
        await this.reservationService.reserveStock({
          variantId: allocation.variantId,
          quantity: lineQty,
          referenceType: 'cart',
          referenceId: cartId,
          expiresInMinutes: this.CART_RESERVATION_EXPIRY_MINUTES,
        })
      ).reservation.id;

      const newItem: CartItem = {
        variantId: allocation.variantId,
        productId: allocation.productId,
        quantity: lineQty,
        price: allocation.allocatedUnitPrice,
        listPrice: resolved.unitListPrice,
        currency: cart.currency,
        attributes: {},
        reservationId,
        addedAt: new Date().toISOString(),
        bundleGroupId,
        bundleDealId: deal.id,
        isBundleComponent: true,
      };

      cart.items.push(newItem);
    }

    await this.cartRedis.updateCart(cart);
    await this.cartRedis.extendCartTTL(cartId);
    this.logger.log(
      `Bundle ${deal.id} added to cart ${cartId} as group ${bundleGroupId}`,
    );
    return cart;
  }

  async removeBundleFromCart(
    cartId: string,
    bundleGroupId: string,
  ): Promise<Cart> {
    const cart = await this.cartRedis.getCart(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const bundleItems = cart.items.filter(
      (item) => item.bundleGroupId === bundleGroupId,
    );
    if (bundleItems.length === 0) {
      throw new NotFoundException(
        `Bundle group ${bundleGroupId} not found in cart`,
      );
    }

    for (const item of bundleItems) {
      if (
        item.reservationId &&
        !this.isSimpleProductReservation(item.reservationId)
      ) {
        await this.reservationService.releaseStock({
          reservationId: item.reservationId,
        });
      }
    }

    cart.items = cart.items.filter(
      (item) => item.bundleGroupId !== bundleGroupId,
    );
    if (cart.bundleGroups) {
      delete cart.bundleGroups[bundleGroupId];
    }

    await this.cartRedis.updateCart(cart);
    await this.cartRedis.extendCartTTL(cartId);
    return cart;
  }

  async updateBundleInCart(
    cartId: string,
    bundleGroupId: string,
    dto: UpdateBundleCartDto,
  ): Promise<Cart> {
    const cart = await this.cartRedis.getCart(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const group = cart.bundleGroups?.[bundleGroupId];
    if (!group) {
      throw new NotFoundException(
        `Bundle group ${bundleGroupId} not found in cart`,
      );
    }

    const bundleItems = cart.items.filter(
      (item) => item.bundleGroupId === bundleGroupId,
    );
    const oldBundleQty = group.quantity;
    const newBundleQty = dto.quantity;

    if (oldBundleQty === newBundleQty) {
      await this.cartRedis.extendCartTTL(cartId);
      return cart;
    }

    const ratio = newBundleQty / oldBundleQty;

    for (const item of bundleItems) {
      const newQty = Math.round(item.quantity * ratio);
      if (newQty > 0) {
        await this.assertSufficientStock(item.variantId, newQty);
      }
      if (item.reservationId) {
        await this.reservationService.releaseStock({
          reservationId: item.reservationId,
        });
      }

      if (newQty > 0) {
        const reservationId = (
          await this.reservationService.reserveStock({
            variantId: item.variantId,
            quantity: newQty,
            referenceType: 'cart',
            referenceId: cartId,
            expiresInMinutes: this.CART_RESERVATION_EXPIRY_MINUTES,
          })
        ).reservation.id;
        item.quantity = newQty;
        item.reservationId = reservationId;
      }
    }

    cart.items = cart.items.filter((item) => {
      if (item.bundleGroupId !== bundleGroupId) return true;
      return item.quantity > 0;
    });

    group.quantity = newBundleQty;
    await this.cartRedis.updateCart(cart);
    await this.cartRedis.extendCartTTL(cartId);
    return cart;
  }
}
