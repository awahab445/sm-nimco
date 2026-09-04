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
import { AdminAnalyticsSummaryQueryDto } from '../dto/admin-analytics-summary-query.dto';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

@Controller('admin/analytics')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  /**
   * GET /admin/analytics/summary?from=&to=
   */
  @Get('summary')
  @CheckPermission('reports', 'read')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async summary(@Query() query: AdminAnalyticsSummaryQueryDto) {
    return this.analyticsService.getSummary(query.from, query.to);
  }
}
