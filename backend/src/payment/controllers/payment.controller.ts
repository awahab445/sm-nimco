import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create payment intent
   * POST /payments/intent
   */
  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  async createIntent(@Body() createIntentDto: CreatePaymentIntentDto) {
    return this.paymentService.createIntent(
      createIntentDto.orderId,
      createIntentDto.paymentMethodCode,
      createIntentDto.returnUrl,
      createIntentDto.cancelUrl,
    );
  }

  /**
   * Payment gateway callback
   * POST /payments/callback/:provider
   */
  @Post('callback/:provider')
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @Param('provider') provider: string,
    @Req() request: any,
  ) {
    // Accept both query params and body for different gateway formats
    const callbackData = {
      ...request.query,
      ...request.body,
    };

    await this.paymentService.verifyCallback(provider, callbackData);

    return {
      success: true,
      message: 'Callback processed successfully',
    };
  }

  /**
   * Get active payment methods
   * GET /payments/methods
   */
  @Get('methods')
  async getPaymentMethods() {
    return this.paymentService.getActivePaymentMethods();
  }

  /**
   * Get payment by ID (customer/admin JWT required)
   * GET /payments/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPayment(@Param('id') id: string, @Req() request: any) {
    return this.paymentService.getPaymentAuthorized(id, request.user);
  }

  /**
   * Get payments for an order (customer/admin JWT required)
   * GET /payments/order/:orderId
   */
  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async getPaymentsByOrder(@Param('orderId') orderId: string, @Req() request: any) {
    return this.paymentService.getPaymentsByOrderAuthorized(orderId, request.user);
  }

  /**
   * Track payments via order number + customer email (public-safe lookup)
   * GET /payments/track?orderNumber=...&email=...
   */
  @Get('track')
  async trackPayments(
    @Query('orderNumber') orderNumber: string,
    @Query('email') email: string,
  ) {
    return this.paymentService.getPaymentsForTracking(orderNumber, email);
  }

  /**
   * Get pending COD payments (admin/logistics)
   * GET /payments/cod/pending
   */
  @Get('cod/pending')
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('payments.manage')
  async getPendingCODPayments() {
    return this.paymentService.getPendingCODPayments();
  }

  /**
   * Mark COD payment as collected (admin/logistics)
   * POST /payments/cod/:paymentId/collect
   */
  @Post('cod/:paymentId/collect')
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('payments.manage')
  @HttpCode(HttpStatus.OK)
  async markCODAsCollected(@Param('paymentId') paymentId: string) {
    await this.paymentService.markCODAsCollected(paymentId);
    return {
      success: true,
      message: 'COD payment marked as collected',
    };
  }

  /**
   * Mark COD payment as failed (RTO - admin/logistics)
   * POST /payments/cod/:paymentId/fail
   */
  @Post('cod/:paymentId/fail')
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('payments.manage')
  @HttpCode(HttpStatus.OK)
  async markCODAsFailed(
    @Param('paymentId') paymentId: string,
    @Body() body: { reason?: string },
  ) {
    await this.paymentService.markCODAsFailed(paymentId, body.reason);
    return {
      success: true,
      message: 'COD payment marked as failed',
    };
  }
}

