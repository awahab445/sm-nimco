import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../admin/decorators/require-permissions.decorator';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';

@Controller('admin/subscription')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class SubscriptionAdminController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('plans')
  @RequirePermissions('subscriptions.manage')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionService.createPlan(dto);
  }

  @Put('plans/:id')
  @RequirePermissions('subscriptions.manage')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  updatePlan(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.subscriptionService.updatePlan(id, dto);
  }

  @Get('plans')
  @RequirePermissions('subscriptions.manage')
  getPlans() {
    return this.subscriptionService.listAdminPlans();
  }

  @Delete('plans/:id')
  @RequirePermissions('subscriptions.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlan(@Param('id') id: string) {
    await this.subscriptionService.deletePlan(id);
  }
}
