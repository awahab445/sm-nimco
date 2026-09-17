import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { CheckPermission } from '../decorators/check-permission.decorator';
import { SessionService } from '../../sessions/session.service';

/**
 * Activity / session logs for staff monitoring (store-operator device activity).
 * There is no separate AuditLog table; SessionLog is the persisted activity source.
 *
 * GET /admin/activity-logs
 */
@Controller('admin/activity-logs')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminActivityLogsController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * List recent staff session activity (IP, device, last active, block status).
   * Allowed for Super Admin (slug bypass) and roles with `reports.read`
   * (e.g. Store Owner, Manager).
   */
  @Get()
  @CheckPermission('reports', 'read')
  async list() {
    const sessions = await this.sessionService.listSessions();
    return {
      data: sessions.map((s) => ({
        id: s.userId,
        userId: s.userId,
        email: s.email,
        name: s.name,
        role: s.role,
        ipAddress: s.ipAddress,
        deviceInfo: s.deviceInfo,
        lastActiveAt: s.lastActiveAt,
        isBlocked: s.isBlocked,
        status: s.status,
        activityType: 'session',
      })),
    };
  }
}
