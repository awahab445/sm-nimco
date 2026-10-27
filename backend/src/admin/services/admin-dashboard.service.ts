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
  /** Leopards RTO / returned / cancelled shipments. */
  rtoCount: number;
  recentOrders: DashboardRecentOrder[];
};

export type SalesTrendPeriod = 'daily' | 'weekly' | 'monthly';

export type SalesTrendPoint = {
  label: string;
  periodStart: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
};

export type SalesTrendsDto = {
  period: SalesTrendPeriod;
  points: SalesTrendPoint[];
};

export type CourierPerformanceDto = {
  courier: string;
  total: number;
  delivered: number;
  inTransit: number;
  rto: number;
  pending: number;
  deliveredRate: number;
  inTransitRate: number;
  rtoRate: number;
  pendingRate: number;
};

export type TopSellingProductDto = {
  productId: string;
  sku: string;
  name: string;
  unitsSold: number;
  revenue: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
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
      courierPerf,
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
      this.getCourierPerformance(),
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
      rtoCount: courierPerf.rto,
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

  async getSalesTrends(
    period: SalesTrendPeriod = 'daily',
  ): Promise<SalesTrendsDto> {
    const now = new Date();
    const buckets = this.buildTrendBuckets(period, now);

    if (buckets.length === 0) {
      return { period, points: [] };
    }

    const rangeStart = buckets[0].start;
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: rangeStart, lte: now },
        status: { not: OrderStatus.CANCELLED },
      },
      select: {
        createdAt: true,
        grandTotal: true,
        paymentStatus: true,
        status: true,
      },
    });

    const points: SalesTrendPoint[] = buckets.map((bucket) => {
      const inBucket = orders.filter(
        (o) => o.createdAt >= bucket.start && o.createdAt < bucket.end,
      );
      const revenueOrders = inBucket.filter(
        (o) => o.paymentStatus === 'paid' || o.status === OrderStatus.COMPLETED,
      );
      const revenue = revenueOrders.reduce(
        (sum, o) => sum + Number(o.grandTotal),
        0,
      );
      const orderCount = inBucket.length;
      const aovDenom = revenueOrders.length;
      return {
        label: bucket.label,
        periodStart: bucket.start.toISOString(),
        revenue,
        orderCount,
        averageOrderValue: aovDenom > 0 ? revenue / aovDenom : 0,
      };
    });

    return { period, points };
  }

  async getCourierPerformance(): Promise<CourierPerformanceDto> {
    const leopards = await this.prisma.orderShipping.findMany({
      where: {
        OR: [
          { courierCode: { equals: 'leopards', mode: 'insensitive' } },
          { courierName: { contains: 'leopard', mode: 'insensitive' } },
        ],
      },
      select: {
        status: true,
        deliveredAt: true,
        cancelledAt: true,
        courierCode: true,
        trackingNumber: true,
      },
    });

    let delivered = 0;
    let inTransit = 0;
    let rto = 0;
    let pending = 0;

    for (const s of leopards) {
      const status = (s.status ?? '').toLowerCase();
      if (status === 'delivered' || s.deliveredAt) {
        delivered += 1;
      } else if (
        status === 'cancelled' ||
        s.cancelledAt ||
        status === 'returned' ||
        status === 'rto'
      ) {
        rto += 1;
      } else if (status === 'in_transit' || status === 'shipped') {
        inTransit += 1;
      } else {
        pending += 1;
      }
    }

    const total = leopards.length;
    const rate = (n: number) =>
      total > 0 ? Math.round((n / total) * 1000) / 10 : 0;

    return {
      courier: 'Leopards',
      total,
      delivered,
      inTransit,
      rto,
      pending,
      deliveredRate: rate(delivered),
      inTransitRate: rate(inTransit),
      rtoRate: rate(rto),
      pendingRate: rate(pending),
    };
  }

  async getTopSellingProducts(limit = 5): Promise<TopSellingProductDto[]> {
    const take = Math.min(20, Math.max(1, Math.floor(limit) || 5));

    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId', 'sku', 'name'],
      where: {
        order: { status: { not: OrderStatus.CANCELLED } },
        productId: { not: '00000000-0000-4000-8000-0000000000c1' },
      },
      _sum: {
        quantity: true,
        rowTotal: true,
      },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take,
    });

    if (grouped.length === 0) return [];

    const productIds = [...new Set(grouped.map((g) => g.productId))];
    const inventory = await this.prisma.inventoryItem.findMany({
      where: { productId: { in: productIds } },
      select: {
        productId: true,
        availableQuantity: true,
        lowStockThreshold: true,
      },
    });

    const stockByProduct = new Map<
      string,
      { available: number; threshold: number }
    >();
    for (const row of inventory) {
      if (!row.productId) continue;
      const prev = stockByProduct.get(row.productId) ?? {
        available: 0,
        threshold: row.lowStockThreshold,
      };
      stockByProduct.set(row.productId, {
        available: prev.available + row.availableQuantity,
        threshold: Math.min(prev.threshold, row.lowStockThreshold),
      });
    }

    return grouped.map((g) => {
      const stock = stockByProduct.get(g.productId) ?? {
        available: 0,
        threshold: 10,
      };
      return {
        productId: g.productId,
        sku: g.sku,
        name: g.name,
        unitsSold: g._sum.quantity ?? 0,
        revenue: Number(g._sum.rowTotal ?? 0),
        availableQuantity: stock.available,
        lowStockThreshold: stock.threshold,
        isLowStock: stock.available <= stock.threshold,
      };
    });
  }

  private buildTrendBuckets(
    period: SalesTrendPeriod,
    now: Date,
  ): Array<{ label: string; start: Date; end: Date }> {
    const buckets: Array<{ label: string; start: Date; end: Date }> = [];

    if (period === 'daily') {
      for (let i = 13; i >= 0; i -= 1) {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - i);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        buckets.push({
          label: start.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
          }),
          start,
          end,
        });
      }
      return buckets;
    }

    if (period === 'weekly') {
      for (let i = 11; i >= 0; i -= 1) {
        const end = new Date(now);
        end.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - i * 7 + 1);
        const start = new Date(end);
        start.setDate(start.getDate() - 7);
        buckets.push({
          label: `W${this.isoWeek(start)}`,
          start,
          end,
        });
      }
      return buckets;
    }

    // monthly — last 12 calendar months
    for (let i = 11; i >= 0; i -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({
        label: start.toLocaleDateString('en-GB', {
          month: 'short',
          year: '2-digit',
        }),
        start,
        end,
      });
    }
    return buckets;
  }

  private isoWeek(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
