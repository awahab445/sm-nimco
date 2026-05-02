import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CustomerJwtAuthGuard } from '../auth/guards/customer-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CustomerJwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('addresses')
@UseGuards(CustomerJwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * GET /addresses
   * List all saved addresses for the current customer.
   */
  @Get()
  findAll(@CurrentUser() user: CustomerJwtPayload) {
    return this.addressService.findAll(user.customerId);
  }

  /**
   * GET /addresses/:id
   * Get a single address by id (must belong to current customer).
   */
  @Get(':id')
  findOne(@CurrentUser() user: CustomerJwtPayload, @Param('id') id: string) {
    return this.addressService.findOne(user.customerId, id);
  }

  /**
   * POST /addresses
   * Create a new saved address. Optional isDefaultBilling / isDefaultShipping.
   */
  @Post()
  create(
    @CurrentUser() user: CustomerJwtPayload,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressService.create(user.customerId, createAddressDto);
  }

  /**
   * PATCH /addresses/:id
   * Update an address (must belong to current customer).
   */
  @Patch(':id')
  update(
    @CurrentUser() user: CustomerJwtPayload,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.update(user.customerId, id, updateAddressDto);
  }

  /**
   * DELETE /addresses/:id
   * Delete an address (must belong to current customer).
   */
  @Delete(':id')
  remove(@CurrentUser() user: CustomerJwtPayload, @Param('id') id: string) {
    return this.addressService.remove(user.customerId, id);
  }

  /**
   * POST /addresses/:id/default-billing
   * Set this address as the default billing address.
   */
  @Post(':id/default-billing')
  setDefaultBilling(
    @CurrentUser() user: CustomerJwtPayload,
    @Param('id') id: string,
  ) {
    return this.addressService.setDefaultBilling(user.customerId, id);
  }

  /**
   * POST /addresses/:id/default-shipping
   * Set this address as the default shipping address.
   */
  @Post(':id/default-shipping')
  setDefaultShipping(
    @CurrentUser() user: CustomerJwtPayload,
    @Param('id') id: string,
  ) {
    return this.addressService.setDefaultShipping(user.customerId, id);
  }
}
