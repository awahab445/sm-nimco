import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { OrderService } from '../../order/services/order.service';
import {
  dbStatusToVendor,
  vendorStatusToDb,
  type VendorOrderStatus,
} from '../utils/vendor-order-status.util';

export interface VendorOrderItemDto {
  name: string;
  quantity: number;
  price: number;
}

export interface VendorOrderDto {
  id: string;
  orderNumber: string;
  status: VendorOrderStatus;
  customer: {
    name: string;
    phone: string | null;
  };
  items: VendorOrderItemDto[];
  totalAmount: number;
}

@Injectable()
export class VendorOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
  ) {}

  async findActiveByStatus(
    status: VendorOrderStatus,
  ): Promise<VendorOrderDto[]> {
    const dbStatus = vendorStatusToDb(status);
    const orders = await this.prisma.order.findMany({
      where: { status: dbStatus },
      include: {
        items: true,
        customer: { select: { phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return orders.map((order) => this.toVendorOrderDto(order));
  }

  async updateStatus(
    orderId: string,
    status: VendorOrderStatus,
  ): Promise<VendorOrderDto> {
    const updated = await this.orderService.updateOrderStatus(orderId, {
      status: vendorStatusToDb(status),
    });

    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: updated.id },
      include: {
        items: true,
        customer: { select: { phone: true } },
      },
    });

    return this.toVendorOrderDto(order);
  }

  private toVendorOrderDto(order: {
    id: string;
    orderNumber: string;
    status: string;
    customerName: string | null;
    customerEmail: string;
    grandTotal: { toString(): string };
    shippingAddress: unknown;
    billingAddress: unknown;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: { toString(): string };
    }>;
    customer?: { phone: string | null } | null;
  }): VendorOrderDto {
    const vendorStatus = dbStatusToVendor(order.status);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: vendorStatus ?? 'PROCESSING',
      customer: {
        name: order.customerName || order.customerEmail,
        phone: this.resolveCustomerPhone(order),
      },
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.unitPrice),
      })),
      totalAmount: Number(order.grandTotal),
    };
  }

  private resolveCustomerPhone(order: {
    customer?: { phone: string | null } | null;
    shippingAddress: unknown;
    billingAddress: unknown;
  }): string | null {
    if (order.customer?.phone) {
      return order.customer.phone;
    }

    const shippingPhone = this.readPhoneFromAddress(order.shippingAddress);
    if (shippingPhone) {
      return shippingPhone;
    }

    return this.readPhoneFromAddress(order.billingAddress);
  }

  private readPhoneFromAddress(address: unknown): string | null {
    if (!address || typeof address !== 'object' || Array.isArray(address)) {
      return null;
    }
    const phone = (address as Record<string, unknown>).phone;
    return typeof phone === 'string' && phone.trim() ? phone.trim() : null;
  }
}
