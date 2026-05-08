import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../catalog/services/prisma.service';
import { BillingCycle } from './enums/billing-cycle.enum';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { SubscriptionPaymentStatus } from './enums/subscription-payment-status.enum';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { ChangeSubscriptionPlanDto } from './dto/change-subscription-plan.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  listAdminPlans() {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { createdAt: 'desc' } });
  }

  listPublicPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ price: 'asc' }, { createdAt: 'desc' }],
    });
  }

  createPlan(dto: CreateSubscriptionPlanDto) {
    return this.prisma.subscriptionPlan.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updatePlan(id: string, dto: UpdateSubscriptionPlanDto) {
    await this.getPlanById(id);
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto,
    });
  }

  async deletePlan(id: string) {
    await this.getPlanById(id);
    const linkedSubscriptions = await this.prisma.subscription.count({
      where: { planId: id },
    });
    if (linkedSubscriptions > 0) {
      throw new ConflictException('Cannot delete a plan that has subscriptions');
    }
    await this.prisma.subscriptionPlan.delete({ where: { id } });
  }

  async subscribe(customerId: string, dto: SubscribeDto) {
    const plan = await this.getPlanById(dto.planId);
    if (!plan.isActive) {
      throw new BadRequestException('Selected plan is inactive');
    }

    const existing = await this.getCurrentSubscription(customerId);
    if (existing) {
      throw new ConflictException('Customer already has an active subscription');
    }

    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, plan.billingCycle as BillingCycle);

    const subscription = await this.prisma.$transaction(async (tx) => {
      const created = await tx.subscription.create({
        data: {
          customerId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          autoRenew: dto.autoRenew ?? true,
        },
      });

      await tx.subscriptionPayment.create({
        data: {
          subscriptionId: created.id,
          amount: plan.price,
          status: SubscriptionPaymentStatus.SUCCESS,
          paymentMethod: dto.paymentMethod ?? 'MANUAL',
          transactionRef: dto.transactionRef ?? null,
          action: 'CREATE',
        },
      });
      return created;
    });

    this.eventEmitter.emit('subscription.created', {
      subscriptionId: subscription.id,
      customerId,
      planId: plan.id,
    });

    return this.getSubscriptionById(subscription.id);
  }

  async mySubscription(customerId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        customerId,
        status: {
          in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAUSED,
            SubscriptionStatus.PENDING_PAYMENT,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!subscription) return null;
    return subscription;
  }

  async cancel(customerId: string) {
    const subscription = await this.requireActiveLikeSubscription(customerId);
    if (subscription.status === SubscriptionStatus.CANCELED) {
      return subscription;
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        autoRenew: false,
        canceledAt: new Date(),
      },
    });

    await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: updated.id,
        amount: 0,
        status: SubscriptionPaymentStatus.SUCCESS,
        paymentMethod: 'SYSTEM',
        transactionRef: null,
        action: 'CANCEL',
      },
    });

    this.eventEmitter.emit('subscription.canceled', {
      subscriptionId: updated.id,
      customerId,
    });

    return this.getSubscriptionById(updated.id);
  }

  async renew(customerId: string, dto: RenewSubscriptionDto) {
    const subscription = await this.requireAnySubscription(customerId);
    const plan = await this.getPlanById(subscription.planId);

    const baseDate =
      subscription.endDate && new Date(subscription.endDate) > new Date()
        ? new Date(subscription.endDate)
        : new Date();
    const newEndDate = this.calculateEndDate(baseDate, plan.billingCycle as BillingCycle);

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          endDate: newEndDate,
          autoRenew: true,
        },
      });
      await tx.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.price,
          status: SubscriptionPaymentStatus.SUCCESS,
          paymentMethod: dto.paymentMethod ?? 'MANUAL',
          transactionRef: dto.transactionRef ?? null,
          action: 'RENEW',
        },
      });
      return next;
    });

    return this.getSubscriptionById(updated.id);
  }

  async changePlan(customerId: string, dto: ChangeSubscriptionPlanDto) {
    const subscription = await this.requireActiveLikeSubscription(customerId);
    const nextPlan = await this.getPlanById(dto.planId);
    if (!nextPlan.isActive) throw new BadRequestException('Selected plan is inactive');
    if (subscription.planId === nextPlan.id) {
      throw new BadRequestException('Subscription is already on this plan');
    }

    const currentPlan = await this.getPlanById(subscription.planId);
    const proratedAmount = this.calculateProratedDifference(
      Number(currentPlan.price),
      Number(nextPlan.price),
      new Date(subscription.endDate),
    );

    const now = new Date();
    const newEndDate = this.calculateEndDate(now, nextPlan.billingCycle as BillingCycle);

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: nextPlan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: now,
          endDate: newEndDate,
        },
      });
      await tx.subscriptionPayment.create({
        data: {
          subscriptionId: next.id,
          amount: proratedAmount,
          status: SubscriptionPaymentStatus.SUCCESS,
          paymentMethod: dto.paymentMethod ?? 'MANUAL',
          transactionRef: dto.transactionRef ?? null,
          action: 'CHANGE_PLAN',
        },
      });
      return next;
    });

    return this.getSubscriptionById(updated.id);
  }

  async pause(customerId: string) {
    const subscription = await this.requireActiveLikeSubscription(customerId);
    if (subscription.status === SubscriptionStatus.PAUSED) return subscription;
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.PAUSED },
    });
    return this.getSubscriptionById(subscription.id);
  }

  async resume(customerId: string) {
    const subscription = await this.requireAnySubscription(customerId);
    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestException('Only paused subscriptions can be resumed');
    }
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.ACTIVE },
    });
    return this.getSubscriptionById(subscription.id);
  }

  handleWebhook(payload: Record<string, unknown>) {
    return {
      received: true,
      message: 'Subscription payment webhook placeholder',
      payload,
    };
  }

  private async getPlanById(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`Subscription plan ${planId} not found`);
    return plan;
  }

  private async getCurrentSubscription(customerId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        customerId,
        status: {
          in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAUSED,
            SubscriptionStatus.PENDING_PAYMENT,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async requireActiveLikeSubscription(customerId: string) {
    const subscription = await this.getCurrentSubscription(customerId);
    if (!subscription) throw new NotFoundException('No active subscription found');
    return subscription;
  }

  private async requireAnySubscription(customerId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  private async getSubscriptionById(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  private calculateEndDate(startDate: Date, billingCycle: BillingCycle) {
    const endDate = new Date(startDate);
    if (billingCycle === BillingCycle.YEARLY) {
      endDate.setFullYear(endDate.getFullYear() + 1);
      return endDate;
    }
    endDate.setMonth(endDate.getMonth() + 1);
    return endDate;
  }

  /**
   * Basic proration: charge/credit difference weighted by remaining ratio in current period.
   */
  private calculateProratedDifference(
    currentPlanPrice: number,
    nextPlanPrice: number,
    currentEndDate: Date,
  ) {
    const now = new Date();
    const msRemaining = Math.max(0, currentEndDate.getTime() - now.getTime());
    const msInMonth = 30 * 24 * 60 * 60 * 1000;
    const remainingRatio = Math.min(1, msRemaining / msInMonth);
    const priceDelta = nextPlanPrice - currentPlanPrice;
    return Number((priceDelta * remainingRatio).toFixed(2));
  }
}
