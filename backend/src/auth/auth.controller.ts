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
  ForbiddenException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestAccountCreationDto } from './dto/request-account-creation.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtValidatePayload } from './strategies/jwt.strategy';
import { Public } from './decorators/public.decorator';
import {
  clearCustomerAuthCookie,
  setCustomerAuthCookie,
} from '../common/auth-cookies';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    setCustomerAuthCookie(res, result.access_token);
    return result;
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);
    setCustomerAuthCookie(res, result.access_token);
    return result;
  }

  @Public()
  @Post('request-account-creation')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async requestAccountCreation(@Body() dto: RequestAccountCreationDto) {
    return this.authService.requestAccountCreation(dto.email);
  }

  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async setPassword(
    @Body() dto: SetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.setPasswordWithToken(dto.token, dto.password);
    setCustomerAuthCookie(res, result.access_token);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    clearCustomerAuthCookie(res);
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtValidatePayload) {
    if (user.typ !== 'customer') {
      throw new ForbiddenException(
        'Customer session required. Admin users should use GET /admin/auth/me.',
      );
    }
    return this.authService.getProfile(user.customerId);
  }
}
