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
  UseGuards,
} from '@nestjs/common';
import { CustomerGroupService } from '../services/customer-group.service';
import { CreateCustomerGroupDto } from '../dto/create-customer-group.dto';
import { UpdateCustomerGroupDto } from '../dto/update-customer-group.dto';
import { QueryCustomerGroupDto } from '../dto/query-customer-group.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('admin/customer-groups')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminCustomerGroupController {
  constructor(private readonly customerGroupService: CustomerGroupService) {}

  /**
   * POST /admin/customer-groups
   * Create a new customer group
   */
  @Post()
  @RequirePermissions('customers.manage')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateCustomerGroupDto) {
    return this.customerGroupService.create(dto);
  }

  /**
   * GET /admin/customer-groups
   * Get all customer groups
   */
  @Get()
  @RequirePermissions('customers.read')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Query() query: QueryCustomerGroupDto) {
    return this.customerGroupService.findAll(query);
  }

  /**
   * GET /admin/customer-groups/default
   * Get the default customer group
   */
  @Get('default')
  @RequirePermissions('customers.read')
  async findDefault() {
    return this.customerGroupService.findDefault();
  }

  /**
   * GET /admin/customer-groups/:id
   * Get customer group by ID
   */
  @Get(':id')
  @RequirePermissions('customers.read')
  async findOne(@Param('id') id: string) {
    return this.customerGroupService.findOne(id);
  }

  /**
   * PUT /admin/customer-groups/:id
   * Update customer group
   */
  @Put(':id')
  @RequirePermissions('customers.manage')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerGroupDto) {
    return this.customerGroupService.update(id, dto);
  }

  /**
   * DELETE /admin/customer-groups/:id
   * Delete customer group
   */
  @Delete(':id')
  @RequirePermissions('customers.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.customerGroupService.delete(id);
  }
}

