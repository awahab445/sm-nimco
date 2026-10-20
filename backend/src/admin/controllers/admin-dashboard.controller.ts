import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { CheckPermission } from '../decorators/check-permission.decorator';
import {
  AdminDashboardService,
  type SalesTrendPeriod,
} from '../services/admin-dashboard.service';

@Controller('admin/dashboard')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  /**
   * GET /admin/dashboard/stats — live KPI cards for the admin home page.
   * Gated with reports.read (same as analytics summary / reports).
   */
  @Get('stats')
  @CheckPermission('reports', 'read')
  async stats() {
    return this.dashboardService.getStats();
  }

  /**
   * GET /admin/dashboard/sales-trends?period=daily|weekly|monthly
   */
  @Get('sales-trends')
  @CheckPermission('reports', 'read')
  async salesTrends(@Query('period') period?: string) {
    const normalized = this.normalizePeriod(period);
    return this.dashboardService.getSalesTrends(normalized);
  }

  /**
   * GET /admin/dashboard/courier-performance — Leopards shipment breakdown.
   */
  @Get('courier-performance')
  @CheckPermission('reports', 'read')
  async courierPerformance() {
    return this.dashboardService.getCourierPerformance();
  }

  /**
   * GET /admin/dashboard/top-products?limit=5
   */
  @Get('top-products')
  @CheckPermission('reports', 'read')
  async topProducts(@Query('limit') limit?: string) {
    const n = limit != null ? Number(limit) : 5;
    return this.dashboardService.getTopSellingProducts(
      Number.isFinite(n) ? n : 5,
    );
  }

  private normalizePeriod(period?: string): SalesTrendPeriod {
    if (period === 'weekly' || period === 'monthly' || period === 'daily') {
      return period;
    }
    return 'daily';
  }
}
