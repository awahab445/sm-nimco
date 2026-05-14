import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminAuthService } from '../services/admin-auth.service';
import { LoginDto } from '../../auth/dto/login.dto';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { CurrentAdminId } from '../decorators/current-admin.decorator';
import {
  clearAdminAuthCookie,
  setAdminAuthCookie,
} from '../../common/auth-cookies';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.adminAuthService.login(dto);
    setAdminAuthCookie(res, result.access_token);
    return result;
  }

  @Get('me')
  @UseGuards(AdminJwtAuthGuard)
  async me(@CurrentAdminId() adminUserId: string) {
    return this.adminAuthService.me(adminUserId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    clearAdminAuthCookie(res);
    return this.adminAuthService.logoutMessage();
  }
}
