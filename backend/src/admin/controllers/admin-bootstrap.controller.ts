import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { AdminUserService } from '../services/admin-user.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { FirstAdminBootstrapDto } from '../dto/first-admin-bootstrap.dto';

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
  async createFirstUser(@Body() dto: FirstAdminBootstrapDto) {
    const count = await this.prisma.adminUser.count();
    if (count > 0) {
      throw new BadRequestException(
        'Bootstrap is disabled because a staff user already exists. Use POST /admin/auth/login and POST /admin/users.',
      );
    }

    await this.adminUserService.bootstrapFirstSuperAdmin(dto);

    return this.adminAuthService.login({
      email: dto.email,
      password: dto.password,
    });
  }
}
