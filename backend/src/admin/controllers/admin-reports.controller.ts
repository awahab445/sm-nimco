import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { CheckPermission } from '../decorators/check-permission.decorator';
import { AdminReportDateRangeQueryDto } from '../dto/admin-report-date-range-query.dto';
import { AdminReportsService } from '../services/admin-reports.service';

@Controller('admin/reports')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  /**
   * GET /admin/reports/order-summary?startDate=&endDate=
   */
  @Get('order-summary')
  @CheckPermission('reports', 'read')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async orderSummary(@Query() query: AdminReportDateRangeQueryDto) {
    return this.reportsService.getOrderSummary(query.startDate, query.endDate);
  }

  /**
   * GET /admin/reports/item-breakdown?startDate=&endDate=
   */
  @Get('item-breakdown')
  @CheckPermission('reports', 'read')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async itemBreakdown(@Query() query: AdminReportDateRangeQueryDto) {
    return this.reportsService.getItemBreakdown(query.startDate, query.endDate);
  }
}
