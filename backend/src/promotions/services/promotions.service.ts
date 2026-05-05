import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../catalog/services/prisma.service';
import {
  Promotion,
  PromotionProduct,
  PromotionLog,
  AppliedPromotion,
} from '../entities/promotion.entity';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { PatchPromotionDto } from '../dto/patch-promotion.dto';
import { ApplyPromotionDto } from '../dto/apply-promotion.dto';
import { CartItem } from '../dto/validate-promotion.dto';
import { ValidatePromotionDto } from '../dto/validate-promotion.dto';
import { RulesEngineService } from './rules-engine.service';
import { PromotionRuleEvaluatorService } from './promotion-rule-evaluator.service';
import {
  PromotionAppliedEvent,
  PromotionExpiredEvent,
  CouponUsedEvent,
} from '../events/promotion.events';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rulesEngine: RulesEngineService,
    private readonly ruleEvaluator: PromotionRuleEvaluatorService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new promotion
   */
  async createPromotion(dto: CreatePromotionDto): Promise<Promotion> {
    // Validate code uniqueness if provided
    if (dto.code) {
      const existing = await this.prisma.promotion.findUnique({
        where: { code: dto.code },
      });
      if (existing) {
        throw new BadRequestException(`Promotion code ${dto.code} already exists`);
      }
    }

    // Set default values
    const scope = dto.scope || 'cart';
    const isStackable = dto.isStackable ?? false;
    const isExclusive = dto.isExclusive ?? true;
    const status = 'draft';
    const appliesToAllGroups = dto.appliesToAllGroups ?? false;

    // Validate customer group configuration
    if (appliesToAllGroups && (dto.eligibleCustomerGroupIds?.length || dto.excludedCustomerGroupIds?.length)) {
      this.logger.warn('Promotion applies to all groups, but specific groups are also specified. Specific groups will be ignored.');
    }

    // Create promotion
    const promotion = await this.prisma.promotion.create({
      data: {
        code: dto.code || null,
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        status,
        discountValue: dto.discountValue ? parseFloat(dto.discountValue.toString()) : null,
        discountType: dto.discountType ?? 'percentage',
        scope,
        isStackable,
        isExclusive,
        appliesToAllGroups,
        conditions: (dto.conditions || {}) as object,
        usageLimit: dto.usageLimit || null,
        usageLimitPerUser: dto.usageLimitPerUser || null,
        currentUsage: 0,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        metadata: dto.metadata || {},
      },
    });

    // Create promotion products/categories if provided
    if (dto.productIds || dto.variantIds || dto.categoryIds) {
      const promotionProducts: Array<{
        promotionId: string;
        productId: string | null;
        variantId: string | null;
        categoryId: string | null;
      }> = [];

      if (dto.productIds) {
        for (const productId of dto.productIds) {
          promotionProducts.push({
            promotionId: promotion.id,
            productId,
            variantId: null,
            categoryId: null,
          });
        }
      }

      if (dto.variantIds) {
        for (const variantId of dto.variantIds) {
          promotionProducts.push({
            promotionId: promotion.id,
            productId: null,
            variantId,
            categoryId: null,
          });
        }
      }

      if (dto.categoryIds) {
        for (const categoryId of dto.categoryIds) {
          promotionProducts.push({
            promotionId: promotion.id,
            productId: null,
            variantId: null,
            categoryId,
          });
        }
      }

      if (promotionProducts.length > 0) {
        await this.prisma.promotionProduct.createMany({
          data: promotionProducts,
        });
      }
    }

    // Create promotion customer groups if provided
    if (!appliesToAllGroups && (dto.eligibleCustomerGroupIds || dto.excludedCustomerGroupIds)) {
      const promotionCustomerGroups: Array<{
        promotionId: string;
        customerGroupId: string;
        isExcluded: boolean;
      }> = [];

      // Add eligible groups
      if (dto.eligibleCustomerGroupIds) {
        for (const groupId of dto.eligibleCustomerGroupIds) {
          promotionCustomerGroups.push({
            promotionId: promotion.id,
            customerGroupId: groupId,
            isExcluded: false,
          });
        }
      }

      // Add excluded groups
      if (dto.excludedCustomerGroupIds) {
        for (const groupId of dto.excludedCustomerGroupIds) {
          promotionCustomerGroups.push({
            promotionId: promotion.id,
            customerGroupId: groupId,
            isExcluded: true,
          });
        }
      }

      if (promotionCustomerGroups.length > 0) {
        await this.prisma.promotionCustomerGroup.createMany({
          data: promotionCustomerGroups,
        });
      }
    } else if (appliesToAllGroups && dto.excludedCustomerGroupIds) {
      // If applies to all groups, only create excluded groups
      const excludedGroups = dto.excludedCustomerGroupIds.map((groupId) => ({
        promotionId: promotion.id,
        customerGroupId: groupId,
        isExcluded: true,
      }));

      if (excludedGroups.length > 0) {
        await this.prisma.promotionCustomerGroup.createMany({
          data: excludedGroups,
        });
      }
    }

    this.logger.log(`Created promotion: ${promotion.id} (${promotion.code || 'N/A'})`);

    return this.getPromotion(promotion.id);
  }

  /**
   * Get promotion by ID
   */
  async getPromotion(id: string): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        promotionProducts: true,
        promotionCustomerGroups: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion ${id} not found`);
    }

    return this.mapToPromotionEntity(promotion);
  }

  /**
   * Partial update (admin): lifecycle status only for now.
   */
  async patchPromotion(id: string, dto: PatchPromotionDto): Promise<Promotion> {
    const existing = await this.prisma.promotion.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException(`Promotion ${id} not found`);
    }

    if (existing.status === 'expired') {
      throw new BadRequestException(
        'Expired promotions cannot be changed; create a new promotion or adjust dates first.',
      );
    }

    await this.prisma.promotion.update({
      where: { id },
      data: { status: dto.status },
    });

    return this.getPromotion(id);
  }

  /**
   * Get promotion by code
   */
  async getPromotionByCode(code: string): Promise<Promotion | null> {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      return null;
    }

    const promotion = await this.prisma.promotion.findFirst({
      where: {
        code: { equals: trimmed, mode: 'insensitive' },
      },
      include: {
        promotionProducts: true,
        promotionCustomerGroups: true,
      },
    });

    if (!promotion) {
      return null;
    }

    return this.mapToPromotionEntity(promotion);
  }

  /**
   * Get all active promotions
   */
  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: {
        status: 'active',
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      include: {
        promotionProducts: true,
        promotionCustomerGroups: true,
      },
    });

    return promotions.map((p) => this.mapToPromotionEntity(p));
  }

  /**
   * Apply promotions to cart/checkout
   * @param recordRedemption When true, persist usage, logs, and events (e.g. order confirmed).
   *                        Must be false for checkout/cart total previews so limits are not consumed on each recalculation.
   */
  async applyPromotions(
    dto: ApplyPromotionDto,
    items: CartItem[],
    subtotal: number,
    options?: { recordRedemption?: boolean },
  ): Promise<AppliedPromotion[]> {
    const recordRedemption = options?.recordRedemption === true;
    const appliedPromotions: AppliedPromotion[] = [];
    const activePromotions = await this.getActivePromotions();

    // If coupon code is provided, prioritize that promotion
    let promotionsToCheck = activePromotions;

    if (dto.couponCode) {
      const couponPromotion = await this.getPromotionByCode(dto.couponCode);
      if (couponPromotion && couponPromotion.status === 'active') {
        promotionsToCheck = [couponPromotion, ...activePromotions.filter((p) => p.id !== couponPromotion.id)];
      }
    }

    // Filter by promotion IDs if provided
    if (dto.promotionIds && dto.promotionIds.length > 0) {
      promotionsToCheck = promotionsToCheck.filter((p) => dto.promotionIds!.includes(p.id));
    }

    // Check eligibility and apply promotions
    let remainingSubtotal = subtotal;

    for (const promotion of promotionsToCheck) {
      // Get promotion products for scope calculation
      const promotionProducts = await this.prisma.promotionProduct.findMany({
        where: { promotionId: promotion.id },
      });

      // Get promotion customer groups
      const promotionCustomerGroups = await this.prisma.promotionCustomerGroup.findMany({
        where: { promotionId: promotion.id },
      });

      // Build eligibility context
      const context = {
        subtotal: remainingSubtotal,
        items,
        customerId: dto.customerId,
        customerGroupId: dto.customerGroupId,
        couponCode: dto.couponCode,
      };

      // Build customer group rules
      const customerGroupRules = this.ruleEvaluator.buildCustomerGroupRules(
        promotion,
        promotionCustomerGroups,
      );

      // Evaluate all rules using the rule evaluator
      const eligibility = this.ruleEvaluator.evaluateAllRules(
        promotion,
        context,
        customerGroupRules,
      );

      // Also check other conditions (min order amount, products, categories) using rules engine
      const otherConditionsResult = this.rulesEngine.checkConditions(promotion.conditions, context);
      if (!otherConditionsResult.eligible) {
        continue;
      }

      if (!eligibility.eligible) {
        continue;
      }

      // Get applicable amount
      const applicableAmount = this.rulesEngine.getApplicableAmount(
        promotion,
        items,
        promotionProducts,
      );

      if (applicableAmount <= 0) {
        continue;
      }

      // Calculate discount (free_shipping waives shipping in checkout totals, not as a cart discount)
      const discountAmountRaw = this.rulesEngine.calculateDiscount(
        promotion,
        remainingSubtotal,
        applicableAmount,
      );
      const isFreeShipping = promotion.type === 'free_shipping';
      const discountAmount = isFreeShipping ? 0 : discountAmountRaw;

      if (!isFreeShipping && discountAmount <= 0) {
        continue;
      }

      // Check if can stack with already applied promotions
      if (appliedPromotions.length > 0) {
        const canStack = appliedPromotions.every((applied) =>
          this.ruleEvaluator.canStackPromotions(promotion, applied.promotion),
        );
        if (!canStack && promotion.isExclusive) {
          // Skip if exclusive and others are already applied
          continue;
        }
      }

      // Apply discount (free shipping does not reduce merchandise subtotal)
      if (!isFreeShipping) {
        remainingSubtotal = Math.max(0, remainingSubtotal - discountAmount);
      }

      appliedPromotions.push({
        promotionId: promotion.id,
        promotionCode: promotion.code,
        discountAmount,
        promotion,
      });

      if (recordRedemption) {
        // Log promotion application
        await this.logPromotionApplication({
          promotionId: promotion.id,
          cartId: dto.cartId,
          checkoutId: dto.checkoutId,
          customerId: dto.customerId,
          couponCode: promotion.code,
          discountAmount,
          subtotalBefore: subtotal,
          subtotalAfter: subtotal - appliedPromotions.reduce((sum, p) => sum + p.discountAmount, 0),
          status: 'applied',
        });

        // Increment usage count
        await this.prisma.promotion.update({
          where: { id: promotion.id },
          data: {
            currentUsage: { increment: 1 },
          },
        });

        // Emit events
        this.eventEmitter.emit(
          'promotion.applied',
          new PromotionAppliedEvent(
            promotion.id,
            promotion.code,
            discountAmount,
            subtotal,
            remainingSubtotal,
            dto.cartId,
            dto.checkoutId,
            undefined,
            dto.customerId,
          ),
        );

        if (promotion.code) {
          this.eventEmitter.emit(
            'coupon.used',
            new CouponUsedEvent(
              promotion.id,
              promotion.code,
              discountAmount,
              dto.cartId,
              dto.checkoutId,
              undefined,
              dto.customerId,
            ),
          );
        }
      }

      // If exclusive, stop applying more promotions
      if (promotion.isExclusive) {
        break;
      }
    }

    return appliedPromotions;
  }

  /**
   * Validate promotion eligibility
   */
  async validatePromotion(dto: ValidatePromotionDto): Promise<{
    eligible: boolean;
    reason?: string;
    discountAmount?: number;
  }> {
    const promotion = await this.getPromotion(dto.promotionId);

    // Get promotion customer groups
    const promotionCustomerGroups = await this.prisma.promotionCustomerGroup.findMany({
      where: { promotionId: promotion.id },
    });

    const context = {
      subtotal: dto.subtotal,
      items: dto.items,
      customerId: dto.customerId,
      customerGroupId: dto.customerGroupId,
      couponCode: dto.couponCode,
    };

    // Build customer group rules
    const customerGroupRules = this.ruleEvaluator.buildCustomerGroupRules(
      promotion,
      promotionCustomerGroups,
    );

    // Evaluate all rules using the rule evaluator
    const eligibility = this.ruleEvaluator.evaluateAllRules(
      promotion,
      context,
      customerGroupRules,
    );

    // Also check other conditions (min order amount, products, categories) using rules engine
    const otherConditionsResult = this.rulesEngine.checkConditions(promotion.conditions, context);
    if (!otherConditionsResult.eligible) {
      return otherConditionsResult;
    }

    if (!eligibility.eligible) {
      return eligibility;
    }

    // Get promotion products
    const promotionProducts = await this.prisma.promotionProduct.findMany({
      where: { promotionId: promotion.id },
    });

    // Calculate discount
    const applicableAmount = this.rulesEngine.getApplicableAmount(
      promotion,
      dto.items,
      promotionProducts,
    );

    const discountAmount = this.rulesEngine.calculateDiscount(
      promotion,
      dto.subtotal,
      applicableAmount,
    );

    return {
      eligible: true,
      discountAmount,
    };
  }

  /**
   * Log promotion application
   */
  private async logPromotionApplication(data: {
    promotionId: string;
    cartId?: string;
    checkoutId?: string;
    orderId?: string;
    customerId?: string;
    couponCode: string | null;
    discountAmount: number;
    subtotalBefore: number;
    subtotalAfter: number;
    status: 'applied' | 'expired' | 'failed';
  }): Promise<PromotionLog> {
    const log = await this.prisma.promotionLog.create({
      data: {
        promotionId: data.promotionId,
        cartId: data.cartId || null,
        checkoutId: data.checkoutId || null,
        orderId: data.orderId || null,
        customerId: data.customerId || null,
        couponCode: data.couponCode || null,
        discountAmount: data.discountAmount,
        subtotalBefore: data.subtotalBefore,
        subtotalAfter: data.subtotalAfter,
        status: data.status,
        metadata: {},
      },
    });

    return this.mapToPromotionLogEntity(log);
  }

  /**
   * Expire promotions that have passed their end date
   */
  async expirePromotions(): Promise<void> {
    const now = new Date();
    const expiredPromotions = await this.prisma.promotion.findMany({
      where: {
        status: 'active',
        endDate: {
          lt: now,
        },
      },
    });

    for (const promotion of expiredPromotions) {
      await this.prisma.promotion.update({
        where: { id: promotion.id },
        data: { status: 'expired' },
      });

      this.eventEmitter.emit(
        'promotion.expired',
        new PromotionExpiredEvent(promotion.id, promotion.code),
      );

      this.logger.log(`Expired promotion: ${promotion.id} (${promotion.code || 'N/A'})`);
    }
  }

  /**
   * Get promotion logs
   */
  async getPromotionLogs(
    promotionId?: string,
    cartId?: string,
    checkoutId?: string,
    orderId?: string,
  ): Promise<PromotionLog[]> {
    const where: any = {};

    if (promotionId) {
      where.promotionId = promotionId;
    }
    if (cartId) {
      where.cartId = cartId;
    }
    if (checkoutId) {
      where.checkoutId = checkoutId;
    }
    if (orderId) {
      where.orderId = orderId;
    }

    const logs = await this.prisma.promotionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => this.mapToPromotionLogEntity(log));
  }

  /**
   * Map Prisma promotion to entity
   */
  private mapToPromotionEntity(promotion: any): Promotion {
    return {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      status: promotion.status,
      discountValue: promotion.discountValue ? parseFloat(promotion.discountValue.toString()) : null,
      discountType: promotion.discountType,
      scope: promotion.scope,
      isStackable: promotion.isStackable,
      isExclusive: promotion.isExclusive,
      appliesToAllGroups: promotion.appliesToAllGroups ?? false,
      conditions: promotion.conditions as any,
      usageLimit: promotion.usageLimit,
      usageLimitPerUser: promotion.usageLimitPerUser,
      currentUsage: promotion.currentUsage,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      metadata: promotion.metadata,
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
    };
  }

  /**
   * Map Prisma promotion log to entity
   */
  private mapToPromotionLogEntity(log: any): PromotionLog {
    return {
      id: log.id,
      promotionId: log.promotionId,
      cartId: log.cartId,
      checkoutId: log.checkoutId,
      orderId: log.orderId,
      customerId: log.customerId,
      couponCode: log.couponCode,
      discountAmount: parseFloat(log.discountAmount.toString()),
      subtotalBefore: parseFloat(log.subtotalBefore.toString()),
      subtotalAfter: parseFloat(log.subtotalAfter.toString()),
      status: log.status,
      metadata: log.metadata,
      createdAt: log.createdAt,
    };
  }
}

