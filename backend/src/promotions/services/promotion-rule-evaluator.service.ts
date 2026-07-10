import { Injectable, Logger } from '@nestjs/common';
import {
  Promotion,
  PromotionCustomerGroup,
} from '../entities/promotion.entity';
import { EligibilityContext } from './rules-engine.service';

export interface RuleEvaluationResult {
  eligible: boolean;
  reason?: string;
}

export interface CustomerGroupRule {
  appliesToAllGroups: boolean;
  eligibleGroups: PromotionCustomerGroup[];
  excludedGroups: PromotionCustomerGroup[];
}

/**
 * PromotionRuleEvaluator Service
 *
 * Provides a clear, unit-testable rule evaluation pipeline for promotions.
 * Handles customer group eligibility with inclusion/exclusion rules.
 */
@Injectable()
export class PromotionRuleEvaluatorService {
  private readonly logger = new Logger(PromotionRuleEvaluatorService.name);

  /**
   * Evaluate customer group eligibility for a promotion
   *
   * Rules:
   * 1. If appliesToAllGroups is true, promotion applies to all groups (unless excluded)
   * 2. If appliesToAllGroups is false, only eligible groups can use the promotion
   * 3. Excluded groups always take precedence (even if eligible)
   * 4. If no customer group is provided, promotion is not eligible (unless appliesToAllGroups is true)
   */
  evaluateCustomerGroupEligibility(
    promotion: Promotion,
    customerGroupId: string | undefined,
    customerGroupRules: CustomerGroupRule,
  ): RuleEvaluationResult {
    // If no customer group provided and promotion doesn't apply to all groups
    if (!customerGroupId) {
      if (customerGroupRules.appliesToAllGroups) {
        // Check if there are any global exclusions (this would be rare, but possible)
        // For now, if appliesToAllGroups is true, we allow it
        return { eligible: true };
      }
      return {
        eligible: false,
        reason: 'Customer group is required for this promotion',
      };
    }

    // Check if customer group is explicitly excluded
    const isExcluded = customerGroupRules.excludedGroups.some(
      (eg) => eg.customerGroupId === customerGroupId,
    );

    if (isExcluded) {
      return {
        eligible: false,
        reason: 'Customer group is excluded from this promotion',
      };
    }

    // If promotion applies to all groups, customer is eligible (already checked exclusion)
    if (customerGroupRules.appliesToAllGroups) {
      return { eligible: true };
    }

    // Check if customer group is in eligible groups
    const isEligible = customerGroupRules.eligibleGroups.some(
      (eg) => eg.customerGroupId === customerGroupId,
    );

    if (!isEligible) {
      return {
        eligible: false,
        reason: 'Customer group is not eligible for this promotion',
      };
    }

    return { eligible: true };
  }

  /**
   * Build customer group rules from promotion and database relationships
   */
  buildCustomerGroupRules(
    promotion: Promotion,
    promotionCustomerGroups: PromotionCustomerGroup[],
  ): CustomerGroupRule {
    const eligibleGroups = promotionCustomerGroups.filter(
      (pcg) => !pcg.isExcluded,
    );
    const excludedGroups = promotionCustomerGroups.filter(
      (pcg) => pcg.isExcluded,
    );

    return {
      appliesToAllGroups: promotion.appliesToAllGroups,
      eligibleGroups,
      excludedGroups,
    };
  }

  /**
   * Evaluate promotion status and validity period
   */
  evaluatePromotionStatus(promotion: Promotion): RuleEvaluationResult {
    // Check status
    if (promotion.status !== 'active') {
      return {
        eligible: false,
        reason: `Promotion is ${promotion.status}`,
      };
    }

    // Check validity period
    const now = new Date();
    if (promotion.startDate && new Date(promotion.startDate) > now) {
      return {
        eligible: false,
        reason: 'Promotion has not started yet',
      };
    }

    if (promotion.endDate && new Date(promotion.endDate) < now) {
      return {
        eligible: false,
        reason: 'Promotion has expired',
      };
    }

    return { eligible: true };
  }

  /**
   * Evaluate usage limits
   */
  evaluateUsageLimits(
    promotion: Promotion,
    context: EligibilityContext,
  ): RuleEvaluationResult {
    // Check total usage limit
    if (
      promotion.usageLimit &&
      promotion.currentUsage >= promotion.usageLimit
    ) {
      return {
        eligible: false,
        reason: 'Promotion usage limit reached',
      };
    }

    // Per-user usage limit would require additional tracking
    // This can be implemented later with a usage tracking table
    // For now, we'll skip this check

    return { eligible: true };
  }

  /**
   * Evaluate coupon code match (if promotion requires a code)
   */
  evaluateCouponCode(
    promotion: Promotion,
    context: EligibilityContext,
  ): RuleEvaluationResult {
    // If promotion has a code, it must match
    if (promotion.code) {
      if (
        !context.couponCode ||
        context.couponCode.toLowerCase() !== promotion.code.toLowerCase()
      ) {
        return {
          eligible: false,
          reason: 'Invalid or missing coupon code',
        };
      }
    }

    return { eligible: true };
  }

  /**
   * Comprehensive rule evaluation pipeline
   *
   * Evaluates all rules in order:
   * 1. Promotion status and validity
   * 2. Coupon code (if required)
   * 3. Usage limits
   * 4. Customer group eligibility
   *
   * Returns the first failing rule or success if all pass
   */
  evaluateAllRules(
    promotion: Promotion,
    context: EligibilityContext,
    customerGroupRules: CustomerGroupRule,
  ): RuleEvaluationResult {
    // Step 1: Check promotion status
    const statusResult = this.evaluatePromotionStatus(promotion);
    if (!statusResult.eligible) {
      return statusResult;
    }

    // Step 2: Check coupon code
    const couponResult = this.evaluateCouponCode(promotion, context);
    if (!couponResult.eligible) {
      return couponResult;
    }

    // Step 3: Check usage limits
    const usageResult = this.evaluateUsageLimits(promotion, context);
    if (!usageResult.eligible) {
      return usageResult;
    }

    // Step 4: Check customer group eligibility
    const groupResult = this.evaluateCustomerGroupEligibility(
      promotion,
      context.customerGroupId,
      customerGroupRules,
    );
    if (!groupResult.eligible) {
      return groupResult;
    }

    return { eligible: true };
  }

  /**
   * Check if two promotions can be stacked
   *
   * Rules:
   * - If either promotion is exclusive, they cannot be stacked
   * - Both promotions must be stackable
   */
  canStackPromotions(promotion1: Promotion, promotion2: Promotion): boolean {
    // If either promotion is exclusive, they cannot be stacked
    if (promotion1.isExclusive || promotion2.isExclusive) {
      return false;
    }

    // Both must be stackable
    return promotion1.isStackable && promotion2.isStackable;
  }
}
