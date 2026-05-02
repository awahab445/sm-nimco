import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';

@Controller('admin/roles')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminRolesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('admin.roles.read')
  async list() {
    return this.prisma.adminRole.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        isSystem: true,
        permissions: {
          select: {
            permission: { select: { key: true, description: true } },
          },
        },
      },
    });
  }
}
