import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { CheckPermission } from '../decorators/check-permission.decorator';
import { SessionService } from '../../sessions/session.service';

class ToggleSessionBlockDto {
  @IsBoolean()
  isBlocked!: boolean;
}

@Controller('admin/sessions')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminSessionsController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * GET /admin/sessions — connected store-operator sessions.
   */
  @Get()
  @CheckPermission('admin.users', 'read')
  async list() {
    return this.sessionService.listSessions();
  }

  /**
   * PATCH /admin/sessions/:userId/block — block or unblock (revokes vendor JWT access).
   */
  @Patch(':userId/block')
  @CheckPermission('admin.users', 'update')
  async setBlocked(
    @Param('userId') userId: string,
    @Body() body: ToggleSessionBlockDto,
  ) {
    return this.sessionService.setBlocked(userId, body.isBlocked);
  }
}
