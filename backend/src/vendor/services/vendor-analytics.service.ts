import { BadRequestException, Injectable } from '@nestjs/common';
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
  /** Echo of the applied range (ISO date strings). */
  startDate: string;
  endDate: string;
  period: string;
}

export interface VendorAnalyticsQuery {
  period?: string;
  startDate?: string;
  endDate?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class VendorAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    query: VendorAnalyticsQuery = {},
  ): Promise<VendorAnalyticsSummaryDto> {
    const { start, end, period } = this.resolveDateRange(query);
    const createdAt: Prisma.DateTimeFilter = { gte: start, lte: end };

    const baseWhere: Prisma.OrderWhereInput = {
      status: { not: OrderStatus.CANCELLED },
      createdAt,
    };

    const [aggregate, pendingCount, processingCount, completedCount] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: baseWhere,
          _sum: { grandTotal: true },
          _count: { _all: true },
        }),
        this.prisma.order.count({
          where: { status: OrderStatus.PENDING, createdAt },
        }),
        this.prisma.order.count({
          where: { status: OrderStatus.PROCESSING, createdAt },
        }),
        this.prisma.order.count({
          where: { status: OrderStatus.COMPLETED, createdAt },
        }),
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
      startDate: this.toDateOnly(start),
      endDate: this.toDateOnly(end),
      period,
    };
  }

  /**
   * Resolves the inclusive createdAt window.
   * Default when nothing is passed: today.
   */
  private resolveDateRange(query: VendorAnalyticsQuery): {
    start: Date;
    end: Date;
    period: string;
  } {
    const startRaw = query.startDate ?? query.from;
    const endRaw = query.endDate ?? query.to;
    const periodRaw = query.period?.trim().toLowerCase();

    // Explicit custom dates win (period=custom or bare start/end).
    if (startRaw || endRaw || periodRaw === 'custom') {
      if (!startRaw || !endRaw) {
        throw new BadRequestException(
          'custom period requires both startDate and endDate',
        );
      }
      const start = this.parseBoundary(startRaw, /* asEndOfDay */ false);
      const end = this.parseBoundary(endRaw, /* asEndOfDay */ true);
      if (start.getTime() > end.getTime()) {
        throw new BadRequestException('startDate must be on or before endDate');
      }
      return { start, end, period: 'custom' };
    }

    const period = this.normalizePeriod(periodRaw);
    const end = this.endOfDay(new Date());

    switch (period) {
      case 'today':
        return { start: this.startOfDay(new Date()), end, period: 'today' };
      case '7days':
        return {
          start: this.startOfDay(this.daysAgo(6)),
          end,
          period: '7days',
        };
      case '30days':
        return {
          start: this.startOfDay(this.daysAgo(29)),
          end,
          period: '30days',
        };
      default:
        throw new BadRequestException(`Unsupported period: ${query.period}`);
    }
  }

  private normalizePeriod(period?: string): 'today' | '7days' | '30days' {
    if (!period) return 'today';
    switch (period) {
      case 'today':
        return 'today';
      case '7days':
      case '7d':
      case 'last7days':
        return '7days';
      case '30days':
      case '30d':
      case 'last30days':
        return '30days';
      default:
        throw new BadRequestException(`Unsupported period: ${period}`);
    }
  }

  private parseBoundary(value: string, asEndOfDay: boolean): Date {
    const trimmed = value.trim();
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date: ${value}`);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return asEndOfDay ? this.endOfDay(date) : this.startOfDay(date);
    }
    return date;
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  private toDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
