import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { OrderStatus } from '../../order/enums/order-status.enum';

export type OrderSummaryReportRow = {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string;
  orderNumber: string;
  totalItemsCount: number;
  orderTotal: number;
  orderStatus: string;
  paymentStatus: string;
  completionStatus: string;
  currency: string;
  createdAt: string;
};

export type ItemBreakdownReportRow = {
  orderNumber: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  rowTotal: number;
  orderTotal: number;
  currency: string;
  createdAt: string;
};

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderSummary(
    startDate?: string,
    endDate?: string,
  ): Promise<OrderSummaryReportRow[]> {
    const createdAt = this.buildCreatedAtFilter(startDate, endDate);
    const orders = await this.prisma.order.findMany({
      where: createdAt ? { createdAt } : undefined,
      include: {
        items: { select: { quantity: true } },
        customer: { select: { phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => {
      const totalItemsCount = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      return {
        customerName: order.customerName?.trim() || order.customerEmail,
        customerEmail: order.customerEmail,
        customerPhone: this.resolvePhone(order),
        shippingAddress: this.formatAddress(order.shippingAddress),
        orderNumber: order.orderNumber,
        totalItemsCount,
        orderTotal: Number(order.grandTotal),
        orderStatus: order.status,
        paymentStatus: order.paymentStatus ?? 'pending',
        completionStatus: this.completionStatus(
          order.status,
          order.fulfillmentStatus,
        ),
        currency: order.currency,
        createdAt: order.createdAt.toISOString(),
      };
    });
  }

  async getItemBreakdown(
    startDate?: string,
    endDate?: string,
  ): Promise<ItemBreakdownReportRow[]> {
    const createdAt = this.buildCreatedAtFilter(startDate, endDate);
    const items = await this.prisma.orderItem.findMany({
      where: createdAt ? { order: { createdAt } } : undefined,
      include: {
        order: {
          select: {
            orderNumber: true,
            grandTotal: true,
            currency: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      orderNumber: item.order.orderNumber,
      itemName: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      rowTotal: Number(item.rowTotal),
      orderTotal: Number(item.order.grandTotal),
      currency: item.order.currency,
      createdAt: item.order.createdAt.toISOString(),
    }));
  }

  private completionStatus(
    status: string,
    fulfillmentStatus: string | null,
  ): string {
    if (status === OrderStatus.CANCELLED) return 'cancelled';
    if (status === OrderStatus.COMPLETED) return 'completed';
    if (fulfillmentStatus === 'delivered') return 'delivered';
    if (fulfillmentStatus === 'shipped') return 'shipped';
    if (fulfillmentStatus === 'fulfilled') return 'fulfilled';
    if (status === OrderStatus.READY_FOR_PICKUP) return 'ready_for_pickup';
    if (status === OrderStatus.PROCESSING) return 'processing';
    return 'pending';
  }

  private resolvePhone(order: {
    customer?: { phone: string | null } | null;
    shippingAddress: unknown;
    billingAddress: unknown;
  }): string | null {
    if (order.customer?.phone?.trim()) {
      return order.customer.phone.trim();
    }
    return (
      this.readPhoneFromAddress(order.shippingAddress) ||
      this.readPhoneFromAddress(order.billingAddress)
    );
  }

  private readPhoneFromAddress(address: unknown): string | null {
    if (!address || typeof address !== 'object' || Array.isArray(address)) {
      return null;
    }
    const phone = (address as Record<string, unknown>).phone;
    return typeof phone === 'string' && phone.trim() ? phone.trim() : null;
  }

  private formatAddress(address: unknown): string {
    if (!address || typeof address !== 'object' || Array.isArray(address)) {
      return '—';
    }
    const a = address as Record<string, unknown>;
    const get = (k: string) => (typeof a[k] === 'string' ? a[k].trim() : '');
    const lines = [
      [get('firstName'), get('lastName')].filter(Boolean).join(' '),
      get('company'),
      get('addressLine1'),
      get('addressLine2'),
      [get('city'), get('state'), get('postalCode')].filter(Boolean).join(', '),
      get('country'),
    ].filter(Boolean);
    return lines.length ? lines.join(', ') : '—';
  }

  private buildCreatedAtFilter(
    startDate?: string,
    endDate?: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!startDate && !endDate) {
      return undefined;
    }

    const filter: Prisma.DateTimeFilter = {};

    if (startDate) {
      const start = new Date(startDate);
      if (Number.isNaN(start.getTime())) {
        throw new BadRequestException(`Invalid startDate: ${startDate}`);
      }
      filter.gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      if (Number.isNaN(end.getTime())) {
        throw new BadRequestException(`Invalid endDate: ${endDate}`);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
        end.setHours(23, 59, 59, 999);
      }
      filter.lte = end;
    }

    return filter;
  }
}
