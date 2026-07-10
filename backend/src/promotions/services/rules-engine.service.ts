import { Injectable, Logger } from '@nestjs/common';
import { PromotionConditions } from '../dto/create-promotion.dto';
import { Promotion } from '../entities/promotion.entity';
import { CartItem } from '../dto/validate-promotion.dto';

export interface EligibilityContext {
  subtotal: number;
  items: CartItem[];
  customerId?: string;
  customerGroupId?: string;
  couponCode?: string;
}

@Injectable()
export class RulesEngineService {
  private readonly logger = new Logger(RulesEngineService.name);

  /**
   * Check if a promotion is eligible for the given context
   */
  isEligible(
    promotion: Promotion,
    context: EligibilityContext,
  ): {
    eligible: boolean;
    reason?: string;
  } {
    // Check status
    if (promotion.status !== 'active') {
      return { eligible: false, reason: 'Promotion is not active' };
    }

    // Check validity period
    const now = new Date();
    if (promotion.startDate && new Date(promotion.startDate) > now) {
      return { eligible: false, reason: 'Promotion has not started yet' };
    }

    if (promotion.endDate && new Date(promotion.endDate) < now) {
      return { eligible: false, reason: 'Promotion has expired' };
    }

    // Check coupon code match (if promotion requires a code)
    if (promotion.code) {
      if (
        !context.couponCode ||
        context.couponCode.toLowerCase() !== promotion.code.toLowerCase()
      ) {
        return { eligible: false, reason: 'Invalid coupon code' };
      }
    }

    // Check usage limits
    if (
      promotion.usageLimit &&
      promotion.currentUsage >= promotion.usageLimit
    ) {
      return { eligible: false, reason: 'Promotion usage limit reached' };
    }

    // Check conditions
    const conditionsResult = this.checkConditions(
      promotion.conditions,
      context,
    );
    if (!conditionsResult.eligible) {
      return conditionsResult;
    }

    return { eligible: true };
  }

  /**
   * Check promotion conditions (min order amount, products, categories)
   * Note: Customer group eligibility is handled by PromotionRuleEvaluatorService
   */
  checkConditions(
    conditions: PromotionConditions,
    context: EligibilityContext,
  ): { eligible: boolean; reason?: string } {
    if (!conditions || Object.keys(conditions).length === 0) {
      return { eligible: true };
    }

    // Check minimum order amount
    if (conditions.minOrderAmount !== undefined) {
      if (context.subtotal < conditions.minOrderAmount) {
        return {
          eligible: false,
          reason: `Minimum order amount of ${conditions.minOrderAmount} required`,
        };
      }
    }

    // Check product eligibility
    if (conditions.products && conditions.products.length > 0) {
      const hasEligibleProduct = context.items.some((item) =>
        conditions.products!.includes(item.productId),
      );
      if (!hasEligibleProduct) {
        return { eligible: false, reason: 'No eligible products in cart' };
      }
    }

    // Check category eligibility
    if (conditions.categories && conditions.categories.length > 0) {
      const hasEligibleCategory = context.items.some((item) => {
        if (!item.categoryIds) return false;
        return item.categoryIds.some((catId) =>
          conditions.categories!.includes(catId),
        );
      });
      if (!hasEligibleCategory) {
        return { eligible: false, reason: 'No eligible categories in cart' };
      }
    }

    // Customer group eligibility is now handled by PromotionRuleEvaluatorService
    // This method only checks product/category/amount conditions
    // Legacy support: if customerGroups is in conditions, it's ignored (use PromotionCustomerGroup table instead)

    return { eligible: true };
  }

  /**
   * Calculate discount amount for a promotion
   */
  calculateDiscount(
    promotion: Promotion,
    subtotal: number,
    applicableAmount: number = subtotal,
  ): number {
    if (promotion.type === 'free_shipping') {
      return 0;
    }

    if (!promotion.discountValue || !promotion.discountType) {
      return 0;
    }

    let discount = 0;

    switch (promotion.type) {
      case 'percentage':
        if (promotion.discountType === 'percentage') {
          discount = (applicableAmount * promotion.discountValue) / 100;
        }
        break;

      case 'fixed_amount':
        if (promotion.discountType === 'fixed_amount') {
          discount = Math.min(promotion.discountValue, applicableAmount);
        }
        break;

      case 'buy_x_get_y':
        // This would require specific logic based on the promotion configuration
        // For now, we'll use percentage or fixed amount if specified
        if (promotion.discountType === 'percentage') {
          discount = (applicableAmount * promotion.discountValue) / 100;
        } else if (promotion.discountType === 'fixed_amount') {
          discount = Math.min(promotion.discountValue, applicableAmount);
        }
        break;

      default:
        this.logger.warn(`Unknown promotion type: ${promotion.type}`);
        return 0;
    }

    // Apply max discount cap if specified
    if (promotion.conditions?.maxDiscountAmount) {
      discount = Math.min(discount, promotion.conditions.maxDiscountAmount);
    }

    // Ensure discount doesn't exceed applicable amount
    return Math.min(discount, applicableAmount);
  }

  /**
   * Determine if promotions can be stacked
   */
  canStack(promotion1: Promotion, promotion2: Promotion): boolean {
    // If either promotion is exclusive, they cannot be stacked
    if (promotion1.isExclusive || promotion2.isExclusive) {
      return false;
    }

    // Both must be stackable
    return promotion1.isStackable && promotion2.isStackable;
  }

  /**
   * Get applicable amount for a product-level or category-level promotion
   */
  getApplicableAmount(
    promotion: Promotion,
    items: CartItem[],
    promotionProducts?: Array<{
      productId?: string | null;
      variantId?: string | null;
      categoryId?: string | null;
    }>,
  ): number {
    if (promotion.scope === 'cart') {
      return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    if (!promotionProducts || promotionProducts.length === 0) {
      return 0;
    }

    let applicableAmount = 0;

    for (const item of items) {
      const isEligible = promotionProducts.some((pp) => {
        if (pp.productId && pp.productId === item.productId) {
          return true;
        }
        if (pp.variantId && pp.variantId === item.variantId) {
          return true;
        }
        if (pp.categoryId && item.categoryIds?.includes(pp.categoryId)) {
          return true;
        }
        return false;
      });

      if (isEligible) {
        applicableAmount += item.price * item.quantity;
      }
    }

    return applicableAmount;
  }
}
