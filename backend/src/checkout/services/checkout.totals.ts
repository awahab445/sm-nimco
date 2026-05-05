import { Injectable, Logger } from '@nestjs/common';
import { CheckoutSession, CheckoutShippingMethod } from './checkout.redis';
import { PromotionsService } from '../../promotions/services/promotions.service';
import { ProductService } from '../../catalog/services/product.service';
import { TaxCalculationService } from '../../tax/services/calculation.service';
import { TaxCalculationItem } from '../../tax/dto/calculate-tax.dto';
import { CustomerGroupService } from '../../customer-group/services/customer-group.service';
import { PrismaService } from '../../catalog/services/prisma.service';

export interface TotalsCalculation {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
}

@Injectable()
export class CheckoutTotalsService {
  private readonly logger = new Logger(CheckoutTotalsService.name);

  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly productService: ProductService,
    private readonly taxCalculationService: TaxCalculationService,
    private readonly customerGroupService: CustomerGroupService,
    private readonly prisma: PrismaService,
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
   * Calculate discount total using promotions service and customer group discount
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
    let groupDiscount = 0;
    let freeShippingApplied = false;

    try {
      // Convert checkout items to promotion format with category IDs
      const promotionItems = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await this.productService.findOneById(item.productId);
            const categoryIds = product.categories?.map((cat) => cat.categoryId) || [];
            return {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              categoryIds,
            };
          } catch (error) {
            this.logger.warn(`Failed to fetch product ${item.productId} for promotion:`, error);
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
      promotionDiscount = appliedPromotions.reduce((sum, p) => sum + p.discountAmount, 0);
      freeShippingApplied = appliedPromotions.some((p) => p.promotion.type === 'free_shipping');

      // Apply customer group discount (if any) to subtotal after promotions
      if (checkout.customerGroupId) {
        try {
          const customerGroup = await this.customerGroupService.findOne(checkout.customerGroupId);
          if (customerGroup.discountPercent && customerGroup.discountPercent > 0) {
            // Group discount applies to subtotal after promotion discounts
            const subtotalAfterPromotions = Math.max(0, subtotal - promotionDiscount);
            groupDiscount = (subtotalAfterPromotions * customerGroup.discountPercent) / 100;
            this.logger.log(
              `Applied customer group discount: ${customerGroup.discountPercent}% = ${groupDiscount}`,
            );
          }
        } catch (error) {
          this.logger.warn(`Failed to apply customer group discount:`, error);
        }
      }

      // Total discount = promotion discount + group discount
      return {
        discountTotal: promotionDiscount + groupDiscount,
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
  calculateShippingTotal(
    shippingMethod?: CheckoutShippingMethod,
  ): number {
    if (!shippingMethod) {
      return 0;
    }
    return shippingMethod.cost;
  }

  /**
   * Calculate tax total using tax calculation service
   */
  async calculateTaxTotal(
    items: CheckoutSession['items'],
    subtotal: number,
    discountTotal: number,
    shippingTotal: number,
    checkout: CheckoutSession,
    shippingAddress?: CheckoutSession['shippingAddress'],
    billingAddress?: CheckoutSession['billingAddress'],
  ): Promise<number> {
    if (items.length === 0) {
      return 0;
    }

    // Use billing address for tax calculation (fallback to shipping if billing not available)
    const taxAddress = billingAddress || shippingAddress;
    if (!taxAddress || !taxAddress.country) {
      this.logger.warn('Cannot calculate tax: no address provided');
      return 0;
    }

    try {
      // Get customer group tax class if available
      let customerGroupTaxClassId: string | null = null;
      if (checkout.customerGroupId) {
        try {
          const customerGroup = await this.customerGroupService.findOne(checkout.customerGroupId);
          customerGroupTaxClassId = customerGroup.taxClassId || null;
        } catch (error) {
          this.logger.warn(`Failed to fetch customer group for tax calculation:`, error);
        }
      }

      // Convert checkout items to tax calculation items
      // Use customer group tax class if product doesn't have one
      const taxItems: TaxCalculationItem[] = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await this.productService.findOneById(item.productId);
            // Use product tax class, or fallback to customer group tax class
            const taxClassId = product.taxClassId || customerGroupTaxClassId || null;
            return {
              productId: item.productId,
              variantId: item.variantId,
              taxClassId,
              price: item.price,
              quantity: item.quantity,
            };
          } catch (error) {
            this.logger.warn(`Failed to fetch product ${item.productId} for tax calculation:`, error);
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

      // Calculate tax (tax is calculated on subtotal after discounts, not including shipping)
      // In some jurisdictions, shipping may be taxable, but we'll calculate tax on subtotal - discount for now
      const taxableAmount = Math.max(0, subtotal - discountTotal);

      // Adjust items to reflect discounted price for tax calculation
      // This is a simplification - in reality, discounts might apply per-item
      const taxCalculationItems: TaxCalculationItem[] = taxItems.map((item) => {
        const itemSubtotal = item.price * item.quantity;
        const discountRatio = subtotal > 0 ? (subtotal - discountTotal) / subtotal : 1;
        const adjustedPrice = item.price * discountRatio;
        return {
          ...item,
          price: adjustedPrice,
        };
      });

      const result = await this.taxCalculationService.calculate(
        taxCalculationItems,
        {
          country: taxAddress.country,
          region: taxAddress.state || undefined,
          currency: undefined,
        },
        false, // Don't emit event here, will emit during order creation
      );

      return result.taxTotal;
    } catch (error) {
      this.logger.error('Failed to calculate tax total:', error);
      return 0;
    }
  }

  /**
   * Calculate all totals for checkout session
   */
  async calculateTotals(
    checkout: CheckoutSession,
    options?: { recordPromotionRedemptions?: boolean },
  ): Promise<TotalsCalculation> {
    const subtotal = this.calculateSubtotal(checkout.items);
    const { discountTotal, freeShippingApplied } = await this.calculateDiscountTotal(
      subtotal,
      checkout.items,
      checkout,
      options,
    );
    const shippingTotal = freeShippingApplied
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

