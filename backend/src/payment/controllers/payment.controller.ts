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
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';

/** Admin panel (typ=admin) or store vendor app (typ=vendor: owner/operator). */
function assertStaffActor(
  user?: JwtValidatePayload | null,
): JwtValidatePayload {
  if (!user || (user.typ !== 'admin' && user.typ !== 'vendor')) {
    throw new ForbiddenException('Staff session required');
  }
  return user;
}

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalJwtAuthGuard)
  async createIntent(
    @Body() createIntentDto: CreatePaymentIntentDto,
    @Req() request: { user?: JwtValidatePayload | null },
  ) {
    return this.paymentService.createIntentAuthorized(
      createIntentDto.orderId,
      createIntentDto.paymentMethodCode,
      createIntentDto.returnUrl,
      createIntentDto.cancelUrl,
      request.user,
      createIntentDto.customerEmail,
    );
  }

  @Post('callback/:provider')
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @Param('provider') provider: string,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    const callbackData = {
      ...request.query,
      ...(typeof request.body === 'object' && request.body !== null
        ? request.body
        : {}),
    };

    await this.paymentService.verifyCallback(provider, callbackData, {
      rawBody: request.rawBody,
      signature: request.headers['stripe-signature'] as string | undefined,
    });

    return {
      success: true,
      message: 'Callback processed successfully',
    };
  }

  @Get('methods')
  async getPaymentMethods() {
    return this.paymentService.getActivePaymentMethods();
  }

  @Get('track')
  async trackPayments(
    @Query('orderNumber') orderNumber: string,
    @Query('email') email: string,
  ) {
    return this.paymentService.getPaymentsForTracking(orderNumber, email);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async getPaymentsByOrder(
    @Param('orderId') orderId: string,
    @Req() request: { user?: JwtValidatePayload },
  ) {
    return this.paymentService.getPaymentsByOrderAuthorized(
      orderId,
      request.user,
    );
  }

  /**
   * Pending COD queue — Super Admin (admin JWT) and Store Owner/Operator (vendor JWT).
   * GET /payments/cod/pending
   */
  @Get('cod/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingCODPayments(@Req() request: { user?: JwtValidatePayload }) {
    assertStaffActor(request.user);
    return this.paymentService.getPendingCODPayments();
  }

  /**
   * Mark COD collected — Super Admin / Store Owner / Store Operator.
   * POST /payments/cod/:paymentId/collect
   */
  @Post('cod/:paymentId/collect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markCODAsCollected(
    @Param('paymentId') paymentId: string,
    @Req() request: { user?: JwtValidatePayload },
  ) {
    assertStaffActor(request.user);
    await this.paymentService.markCODAsCollected(paymentId);
    return {
      success: true,
      message: 'COD payment marked as collected',
    };
  }

  /**
   * Mark COD failed — Super Admin / Store Owner / Store Operator.
   * POST /payments/cod/:paymentId/fail
   */
  @Post('cod/:paymentId/fail')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markCODAsFailed(
    @Param('paymentId') paymentId: string,
    @Body() body: { reason?: string },
    @Req() request: { user?: JwtValidatePayload },
  ) {
    assertStaffActor(request.user);
    await this.paymentService.markCODAsFailed(paymentId, body.reason);
    return {
      success: true,
      message: 'COD payment marked as failed',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPayment(
    @Param('id') id: string,
    @Req() request: { user?: JwtValidatePayload },
  ) {
    return this.paymentService.getPaymentAuthorized(id, request.user);
  }
}
