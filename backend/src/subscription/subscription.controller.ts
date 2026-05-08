import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CustomerJwtPayload } from '../auth/strategies/jwt.strategy';
import { CustomerJwtAuthGuard } from '../auth/guards/customer-jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { SubscriptionService } from './subscription.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { ChangeSubscriptionPlanDto } from './dto/change-subscription-plan.dto';
import { ToggleSubscriptionPauseDto } from './dto/toggle-subscription-pause.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @Public()
  getPublicPlans() {
    return this.subscriptionService.listPublicPlans();
  }

  @Post('subscribe')
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  subscribe(@CurrentUser() user: CustomerJwtPayload, @Body() dto: SubscribeDto) {
    return this.subscriptionService.subscribe(user.customerId, dto);
  }

  @Get('my-subscription')
  @UseGuards(CustomerJwtAuthGuard)
  mySubscription(@CurrentUser() user: CustomerJwtPayload) {
    return this.subscriptionService.mySubscription(user.customerId);
  }

  @Post('cancel')
  @UseGuards(CustomerJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  cancel(@CurrentUser() user: CustomerJwtPayload, @Body() _dto: CancelSubscriptionDto) {
    return this.subscriptionService.cancel(user.customerId);
  }

  @Post('renew')
  @UseGuards(CustomerJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  renew(@CurrentUser() user: CustomerJwtPayload, @Body() dto: RenewSubscriptionDto) {
    return this.subscriptionService.renew(user.customerId, dto);
  }

  @Post('change-plan')
  @UseGuards(CustomerJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  changePlan(@CurrentUser() user: CustomerJwtPayload, @Body() dto: ChangeSubscriptionPlanDto) {
    return this.subscriptionService.changePlan(user.customerId, dto);
  }

  @Post('pause')
  @UseGuards(CustomerJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  pause(@CurrentUser() user: CustomerJwtPayload, @Body() _dto: ToggleSubscriptionPauseDto) {
    return this.subscriptionService.pause(user.customerId);
  }

  @Post('resume')
  @UseGuards(CustomerJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  resume(@CurrentUser() user: CustomerJwtPayload, @Body() _dto: ToggleSubscriptionPauseDto) {
    return this.subscriptionService.resume(user.customerId);
  }

  @Post('webhook/payment')
  @Public()
  webhook(@Body() payload: Record<string, unknown>) {
    return this.subscriptionService.handleWebhook(payload);
  }
}
