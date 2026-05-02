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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestAccountCreationDto } from './dto/request-account-creation.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtValidatePayload } from './strategies/jwt.strategy';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticate with email and password. Returns JWT and user profile.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/register
   * Create account or convert guest to registered. Returns JWT and user profile.
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/request-account-creation
   * Guest checkout: request email with link to set password and create account (same email).
   */
  @Public()
  @Post('request-account-creation')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async requestAccountCreation(@Body() dto: RequestAccountCreationDto) {
    return this.authService.requestAccountCreation(dto.email);
  }

  /**
   * POST /auth/set-password
   * Set password using token from email link. Returns JWT and user profile (logged in).
   */
  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPasswordWithToken(dto.token, dto.password);
  }

  /**
   * POST /auth/logout
   * Client should discard the token. Returns success message.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout() {
    return this.authService.logout();
  }

  /**
   * GET /auth/me
   * Return current authenticated user profile. Requires Bearer token.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtValidatePayload) {
    return this.authService.getProfile(user.customerId);
  }
}
