import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { OrderStatus } from '../../order/enums/order-status.enum';

export type DashboardRecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  grandTotal: number;
  currency: string;
  status: string;
  paymentStatus: string | null;
  createdAt: string;
};

export type DashboardStatsDto = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  pendingRevenue: number;
  pendingCount: number;
  processingCount: number;
  shippedCount: number;
  completedCount: number;
  cancelledCount: number;
  lowStockCount: number;
  recentOrders: DashboardRecentOrder[];
};

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const paidOrCompletedWhere: Prisma.OrderWhereInput = {
      status: { not: OrderStatus.CANCELLED },
      OR: [{ paymentStatus: 'paid' }, { status: OrderStatus.COMPLETED }],
    };

    const [
      revenueAgg,
      pendingRevenueAgg,
      totalCustomers,
      pendingCount,
      processingCount,
      shippedCount,
      completedCount,
      cancelledCount,
      totalOrdersAll,
      recentOrdersRaw,
      lowStockRows,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: paidOrCompletedWhere,
        _sum: { grandTotal: true },
        _count: { _all: true },
      }),
      this.prisma.order.aggregate({
        where: {
          paymentStatus: 'pending',
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { grandTotal: true },
      }),
      this.prisma.customer.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
      this.prisma.order.count({
        where: {
          OR: [
            { status: OrderStatus.READY_FOR_PICKUP },
            {
              fulfillmentStatus: { in: ['shipped', 'delivered'] },
              status: {
                notIn: [OrderStatus.CANCELLED, OrderStatus.COMPLETED],
              },
            },
          ],
        },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.order.count({
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          grandTotal: true,
          currency: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM inventory_items
        WHERE available_quantity <= low_stock_threshold
      `,
    ]);

    const totalRevenue = Number(revenueAgg._sum.grandTotal ?? 0);
    const paidOrderCount = revenueAgg._count._all;
    const averageOrderValue =
      paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0;

    return {
      totalRevenue,
      totalOrders: totalOrdersAll,
      totalCustomers,
      averageOrderValue,
      pendingRevenue: Number(pendingRevenueAgg._sum.grandTotal ?? 0),
      pendingCount,
      processingCount,
      shippedCount,
      completedCount,
      cancelledCount,
      lowStockCount: Number(lowStockRows[0]?.count ?? 0),
      recentOrders: recentOrdersRaw.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName?.trim() || o.customerEmail,
        customerEmail: o.customerEmail,
        grandTotal: Number(o.grandTotal),
        currency: o.currency,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt.toISOString(),
      })),
    };
  }
}
