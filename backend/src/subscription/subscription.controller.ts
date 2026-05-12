import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  subscribe(@Body() dto: SubscribeDto) {
    return this.subscriptionService.subscribe(dto);
  }
}
