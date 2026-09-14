import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';
import { assertVendorUser } from '../utils/assert-vendor-user.util';
import { VendorBlockedGuard } from '../guards/vendor-blocked.guard';
import { SessionService } from '../../sessions/session.service';
import { VendorFcmTokenDto } from '../dto/vendor-fcm-token.dto';

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
  async ping(@CurrentUser() user: JwtValidatePayload, @Req() req: Request) {
    assertVendorUser(user);
    return this.sessionService.ping(user.vendorUserId, req);
  }

  /**
   * Register / refresh the operator device FCM token.
   * POST /vendor/sessions/fcm-token
   */
  @Post('fcm-token')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async saveFcmToken(
    @CurrentUser() user: JwtValidatePayload,
    @Body() body: VendorFcmTokenDto,
    @Req() req: Request,
  ) {
    assertVendorUser(user);
    return this.sessionService.saveFcmToken(
      user.vendorUserId,
      body.fcmToken,
      req,
    );
  }
}
