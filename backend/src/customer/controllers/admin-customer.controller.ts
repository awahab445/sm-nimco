import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';

@Controller('admin/customers')
export class AdminCustomerController {
  constructor(private readonly customerService: CustomerService) {}

  /**
   * POST /admin/customers
   * Create a new customer
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  /**
   * GET /admin/customers
   * Get all customers
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Query() query: QueryCustomerDto) {
    return this.customerService.findAll(query);
  }

  /**
   * GET /admin/customers/:id
   * Get customer by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  /**
   * PUT /admin/customers/:id
   * Update customer
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto);
  }

  /**
   * PUT /admin/customers/:id/assign-group
   * Assign customer to a group
   */
  @Put(':id/assign-group')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async assignGroup(
    @Param('id') id: string,
    @Body('groupId') groupId: string,
  ) {
    return this.customerService.assignGroup(id, groupId);
  }

  /**
   * DELETE /admin/customers/:id
   * Delete customer
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.customerService.delete(id);
  }
}

