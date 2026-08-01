import { Injectable, Logger } from '@nestjs/common';
import { CheckoutSession, CheckoutShippingMethod } from './checkout.redis';
import { PromotionsService } from '../../promotions/services/promotions.service';
import { ProductService } from '../../catalog/services/product.service';
import { TaxCalculationService } from '../../tax/services/calculation.service';
import { TaxCalculationItem } from '../../tax/dto/calculate-tax.dto';
import { CustomerGroupService } from '../../customer-group/services/customer-group.service';
import { PrismaService } from '../../catalog/services/prisma.service';
import { StoreSettingsService } from '../../store-settings/services/store-settings.service';
import {
  DEFAULT_GST_RATE_PERCENT,
  calculateGstAmount,
} from '../../tax/constants/gst';

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
    private readonly taxCalculationService: TaxCalculationService,
    /** Used for tax-class fallback only — not for order discounts. */
    private readonly customerGroupService: CustomerGroupService,
    private readonly prisma: PrismaService,
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
        (p) => p.promotion.type === 'free_shipping',
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
   * Calculate GST / sales tax on the taxable subtotal (after discounts).
   * Storefront uses a fixed 18% GST rate so totals remain consistent even when
   * products have no taxClassId / tax rate rows configured.
   */
  async calculateTaxTotal(
    items: CheckoutSession['items'],
    subtotal: number,
    discountTotal: number,
    _shippingTotal: number,
    _checkout: CheckoutSession,
    _shippingAddress?: CheckoutSession['shippingAddress'],
    _billingAddress?: CheckoutSession['billingAddress'],
  ): Promise<number> {
    if (items.length === 0) {
      return 0;
    }

    const taxableAmount = Math.max(0, subtotal - discountTotal);
    const gstAmount = calculateGstAmount(
      taxableAmount,
      DEFAULT_GST_RATE_PERCENT,
    );

    // Prefer configured tax-module rates when they resolve to a positive amount
    // (e.g. admin-managed GST class). Fall back to storefront 18% GST otherwise.
    try {
      const taxAddress =
        _billingAddress || _shippingAddress;
      if (taxAddress?.country) {
        let customerGroupTaxClassId: string | null = null;
        if (_checkout.customerGroupId) {
          try {
            const customerGroup = await this.customerGroupService.findOne(
              _checkout.customerGroupId,
            );
            customerGroupTaxClassId = customerGroup.taxClassId || null;
          } catch {
            /* ignore */
          }
        }

        const taxItems: TaxCalculationItem[] = await Promise.all(
          items.map(async (item) => {
            try {
              const product = await this.productService.findOneById(
                item.productId,
              );
              return {
                productId: item.productId,
                variantId: item.variantId,
                taxClassId:
                  product.taxClassId || customerGroupTaxClassId || null,
                price: item.price,
                quantity: item.quantity,
              };
            } catch {
              return {
                productId: item.productId,
                variantId: item.variantId,
                taxClassId: customerGroupTaxClassId || null,
                price: item.price,
                quantity: item.quantity,
              };
            }
          }),
        );

        const discountRatio =
          subtotal > 0 ? (subtotal - discountTotal) / subtotal : 1;
        const adjustedItems = taxItems.map((item) => ({
          ...item,
          price: item.price * discountRatio,
        }));

        const result = await this.taxCalculationService.calculate(
          adjustedItems,
          {
            country: taxAddress.country,
            region: taxAddress.state || undefined,
            currency: undefined,
          },
          false,
        );

        if (result.taxTotal > 0) {
          return result.taxTotal;
        }
      }
    } catch (error) {
      this.logger.warn(
        `Configured tax lookup failed; using ${DEFAULT_GST_RATE_PERCENT}% GST fallback: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return gstAmount;
  }

  /**
   * Calculate all totals for checkout session.
   * Grand Total = Subtotal − Discount + GST + Effective Shipping.
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
    const qualifiesForFreeDeliveryThreshold =
      freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold;
    const shippingTotal =
      freeShippingApplied || qualifiesForFreeDeliveryThreshold
        ? 0
        : this.calculateShippingTotal(checkout.shippingMethod);
    const taxTotal = await this.calculateTaxTotal(
      checkout.items,
      subtotal,
      discountTotal,
      shippingTotal,
      checkout,
      checkout.shippingAddress,
      checkout.billingAddress,
    );
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
