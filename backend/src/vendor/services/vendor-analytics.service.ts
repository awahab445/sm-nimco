import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { OrderStatus } from '../../order/enums/order-status.enum';

export interface VendorAnalyticsSummaryDto {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  pendingCount: number;
  completedCount: number;
  /** Flutter aliases */
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

@Injectable()
export class VendorAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<VendorAnalyticsSummaryDto> {
    const notCancelled: Prisma.OrderWhereInput = {
      status: { not: OrderStatus.CANCELLED },
    };

    const [aggregate, pendingCount, processingCount, completedCount] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: notCancelled,
          _sum: { grandTotal: true },
          _count: { _all: true },
        }),
        this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        this.prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
        this.prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
      ]);

    const totalRevenue = Number(aggregate._sum.grandTotal ?? 0);
    const totalOrders = aggregate._count._all;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    // Active queue: pending + processing (matches store-operator Pending tab).
    const activePending = pendingCount + processingCount;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      pendingCount: activePending,
      completedCount,
      revenue: totalRevenue,
      orderCount: totalOrders,
      averageOrderValue: avgOrderValue,
    };
  }
}
