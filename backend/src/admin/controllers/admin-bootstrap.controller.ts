import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  BadRequestException,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../catalog/services/prisma.service';
import { AdminUserService } from '../services/admin-user.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { FirstAdminBootstrapDto } from '../dto/first-admin-bootstrap.dto';
import { setAdminAuthCookie } from '../../common/auth-cookies';

/**
 * One-time setup when no staff users exist. After the first admin is created, use POST /admin/users.
 */
@Controller('admin/bootstrap')
export class AdminBootstrapController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminUserService: AdminUserService,
    private readonly adminAuthService: AdminAuthService,
  ) {}

  @Post('first-user')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createFirstUser(
    @Body() dto: FirstAdminBootstrapDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const expectedToken = process.env.BOOTSTRAP_TOKEN?.trim();
    if (!expectedToken) {
      throw new BadRequestException(
        'BOOTSTRAP_TOKEN is not configured on the server. Set it in backend .env before bootstrap.',
      );
    }
    if (dto.bootstrapToken !== expectedToken) {
      throw new ForbiddenException('Invalid bootstrap token');
    }

    const count = await this.prisma.adminUser.count();
    if (count > 0) {
      throw new BadRequestException(
        'Bootstrap is disabled because a staff user already exists. Use POST /admin/auth/login and POST /admin/users.',
      );
    }

    await this.adminUserService.bootstrapFirstSuperAdmin(dto);

    const loginResult = await this.adminAuthService.login({
      email: dto.email,
      password: dto.password,
    });
    setAdminAuthCookie(res, loginResult.access_token);
    return loginResult;
  }
}
