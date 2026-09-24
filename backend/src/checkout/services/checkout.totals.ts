import { Injectable, Logger } from '@nestjs/common';
import { CheckoutSession, CheckoutShippingMethod } from './checkout.redis';
import { PromotionsService } from '../../promotions/services/promotions.service';
import { ProductService } from '../../catalog/services/product.service';
import { StoreSettingsService } from '../../store-settings/services/store-settings.service';
import { qualifiesForFreeDelivery } from '../../shipping/utils/shipping-fee';
import { DEFAULT_GST_RATE_PERCENT } from '../../tax/constants/gst';
import { PromotionType } from '../../promotions/dto/create-promotion.dto';

export interface TotalsCalculation {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  /** Alias of taxTotal — explicit GST amount for storefront payloads. */
  gstAmount: number;
  taxRatePercent: number;
  grandTotal: number;
}

@Injectable()
export class CheckoutTotalsService {
  private readonly logger = new Logger(CheckoutTotalsService.name);
  private readonly defaultFreeDeliveryThreshold = 2000;

  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly productService: ProductService,
    private readonly storeSettingsService: StoreSettingsService,
  ) {}

  /**
   * Calculate subtotal from checkout items
   */
  calculateSubtotal(items: CheckoutSession['items']): number {
    return items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  /**
   * Calculate discount total from promotions only (no customer-group % here — that is not a promotion rule).
   */
  async calculateDiscountTotal(
    subtotal: number,
    items: CheckoutSession['items'],
    checkout: CheckoutSession,
    options?: { recordPromotionRedemptions?: boolean },
  ): Promise<{ discountTotal: number; freeShippingApplied: boolean }> {
    if (items.length === 0) {
      return { discountTotal: 0, freeShippingApplied: false };
    }

    let promotionDiscount = 0;
    let freeShippingApplied = false;

    try {
      // Convert checkout items to promotion format with category IDs
      const promotionItems = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await this.productService.findOneById(
              item.productId,
            );
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

      const couponCode = checkout.couponCode ?? undefined;

      // Apply promotions
      const appliedPromotions = await this.promotionsService.applyPromotions(
        {
          checkoutId: checkout.id,
          couponCode,
          customerId: checkout.customerId,
          customerGroupId: checkout.customerGroupId,
        },
        promotionItems,
        subtotal,
        { recordRedemption: options?.recordPromotionRedemptions === true },
      );

      // Calculate promotion discount
      promotionDiscount = appliedPromotions.reduce(
        (sum, p) => sum + p.discountAmount,
        0,
      );
      freeShippingApplied = appliedPromotions.some(
        (p) => p.promotion.type === PromotionType.FREE_SHIPPING,
      );

      return {
        discountTotal: promotionDiscount,
        freeShippingApplied,
      };
    } catch (error) {
      this.logger.error('Failed to calculate discount total:', error);
      return { discountTotal: 0, freeShippingApplied: false };
    }
  }

  /**
   * Calculate shipping total
   */
  calculateShippingTotal(shippingMethod?: CheckoutShippingMethod): number {
    if (!shippingMethod) {
      return 0;
    }
    const cost = Number(shippingMethod.cost);
    return Number.isFinite(cost) ? Math.max(0, cost) : 0;
  }

  /**
   * Tax is disabled for storefront orders — totals are subtotal − discount + shipping only.
   */
  calculateTaxTotal(): number {
    return 0;
  }

  /**
   * Calculate all totals for checkout session.
   * Grand Total = Subtotal − Discount + Effective Shipping (tax disabled).
   */
  async calculateTotals(
    checkout: CheckoutSession,
    options?: { recordPromotionRedemptions?: boolean },
  ): Promise<TotalsCalculation> {
    const subtotal = this.calculateSubtotal(checkout.items);
    const { discountTotal, freeShippingApplied } =
      await this.calculateDiscountTotal(
        subtotal,
        checkout.items,
        checkout,
        options,
      );
    const orderSettings =
      await this.storeSettingsService.getPublicOrderSettings();
    const freeDeliveryThreshold =
      orderSettings.freeDeliveryThreshold ?? this.defaultFreeDeliveryThreshold;
    const qualifiesForFreeDeliveryThreshold = qualifiesForFreeDelivery({
      subtotal,
      freeDeliveryThreshold,
    });
    const shippingTotal =
      freeShippingApplied || qualifiesForFreeDeliveryThreshold
        ? 0
        : this.calculateShippingTotal(checkout.shippingMethod);
    const taxTotal = this.calculateTaxTotal();
    const grandTotal = subtotal - discountTotal + shippingTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      gstAmount: taxTotal,
      taxRatePercent: DEFAULT_GST_RATE_PERCENT,
      grandTotal,
    };
  }

  /**
   * Recalculate totals and update checkout session
   */
  async recalculateAndUpdate(
    checkout: CheckoutSession,
    options?: { recordPromotionRedemptions?: boolean },
  ): Promise<CheckoutSession> {
    const totals = await this.calculateTotals(checkout, options);

    return {
      ...checkout,
      ...totals,
      updatedAt: new Date().toISOString(),
    };
  }
}
