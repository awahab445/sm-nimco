import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { ShippingMethod } from '../entities/shipping-zone.entity';

export interface EligibilityContext {
  customerGroupId?: string | null;
  orderAmount: number;
  orderWeight: number;
}

export interface GroupPricing {
  discountPercent: number | null;
  fixedCost: number | null;
}

@Injectable()
export class ShippingEligibilityEvaluator {
  private readonly logger = new Logger(ShippingEligibilityEvaluator.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a shipping method is eligible for the given context
   * Returns eligibility status and group-specific pricing if applicable
   */
  async evaluateEligibility(
    method: ShippingMethod & { customerGroups?: any[] },
    context: EligibilityContext,
  ): Promise<{ eligible: boolean; groupPricing: GroupPricing | null }> {
    // Check basic eligibility constraints (amount, weight)
    if (!this.checkBasicConstraints(method, context)) {
      return { eligible: false, groupPricing: null };
    }

    // Check customer group restrictions
    const groupEligibility = await this.checkCustomerGroupEligibility(
      method,
      context.customerGroupId,
    );

    if (!groupEligibility.eligible) {
      return { eligible: false, groupPricing: null };
    }

    return {
      eligible: true,
      groupPricing: groupEligibility.pricing,
    };
  }

  /**
   * Check basic eligibility constraints (amount, weight)
   */
  private checkBasicConstraints(
    method: ShippingMethod,
    context: EligibilityContext,
  ): boolean {
    // Check order amount constraints
    if (method.minOrderAmount && context.orderAmount < method.minOrderAmount) {
      return false;
    }

    if (method.maxOrderAmount && context.orderAmount > method.maxOrderAmount) {
      return false;
    }

    // Check weight constraints
    if (method.minWeight && context.orderWeight < method.minWeight) {
      return false;
    }

    if (method.maxWeight && context.orderWeight > method.maxWeight) {
      return false;
    }

    return true;
  }

  /**
   * Check customer group eligibility and get group-specific pricing
   */
  private async checkCustomerGroupEligibility(
    method: ShippingMethod & { customerGroups?: any[] },
    customerGroupId?: string | null,
  ): Promise<{ eligible: boolean; pricing: GroupPricing | null }> {
    // If no customer group specified, method is available to all (default behavior)
    if (!customerGroupId) {
      return { eligible: true, pricing: null };
    }

    // If method has no customer group restrictions, it's available to all
    if (!method.customerGroups || method.customerGroups.length === 0) {
      return { eligible: true, pricing: null };
    }

    // Check if customer group is in the allowed groups
    const groupRule = method.customerGroups.find(
      (cg) => cg.customerGroupId === customerGroupId,
    );

    if (!groupRule) {
      // Method is restricted to specific groups and this group is not included
      this.logger.debug(
        `Method ${method.id} is not available for customer group ${customerGroupId}`,
      );
      return { eligible: false, pricing: null };
    }

    // Group is eligible, return group-specific pricing
    return {
      eligible: true,
      pricing: {
        discountPercent: groupRule.discountPercent
          ? parseFloat(groupRule.discountPercent.toString())
          : null,
        fixedCost: groupRule.fixedCost
          ? parseFloat(groupRule.fixedCost.toString())
          : null,
      },
    };
  }

  /**
   * Load customer groups for shipping methods
   */
  async loadCustomerGroupsForMethods(
    methodIds: string[],
  ): Promise<Map<string, any[]>> {
    if (methodIds.length === 0) {
      return new Map();
    }

    const customerGroups =
      await this.prisma.shippingMethodCustomerGroup.findMany({
        where: {
          shippingMethodId: {
            in: methodIds,
          },
        },
      });

    // Group by shipping method ID
    const groupsByMethod = new Map<string, any[]>();
    for (const cg of customerGroups) {
      const methodId = cg.shippingMethodId;
      if (!groupsByMethod.has(methodId)) {
        groupsByMethod.set(methodId, []);
      }
      groupsByMethod.get(methodId)!.push(cg);
    }

    return groupsByMethod;
  }
}
