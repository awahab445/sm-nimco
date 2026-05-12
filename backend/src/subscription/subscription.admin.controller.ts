import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../admin/decorators/require-permissions.decorator';
import { SubscriptionService } from './subscription.service';

@Controller('admin/subscription')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class SubscriptionAdminController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('subscribers')
  @RequirePermissions('subscriptions.manage')
  listSubscribers() {
    return this.subscriptionService.listSubscribers();
  }
}
