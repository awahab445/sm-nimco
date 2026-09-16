import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';
import { assertVendorUser } from '../utils/assert-vendor-user.util';
import { VendorBlockedGuard } from '../guards/vendor-blocked.guard';
import { VendorAnalyticsService } from '../services/vendor-analytics.service';

@Controller('vendor/analytics')
@UseGuards(JwtAuthGuard, VendorBlockedGuard)
export class VendorAnalyticsController {
  constructor(private readonly analyticsService: VendorAnalyticsService) {}

  /** Store-owner / store-operator summary KPIs for the mobile analytics tab. */
  @Get('summary')
  async summary(@CurrentUser() user: JwtValidatePayload) {
    assertVendorUser(user);
    return this.analyticsService.getSummary();
  }
}
