import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';
import { assertVendorUser } from '../utils/assert-vendor-user.util';
import { VendorBlockedGuard } from '../guards/vendor-blocked.guard';
import { SessionService } from '../../sessions/session.service';

@Controller('vendor/sessions')
@UseGuards(JwtAuthGuard, VendorBlockedGuard)
export class VendorSessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Heartbeat from the store-operator app.
   * POST /vendor/sessions/ping
   */
  @Post('ping')
  @HttpCode(HttpStatus.OK)
  async ping(
    @CurrentUser() user: JwtValidatePayload,
    @Req() req: Request,
  ) {
    assertVendorUser(user);
    return this.sessionService.ping(user.vendorUserId, req);
  }
}
