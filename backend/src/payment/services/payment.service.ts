import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../catalog/services/prisma.service';
import { PaymentFactory } from './payment.factory';
import {
  CreateIntentParams,
  PaymentIntentResult,
  PaymentStatus,
  PaymentProviderCode,
  PaymentFlowType,
} from '../types/payment.types';
import {
  PaymentCapturedEvent,
  PaymentFailedEvent,
} from '../../order/events/order.events';
import { randomUUID } from 'crypto';
import { CreateAdminPaymentMethodDto } from '../dto/create-admin-payment-method.dto';
import { UpdateAdminPaymentMethodDto } from '../dto/update-admin-payment-method.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentFactory: PaymentFactory,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create payment intent for an order
   */
  async createIntentAuthorized(
    orderId: string,
    paymentMethodCode: string,
    returnUrl?: string,
    cancelUrl?: string,
    actor?: {
      typ: 'admin' | 'customer';
      customerId?: string;
      adminUserId?: string;
    } | null,
    guestEmail?: string,
  ): Promise<PaymentIntentResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (actor?.typ === 'admin') {
      // staff may create intents for any order
    } else if (actor?.typ === 'customer') {
      if (order.customerId && order.customerId !== actor.customerId) {
        throw new ForbiddenException('You do not have access to this order');
      }
    } else {
      const normalizedGuest = (guestEmail || '').trim().toLowerCase();
      const orderEmail = (order.customerEmail || '').trim().toLowerCase();
      if (!normalizedGuest || normalizedGuest !== orderEmail) {
        throw new ForbiddenException(
          'Customer email must match the order to create a payment intent',
        );
      }
    }

    return this.createIntent(orderId, paymentMethodCode, returnUrl, cancelUrl);
  }

  /**
   * Create payment intent for an order
   */
  async createIntent(
    orderId: string,
    paymentMethodCode: string,
    returnUrl?: string,
    cancelUrl?: string,
  ): Promise<PaymentIntentResult> {
    // Load order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Load payment method
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { code: paymentMethodCode },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment method '${paymentMethodCode}' not found`,
      );
    }

    if (!paymentMethod.isActive) {
      throw new BadRequestException(
        `Payment method '${paymentMethodCode}' is not active`,
      );
    }

    // COD-specific validation
    if (paymentMethod.provider === PaymentProviderCode.COD) {
      await this.validateCOD(order, paymentMethod);
    }

    // Get provider
    const provider = this.paymentFactory.getProvider(paymentMethod.provider);

    // Verify flow type matches
    if (provider.getFlowType() !== paymentMethod.flowType) {
      throw new BadRequestException(
        `Provider flow type mismatch: expected ${paymentMethod.flowType}, got ${provider.getFlowType()}`,
      );
    }

    // Create intent via provider
    const createParams: CreateIntentParams = {
      orderId,
      amount: Number(order.grandTotal),
      currency: order.currency,
      customerEmail: order.customerEmail,
      customerName: order.customerName || undefined,
      metadata: {
        orderNumber: order.orderNumber,
      },
      returnUrl,
      cancelUrl,
    };

    const intentResult = await provider.createIntent(createParams, {
      id: paymentMethod.id,
      code: paymentMethod.code,
      provider: paymentMethod.provider,
      flowType: paymentMethod.flowType as any,
      config: paymentMethod.config as Record<string, any>,
    });

    // Create payment record
    // For COD, gatewayTransactionId is optional but we still create one for tracking
    const payment = await this.prisma.payment.create({
      data: {
        id: randomUUID(),
        orderId,
        paymentMethodId: paymentMethod.id,
        status: PaymentStatus.PENDING,
        flowType: paymentMethod.flowType,
        amount: order.grandTotal,
        currency: order.currency,
        gatewayTransactionId: intentResult.gatewayTransactionId || null,
        clientSecret: intentResult.clientSecret || null,
        redirectUrl: intentResult.redirectUrl || null,
        gatewayResponse: intentResult.metadata || {},
      },
    });

    this.logger.log(
      `Payment intent created: ${payment.id} for order ${orderId} using ${paymentMethodCode}`,
    );

    // Canonical enum for API clients; `type` matches storefront lifecycle aliases.
    const flowType = intentResult.flowType;
    return {
      paymentId: payment.id,
      gatewayTransactionId: intentResult.gatewayTransactionId,
      flowType,
      type: this.mapFlowTypeToFrontendType(String(flowType)),
      clientSecret: intentResult.clientSecret,
      redirectUrl: intentResult.redirectUrl,
      metadata: intentResult.metadata,
    };
  }

  /**
   * Verify callback from payment gateway
   */
  async verifyCallback(
    providerCode: string,
    callbackData: Record<string, any>,
    verificationContext?: { rawBody?: Buffer; signature?: string },
  ): Promise<void> {
    // Load payment method
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { code: providerCode },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method '${providerCode}' not found`);
    }

    // Get provider
    const provider = this.paymentFactory.getProvider(paymentMethod.provider);

    // Verify callback
    const verificationResult = await provider.verifyCallback(
      callbackData,
      {
        id: paymentMethod.id,
        code: paymentMethod.code,
        provider: paymentMethod.provider,
        flowType: paymentMethod.flowType as any,
        config: paymentMethod.config as Record<string, any>,
      },
      verificationContext,
    );

    if (!verificationResult.isValid) {
      this.logger.warn(
        `Invalid callback from ${providerCode}: ${verificationResult.error}`,
      );
      throw new BadRequestException(
        `Invalid callback: ${verificationResult.error || 'Verification failed'}`,
      );
    }

    // Find payment by gateway transaction ID
    const payment = await this.prisma.payment.findFirst({
      where: {
        gatewayTransactionId: verificationResult.gatewayTransactionId,
        paymentMethodId: paymentMethod.id,
      },
      include: {
        paymentMethod: true,
      },
    });

    if (!payment) {
      this.logger.error(
        `Payment not found for gateway transaction: ${verificationResult.gatewayTransactionId}`,
      );
      throw new NotFoundException('Payment not found');
    }

    // Verify amount matches
    if (Number(payment.amount) !== verificationResult.amount) {
      this.logger.error(
        `Amount mismatch for payment ${payment.id}: expected ${payment.amount}, got ${verificationResult.amount}`,
      );
      throw new BadRequestException('Payment amount mismatch');
    }

    // Verify currency matches
    if (payment.currency !== verificationResult.currency) {
      this.logger.error(
        `Currency mismatch for payment ${payment.id}: expected ${payment.currency}, got ${verificationResult.currency}`,
      );
      throw new BadRequestException('Payment currency mismatch');
    }

    // Update payment record (idempotent - only update if status is pending/processing)
    if (
      payment.status === PaymentStatus.PENDING ||
      payment.status === PaymentStatus.PROCESSING
    ) {
      const updateData: any = {
        status: verificationResult.status,
        gatewayResponse: verificationResult.gatewayResponse,
        updatedAt: new Date(),
      };

      if (verificationResult.status === PaymentStatus.CAPTURED) {
        updateData.capturedAt = new Date();
      } else if (verificationResult.status === PaymentStatus.FAILED) {
        updateData.failedAt = new Date();
      }

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: updateData,
      });

      // Emit events
      if (verificationResult.status === PaymentStatus.CAPTURED) {
        this.eventEmitter.emit(
          'payment.captured',
          new PaymentCapturedEvent(
            payment.orderId,
            payment.id,
            verificationResult.amount,
          ),
        );
        this.logger.log(
          `Payment ${payment.id} captured for order ${payment.orderId}`,
        );
      } else if (verificationResult.status === PaymentStatus.FAILED) {
        this.eventEmitter.emit(
          'payment.failed',
          new PaymentFailedEvent(
            payment.orderId,
            payment.id,
            verificationResult.error,
          ),
        );
        this.logger.log(
          `Payment ${payment.id} failed for order ${payment.orderId}: ${verificationResult.error}`,
        );
      }
    } else {
      this.logger.warn(
        `Payment ${payment.id} already processed with status ${payment.status}, ignoring callback`,
      );
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        paymentMethod: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    return payment;
  }

  async getPaymentAuthorized(
    paymentId: string,
    actor?: { typ: 'admin' | 'customer'; customerId?: string },
  ) {
    const payment = await this.getPayment(paymentId);
    if (!actor) {
      throw new ForbiddenException('Authentication required');
    }
    if (actor.typ === 'admin') {
      return payment;
    }
    const order = await this.prisma.order.findUnique({
      where: { id: payment.orderId },
      select: { customerId: true },
    });
    if (!order || order.customerId !== actor.customerId) {
      throw new ForbiddenException('You do not have access to this payment');
    }
    return payment;
  }

  /**
   * Get payments for an order
   */
  async getPaymentsByOrder(orderId: string) {
    return this.prisma.payment.findMany({
      where: { orderId },
      include: {
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentsByOrderAuthorized(
    orderId: string,
    actor?: { typ: 'admin' | 'customer'; customerId?: string },
  ) {
    if (!actor) {
      throw new ForbiddenException('Authentication required');
    }
    if (actor.typ === 'admin') {
      return this.getPaymentsByOrder(orderId);
    }
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });
    if (!order || order.customerId !== actor.customerId) {
      throw new ForbiddenException('You do not have access to these payments');
    }
    return this.getPaymentsByOrder(orderId);
  }

  async getPaymentsForTracking(orderNumber: string, email: string) {
    const normalizedOrderNumber = (orderNumber || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedOrderNumber || !normalizedEmail) {
      throw new BadRequestException('orderNumber and email are required');
    }
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: normalizedOrderNumber },
      select: { id: true, customerEmail: true, customerId: true },
    });
    if (!order) {
      throw new NotFoundException(`Order ${normalizedOrderNumber} not found`);
    }

    let emailMatches =
      (order.customerEmail || '').trim().toLowerCase() === normalizedEmail;
    if (!emailMatches && order.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: order.customerId },
        select: { email: true },
      });
      emailMatches =
        (customer?.email || '').trim().toLowerCase() === normalizedEmail;
    }

    if (!emailMatches) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return this.getPaymentsByOrder(order.id);
  }

  /**
   * Validate COD payment eligibility
   * - Check if payment method is active (already checked)
   * - Check order total against COD limit
   * - Optional: Check customer risk (phone verification, RTO history)
   */
  private async validateCOD(order: any, paymentMethod: any): Promise<void> {
    const codConfig = (paymentMethod.config as Record<string, any>) || {};
    const codLimit = codConfig.maxAmount || codConfig.codLimit || 10000; // Default 10,000

    // Check order total against COD limit
    const orderTotal = Number(order.grandTotal);
    if (orderTotal > codLimit) {
      throw new BadRequestException(
        `Order total (${orderTotal}) exceeds COD limit (${codLimit}). Please use an online payment method.`,
      );
    }

    // Optional: Check customer risk
    if (codConfig.enableRiskChecks !== false) {
      await this.checkCODRisk(order);
    }

    this.logger.log(
      `COD validation passed for order ${order.id}: amount ${orderTotal} within limit ${codLimit}`,
    );
  }

  /**
   * Check COD risk factors
   * - Phone verification (optional)
   * - RTO history
   * - High-risk user blocking
   */
  private async checkCODRisk(order: any): Promise<void> {
    // Check for repeated RTOs (Return to Origin)
    if (order.customerId) {
      // Find all orders for this customer
      const customerOrders = await this.prisma.order.findMany({
        where: {
          customerId: order.customerId,
        },
        select: {
          id: true,
        },
      });

      const orderIds = customerOrders.map((o) => o.id);

      if (orderIds.length > 0) {
        const rtoCount = await this.prisma.payment.count({
          where: {
            orderId: {
              in: orderIds,
            },
            paymentMethod: {
              provider: PaymentProviderCode.COD,
            },
            status: PaymentStatus.FAILED,
            failedAt: {
              // Last 90 days
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },
        });

        // Block if more than 3 RTOs in last 90 days
        if (rtoCount >= 3) {
          this.logger.warn(
            `High-risk customer ${order.customerId} blocked from COD: ${rtoCount} RTOs in last 90 days`,
          );
          throw new BadRequestException(
            'COD is not available due to previous delivery issues. Please use an online payment method.',
          );
        }
      }
    }

    // Optional: Phone verification check
    // This would require customer phone number in order metadata
    // For now, we'll just log if phone verification is required
    if (order.metadata && typeof order.metadata === 'object') {
      const metadata = order.metadata as Record<string, any>;
      if (metadata.requirePhoneVerification && !metadata.phoneVerified) {
        this.logger.warn(
          `Order ${order.id} requires phone verification for COD`,
        );
        // In production, you might want to throw an error or require verification
      }
    }
  }

  /**
   * Mark COD payment as collected (after successful delivery)
   * Called by admin/logistics when payment is collected
   */
  async markCODAsCollected(paymentId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        paymentMethod: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.paymentMethod.provider !== PaymentProviderCode.COD) {
      throw new BadRequestException(
        `Payment ${paymentId} is not a COD payment`,
      );
    }

    // Only allow transition from pending to captured
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        `Cannot mark payment as collected: current status is ${payment.status}. Only pending COD payments can be collected.`,
      );
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CAPTURED,
        capturedAt: new Date(),
        gatewayResponse: {
          ...((payment.gatewayResponse as Record<string, any>) || {}),
          collectedAt: new Date().toISOString(),
          collectedBy: 'admin', // In production, use actual admin user ID
        },
      },
    });

    // Emit payment captured event
    this.eventEmitter.emit(
      'payment.captured',
      new PaymentCapturedEvent(
        payment.orderId,
        payment.id,
        Number(payment.amount),
      ),
    );

    this.logger.log(
      `COD payment ${paymentId} marked as collected for order ${payment.orderId}`,
    );
  }

  /**
   * Mark COD payment as failed (RTO - Return to Origin)
   * Called by admin/logistics when delivery fails
   */
  async markCODAsFailed(paymentId: string, reason?: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        paymentMethod: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.paymentMethod.provider !== PaymentProviderCode.COD) {
      throw new BadRequestException(
        `Payment ${paymentId} is not a COD payment`,
      );
    }

    // Only allow transition from pending to failed
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        `Cannot mark payment as failed: current status is ${payment.status}. Only pending COD payments can be marked as failed.`,
      );
    }

    const failureReason = reason || 'RTO - Return to Origin';

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
        gatewayResponse: {
          ...((payment.gatewayResponse as Record<string, any>) || {}),
          failedAt: new Date().toISOString(),
          failureReason: failureReason,
          failedBy: 'admin', // In production, use actual admin user ID
        },
      },
    });

    // Emit payment failed event
    this.eventEmitter.emit(
      'payment.failed',
      new PaymentFailedEvent(payment.orderId, payment.id, failureReason),
    );

    this.logger.log(
      `COD payment ${paymentId} marked as failed (RTO) for order ${payment.orderId}: ${failureReason}`,
    );
  }

  /**
   * Get COD payments that are pending collection
   * Useful for logistics/admin dashboard
   */
  async getPendingCODPayments() {
    return this.prisma.payment.findMany({
      where: {
        paymentMethod: {
          provider: PaymentProviderCode.COD,
        },
        status: PaymentStatus.PENDING,
      },
      include: {
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get active payment methods
   * Returns all active payment methods available for checkout
   */
  async getActivePaymentMethods() {
    const methods = await this.prisma.paymentMethod.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        provider: true,
        flowType: true,
        metadata: true,
      },
      orderBy: [
        // Prioritize COD first
        {
          provider: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });

    return methods.map((method) => ({
      code: method.code,
      name: method.name,
      provider: method.provider,
      flowType: method.flowType,
      type: this.mapFlowTypeToFrontendType(method.flowType),
      metadata: method.metadata,
    }));
  }

  /**
   * Map backend flow type to frontend type
   */
  private mapFlowTypeToFrontendType(flowType: string): string {
    const mapping: Record<string, string> = {
      CLIENT_SECRET: 'client_side',
      REDIRECT: 'redirect',
      HOSTED_PAGE: 'hosted',
      OFFLINE: 'offline',
    };
    return mapping[flowType] || flowType.toLowerCase();
  }

  private assertProviderFlowMatch(
    providerCode: string,
    flowType: string,
  ): void {
    const provider = this.paymentFactory.getProvider(providerCode);
    const expected = provider.getFlowType();
    if (expected !== flowType) {
      throw new BadRequestException(
        `flowType must be ${expected} for provider '${providerCode}'`,
      );
    }
  }

  /**
   * Admin: list payment methods (includes inactive when requested)
   */
  async listPaymentMethodsAdmin(includeInactive: boolean) {
    return this.prisma.paymentMethod.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ provider: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Admin: get one payment method by id
   */
  async getPaymentMethodAdmin(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!method) {
      throw new NotFoundException(`Payment method ${id} not found`);
    }
    return method;
  }

  /**
   * Admin: create payment method row (checkout uses `code` as paymentMethodCode)
   */
  async createPaymentMethodAdmin(dto: CreateAdminPaymentMethodDto) {
    const code = dto.code.toLowerCase().trim();
    this.assertProviderFlowMatch(dto.provider, dto.flowType);
    try {
      return await this.prisma.paymentMethod.create({
        data: {
          code,
          name: dto.name.trim(),
          provider: dto.provider.toLowerCase(),
          flowType: dto.flowType,
          isActive: dto.isActive ?? true,
          config: (dto.config ?? {}) as object,
          metadata: (dto.metadata ?? {}) as object,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Payment method code already exists');
      }
      throw e;
    }
  }

  /**
   * Admin: update payment method
   */
  async updatePaymentMethodAdmin(id: string, dto: UpdateAdminPaymentMethodDto) {
    const existing = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Payment method ${id} not found`);
    }

    const provider = dto.provider ?? existing.provider;
    const flowType = dto.flowType ?? existing.flowType;
    if (dto.provider !== undefined || dto.flowType !== undefined) {
      this.assertProviderFlowMatch(provider, flowType);
    }

    const code =
      dto.code !== undefined ? dto.code.toLowerCase().trim() : undefined;

    try {
      return await this.prisma.paymentMethod.update({
        where: { id },
        data: {
          ...(code !== undefined && { code }),
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(dto.provider !== undefined && {
            provider: dto.provider.toLowerCase(),
          }),
          ...(dto.flowType !== undefined && { flowType: dto.flowType }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.config !== undefined && { config: dto.config as object }),
          ...(dto.metadata !== undefined && {
            metadata: dto.metadata as object,
          }),
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Payment method code already exists');
      }
      throw e;
    }
  }

  /**
   * Admin: delete payment method (blocked when payments exist)
   */
  async deletePaymentMethodAdmin(id: string): Promise<void> {
    await this.getPaymentMethodAdmin(id);
    const count = await this.prisma.payment.count({
      where: { paymentMethodId: id },
    });
    if (count > 0) {
      throw new ConflictException(
        'Cannot delete payment method: existing payments reference it',
      );
    }
    await this.prisma.paymentMethod.delete({ where: { id } });
  }

  /**
   * Handle order delivered - capture COD payments
   * Called when order fulfillment status changes to 'delivered'
   */
  async handleOrderDelivered(orderId: string): Promise<void> {
    this.logger.log(`Handling order delivered for order ${orderId}`);

    // Get all payments for this order
    const payments = await this.getPaymentsByOrder(orderId);

    // Find pending COD payments
    const pendingCODPayments = payments.filter(
      (p) =>
        p.paymentMethod.provider === PaymentProviderCode.COD &&
        p.status === PaymentStatus.PENDING,
    );

    if (pendingCODPayments.length === 0) {
      this.logger.debug(`No pending COD payments found for order ${orderId}`);
      return;
    }

    // Mark each pending COD payment as collected
    for (const payment of pendingCODPayments) {
      try {
        await this.markCODAsCollected(payment.id);
        this.logger.log(
          `COD payment ${payment.id} captured after order ${orderId} delivery`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to capture COD payment ${payment.id} for order ${orderId}:`,
          error,
        );
        // Continue with other payments
      }
    }
  }
}
