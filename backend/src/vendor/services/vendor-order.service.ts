import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { OrderStatus } from '../../order/enums/order-status.enum';
import {
  dbStatusToVendor,
  vendorFulfillmentStatusFor,
  vendorStatusToDb,
  type VendorOrderStatus,
} from '../utils/vendor-order-status.util';

export interface VendorOrderItemDto {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unitPrice: number;
  outOfStock: boolean;
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
  createdAt?: string;
}

@Injectable()
export class VendorOrderService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findByOrderNumber(orderNumber: string): Promise<VendorOrderDto> {
    const normalized = orderNumber.trim();
    if (!normalized) {
      throw new BadRequestException('orderNumber is required');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber: {
          equals: normalized,
          mode: 'insensitive',
        },
      },
      include: {
        items: true,
        customer: { select: { phone: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${normalized} not found`);
    }

    return this.toVendorOrderDto(order, { allowLookupStatuses: true });
  }

  async updateStatus(
    orderId: string,
    status: VendorOrderStatus,
  ): Promise<VendorOrderDto> {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (existing.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled order');
    }

    const dbStatus = vendorStatusToDb(status);
    const fulfillmentStatus = vendorFulfillmentStatusFor(status);

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dbStatus,
        ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
      },
      include: {
        items: true,
        customer: { select: { phone: true } },
      },
    });

    return this.toVendorOrderDto(order);
  }

  async updateItemOutOfStock(
    orderId: string,
    itemId: string,
    outOfStock: boolean,
  ): Promise<VendorOrderDto> {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(
        `Order item ${itemId} not found on order ${orderId}`,
      );
    }

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { outOfStock },
    });

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: { select: { phone: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return this.toVendorOrderDto(order);
  }

  private toVendorOrderDto(
    order: {
      id: string;
      orderNumber: string;
      status: string;
      customerName: string | null;
      customerEmail: string;
      grandTotal: { toString(): string };
      shippingAddress: unknown;
      billingAddress: unknown;
      createdAt?: Date;
      items: Array<{
        id: string;
        name: string;
        quantity: number;
        unitPrice: { toString(): string };
        outOfStock?: boolean;
      }>;
      customer?: { phone: string | null } | null;
    },
    options?: { allowLookupStatuses?: boolean },
  ): VendorOrderDto {
    let vendorStatus = dbStatusToVendor(order.status);
    if (!vendorStatus && options?.allowLookupStatuses) {
      // Scanner may look up orders outside the active vendor queue.
      const lowered = order.status.toLowerCase();
      if (lowered === 'pending' || lowered === 'processing') {
        vendorStatus = 'PROCESSING';
      } else if (
        lowered === 'completed' ||
        lowered === 'ready_for_pickup' ||
        lowered === 'fulfilled'
      ) {
        vendorStatus = 'READY_FOR_PICKUP';
      }
    }
    if (!vendorStatus) {
      throw new BadRequestException(
        `Order status "${order.status}" is not exposed to the store app`,
      );
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: vendorStatus,
      customer: {
        name: order.customerName || order.customerEmail,
        phone: this.resolveCustomerPhone(order),
      },
      items: order.items.map((item) => {
        const price = Number(item.unitPrice);
        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price,
          unitPrice: price,
          outOfStock: Boolean(item.outOfStock),
        };
      }),
      totalAmount: Number(order.grandTotal),
      createdAt: order.createdAt?.toISOString(),
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
