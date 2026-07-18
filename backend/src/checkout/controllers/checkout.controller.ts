import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { CheckoutService } from '../services/checkout.service';
import { StartCheckoutDto } from '../dto/start-checkout.dto';
import { UpdateAddressDto } from '../dto/address.dto';
import { ShippingMethodDto } from '../dto/shipping-method.dto';
import { ConfirmCheckoutDto } from '../dto/confirm-checkout.dto';
import { UpdateCheckoutItemDto } from '../dto/update-checkout-item.dto';
import { SetGuestCustomerDto } from '../dto/set-guest-customer.dto';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';

@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * POST /checkout/start
   * Start checkout from cart
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startCheckout(
    @Body() startCheckoutDto: StartCheckoutDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Starting checkout for cart ${startCheckoutDto.cartId}`);
    return await this.checkoutService.startCheckout(startCheckoutDto, req);
  }

  /**
   * GET /checkout/:checkoutId
   * Get checkout session
   */
  @Get(':checkoutId')
  async getCheckout(@Param('checkoutId') checkoutId: string) {
    this.logger.log(`Fetching checkout ${checkoutId}`);
    return await this.checkoutService.getCheckout(checkoutId);
  }

  /**
   * POST /checkout/:checkoutId/address
   * Update billing and/or shipping addresses
   */
  @Post(':checkoutId/address')
  @HttpCode(HttpStatus.OK)
  async updateAddresses(
    @Param('checkoutId') checkoutId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    this.logger.log(`Updating addresses for checkout ${checkoutId}`);
    return await this.checkoutService.updateAddresses(
      checkoutId,
      updateAddressDto,
    );
  }

  /**
   * POST /checkout/:checkoutId/shipping
   * Update shipping method
   */
  @Post(':checkoutId/shipping')
  @HttpCode(HttpStatus.OK)
  async updateShippingMethod(
    @Param('checkoutId') checkoutId: string,
    @Body() shippingMethodDto: ShippingMethodDto,
  ) {
    this.logger.log(`Updating shipping method for checkout ${checkoutId}`);
    return await this.checkoutService.updateShippingMethod(
      checkoutId,
      shippingMethodDto,
    );
  }

  /**
   * POST /checkout/:checkoutId/customer
   * Set guest customer by email (get-or-create). Use when guest enters email at checkout.
   */
  @Post(':checkoutId/customer')
  @HttpCode(HttpStatus.OK)
  async setGuestCustomer(
    @Param('checkoutId') checkoutId: string,
    @Body() dto: SetGuestCustomerDto,
  ) {
    this.logger.log(`Setting guest customer for checkout ${checkoutId}`);
    return await this.checkoutService.setGuestCustomer(checkoutId, dto);
  }

  /**
   * POST /checkout/:checkoutId/coupon
   * Apply or clear coupon code. Send { couponCode: "CODE" } or { couponCode: "" } to clear.
   */
  @Post(':checkoutId/coupon')
  @HttpCode(HttpStatus.OK)
  async applyCoupon(
    @Param('checkoutId') checkoutId: string,
    @Body() dto: ApplyCouponDto,
  ) {
    this.logger.log(`Applying coupon for checkout ${checkoutId}`);
    return await this.checkoutService.applyCoupon(checkoutId, dto);
  }

  /**
   * PATCH /checkout/:checkoutId/items/:variantId
   * Update item quantity (send 0 to remove)
   */
  @Patch(':checkoutId/items/:variantId')
  @HttpCode(HttpStatus.OK)
  async updateCheckoutItem(
    @Param('checkoutId') checkoutId: string,
    @Param('variantId') variantId: string,
    @Body() updateDto: UpdateCheckoutItemDto,
  ) {
    this.logger.log(
      `Updating item ${variantId} quantity for checkout ${checkoutId}`,
    );
    return await this.checkoutService.updateCheckoutItem(
      checkoutId,
      variantId,
      updateDto,
    );
  }

  /**
   * POST /checkout/:checkoutId/confirm
   * Confirm checkout and create order
   */
  @Post(':checkoutId/confirm')
  @HttpCode(HttpStatus.CREATED)
  async confirmCheckout(
    @Param('checkoutId') checkoutId: string,
    @Body() confirmCheckoutDto: ConfirmCheckoutDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Confirming checkout ${checkoutId}`);
    return await this.checkoutService.confirmCheckout(
      checkoutId,
      confirmCheckoutDto,
      req,
    );
  }
}
