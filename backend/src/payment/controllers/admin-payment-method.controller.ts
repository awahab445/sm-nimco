import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreateAdminPaymentMethodDto } from '../dto/create-admin-payment-method.dto';
import { UpdateAdminPaymentMethodDto } from '../dto/update-admin-payment-method.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('admin/payment-methods')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminPaymentMethodController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * GET /admin/payment-methods
   */
  @Get()
  @RequirePermissions('payments.manage')
  async list(@Query('includeInactive') includeInactive?: string) {
    return this.paymentService.listPaymentMethodsAdmin(
      includeInactive === 'true',
    );
  }

  /**
   * GET /admin/payment-methods/:id
   */
  @Get(':id')
  @RequirePermissions('payments.manage')
  async findOne(@Param('id') id: string) {
    return this.paymentService.getPaymentMethodAdmin(id);
  }

  /**
   * POST /admin/payment-methods
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('payments.manage')
  async create(@Body() dto: CreateAdminPaymentMethodDto) {
    return this.paymentService.createPaymentMethodAdmin(dto);
  }

  /**
   * PATCH /admin/payment-methods/:id
   */
  @Patch(':id')
  @RequirePermissions('payments.manage')
  async update(@Param('id') id: string, @Body() dto: UpdateAdminPaymentMethodDto) {
    return this.paymentService.updatePaymentMethodAdmin(id, dto);
  }

  /**
   * DELETE /admin/payment-methods/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('payments.manage')
  async remove(@Param('id') id: string) {
    await this.paymentService.deletePaymentMethodAdmin(id);
  }
}
