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
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';

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
   * Get payment by ID
   * GET /payments/:id
   */
  @Get(':id')
  async getPayment(@Param('id') id: string) {
    return this.paymentService.getPayment(id);
  }

  /**
   * Get payments for an order
   * GET /payments/order/:orderId
   */
  @Get('order/:orderId')
  async getPaymentsByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentsByOrder(orderId);
  }

  /**
   * Get pending COD payments (admin/logistics)
   * GET /payments/cod/pending
   */
  @Get('cod/pending')
  async getPendingCODPayments() {
    return this.paymentService.getPendingCODPayments();
  }

  /**
   * Mark COD payment as collected (admin/logistics)
   * POST /payments/cod/:paymentId/collect
   */
  @Post('cod/:paymentId/collect')
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

