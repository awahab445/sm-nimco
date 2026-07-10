import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerJwtAuthGuard } from '../../auth/guards/customer-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CustomerJwtPayload } from '../../auth/strategies/jwt.strategy';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  /**
   * GET /customers/email/:email
   * Lookup customer by email (public)
   */
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const customer = await this.customerService.findByEmail(email);
    if (!customer) {
      return null;
    }
    return customer;
  }

  /**
   * GET /customers/get-or-create
   * Get or create customer by email (for guest checkout, public)
   */
  @Get('get-or-create')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getOrCreateByEmail(
    @Query('email') email: string,
    @Query('isGuest') isGuest?: boolean,
  ) {
    return this.customerService.getOrCreateByEmail(email, isGuest !== false);
  }

  /**
   * GET /customers/me
   * Get current authenticated customer's profile. Requires Bearer token.
   */
  @Get('me')
  @UseGuards(CustomerJwtAuthGuard)
  async getMe(@CurrentUser() user: CustomerJwtPayload) {
    return this.customerService.findMe(user.customerId);
  }

  /**
   * PATCH /customers/me
   * Update current authenticated customer's profile. Requires Bearer token.
   */
  @Patch('me')
  @UseGuards(CustomerJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateMe(
    @CurrentUser() user: CustomerJwtPayload,
    @Body() updateDto: UpdateCustomerDto,
  ) {
    return this.customerService.updateMe(user.customerId, updateDto);
  }
}
