import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';
import { assertVendorUser } from '../utils/assert-vendor-user.util';
import { VendorBlockedGuard } from '../guards/vendor-blocked.guard';
import { VendorAnalyticsSummaryQueryDto } from '../dto/vendor-analytics-summary-query.dto';
import { VendorAnalyticsService } from '../services/vendor-analytics.service';

@Controller('vendor/analytics')
@UseGuards(JwtAuthGuard, VendorBlockedGuard)
export class VendorAnalyticsController {
  constructor(private readonly analyticsService: VendorAnalyticsService) {}

  /**
   * GET /vendor/analytics/summary?period=today|7days|30days|custom
   * GET /vendor/analytics/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   * Defaults to period=today when no query params are provided.
   */
  @Get('summary')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async summary(
    @CurrentUser() user: JwtValidatePayload,
    @Query() query: VendorAnalyticsSummaryQueryDto,
  ) {
    assertVendorUser(user);
    return this.analyticsService.getSummary(query);
  }
}
