import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { CheckPermission } from '../decorators/check-permission.decorator';
import { AdminDashboardService } from '../services/admin-dashboard.service';

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
}
