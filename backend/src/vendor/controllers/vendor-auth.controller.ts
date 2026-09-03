import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { LoginDto } from '../../auth/dto/login.dto';
import { StoreAuthService } from '../services/store-auth.service';

@Controller('auth')
export class VendorAuthController {
  constructor(private readonly storeAuthService: StoreAuthService) {}

  @Public()
  @Post('store-login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  storeLogin(@Body() loginDto: LoginDto) {
    return this.storeAuthService.storeLogin(loginDto);
  }
}
