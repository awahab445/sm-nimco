import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';
import { assertVendorUser } from '../utils/assert-vendor-user.util';
import { RegisterFcmTokenDto } from '../dto/register-fcm-token.dto';
import { FcmService } from '../services/fcm.service';
import { PrismaService } from '../../catalog/services/prisma.service';

@Controller('vendor/sessions')
@UseGuards(JwtAuthGuard)
export class VendorSessionController {
  constructor(
    private readonly fcmService: FcmService,
    private readonly prisma: PrismaService,
  ) {}

  /** Soft heartbeat used by the store-operator app while signed in. */
  @Post('ping')
  @HttpCode(HttpStatus.OK)
  async ping(@CurrentUser() user: JwtValidatePayload) {
    assertVendorUser(user);
    await this.prisma.adminUser.update({
      where: { id: user.vendorUserId },
      data: { lastLoginAt: new Date() },
    });
    return { ok: true };
  }

  /** Registers / refreshes the device FCM token after login. */
  @Post('fcm-token')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async registerFcmToken(
    @CurrentUser() user: JwtValidatePayload,
    @Body() body: RegisterFcmTokenDto,
  ) {
    assertVendorUser(user);
    await this.fcmService.saveOperatorToken(user.vendorUserId, body.fcmToken);
    return { ok: true };
  }
}
