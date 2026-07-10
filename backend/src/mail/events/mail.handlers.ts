import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../catalog/services/prisma.service';
import { EmailService } from '../email.service';
import {
  OrderCreatedEvent,
  OrderCancelledEvent,
} from '../../order/events/order.events';
import { decimalToNumber } from '../utils/format-currency';
import type {
  OrderCancellationEmailDetails,
  OrderEmailDetails,
} from '../types/email.types';

@Injectable()
export class MailEventHandlers {
  private readonly logger = new Logger(MailEventHandlers.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private buildOrderEmailDetails(order: {
    id: string;
    orderNumber: string;
    customerEmail: string;
    customerName: string | null;
    currency: string;
    subtotal: unknown;
    discountTotal: unknown;
    shippingTotal: unknown;
    taxTotal: unknown;
    grandTotal: unknown;
    createdAt: Date;
    paymentStatus: string | null;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: unknown;
      rowTotal: unknown;
    }>;
  }): OrderEmailDetails {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      currency: order.currency,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: decimalToNumber(item.unitPrice),
        lineTotal: decimalToNumber(item.rowTotal),
      })),
      subtotal: decimalToNumber(order.subtotal),
      discountTotal: decimalToNumber(order.discountTotal),
      shippingTotal: decimalToNumber(order.shippingTotal),
      taxTotal: decimalToNumber(order.taxTotal),
      grandTotal: decimalToNumber(order.grandTotal),
      placedAt: order.createdAt,
    };
  }

  private resolveRefundStatus(paymentStatus: string | null): {
    refundStatus: OrderCancellationEmailDetails['refundStatus'];
    refundMessage: string;
  } {
    if (paymentStatus === 'paid' || paymentStatus === 'captured') {
      return {
        refundStatus: 'refund_pending',
        refundMessage:
          'Your payment was received. A refund is being processed and should appear on your original payment method within 5–10 business days.',
      };
    }

    if (paymentStatus === 'pending' || paymentStatus === 'authorized') {
      return {
        refundStatus: 'not_charged',
        refundMessage:
          'No payment was captured for this order. You will not be charged.',
      };
    }

    return {
      refundStatus: 'no_refund_required',
      refundMessage:
        'No refund is required for this order based on its payment status.',
    };
  }

  @OnEvent('order.domain.created')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: event.orderId },
        include: { items: true },
      });

      if (!order?.customerEmail) {
        this.logger.warn(
          `Order ${event.orderId} has no customer email; skipping placement email`,
        );
        return;
      }

      const orderDetails = this.buildOrderEmailDetails(order);
      await this.emailService.sendOrderPlacementEmail(
        order.customerEmail,
        orderDetails,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send order placement email for ${event.orderId}: ${message}`,
      );
    }
  }

  @OnEvent('order.cancelled')
  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: event.orderId },
        include: { items: true },
      });

      if (!order?.customerEmail) {
        this.logger.warn(
          `Order ${event.orderId} has no customer email; skipping cancellation email`,
        );
        return;
      }

      const baseDetails = this.buildOrderEmailDetails(order);
      const { refundStatus, refundMessage } = this.resolveRefundStatus(
        order.paymentStatus,
      );

      const cancellationDetails: OrderCancellationEmailDetails = {
        ...baseDetails,
        cancelledAt: order.cancelledAt ?? new Date(),
        reason: event.reason,
        refundStatus,
        refundMessage,
      };

      await this.emailService.sendOrderCancellationEmail(
        order.customerEmail,
        cancellationDetails,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send order cancellation email for ${event.orderId}: ${message}`,
      );
    }
  }
}
