import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { OrderStatus } from '../../order/enums/order-status.enum';

export interface AdminAnalyticsSummaryDto {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  /** Flutter store-operator aliases */
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(from?: string, to?: string): Promise<AdminAnalyticsSummaryDto> {
    const createdAt = this.buildCreatedAtFilter(from, to);

    const where: Prisma.OrderWhereInput = {
      status: { not: OrderStatus.CANCELLED },
      ...(createdAt ? { createdAt } : {}),
    };

    const [aggregate, totalOrders] = await Promise.all([
      this.prisma.order.aggregate({
        where,
        _sum: { grandTotal: true },
        _count: { _all: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalRevenue = Number(aggregate._sum.grandTotal ?? 0);
    const count = aggregate._count._all || totalOrders;
    const avgOrderValue = count > 0 ? totalRevenue / count : 0;

    return {
      totalRevenue,
      totalOrders: count,
      avgOrderValue,
      revenue: totalRevenue,
      orderCount: count,
      averageOrderValue: avgOrderValue,
    };
  }

  private buildCreatedAtFilter(
    from?: string,
    to?: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!from && !to) {
      return undefined;
    }

    const filter: Prisma.DateTimeFilter = {};

    if (from) {
      const start = new Date(from);
      if (Number.isNaN(start.getTime())) {
        throw new BadRequestException(`Invalid from date: ${from}`);
      }
      filter.gte = start;
    }

    if (to) {
      const end = new Date(to);
      if (Number.isNaN(end.getTime())) {
        throw new BadRequestException(`Invalid to date: ${to}`);
      }
      // If only a date was provided (YYYY-MM-DD), include the full day.
      if (/^\d{4}-\d{2}-\d{2}$/.test(to.trim())) {
        end.setHours(23, 59, 59, 999);
      }
      filter.lte = end;
    }

    return filter;
  }
}
