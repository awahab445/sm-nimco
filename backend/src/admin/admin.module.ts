import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminBootstrapController } from './controllers/admin-bootstrap.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminRolesController } from './controllers/admin-roles.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminAuthService } from './services/admin-auth.service';
import { AdminUserService } from './services/admin-user.service';
import { AdminRoleService } from './services/admin-role.service';
import { AdminRbacService } from './services/admin-rbac.service';
import { AdminRbacBootstrapService } from './services/admin-rbac-bootstrap.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from './guards/admin-permissions.guard';

@Module({
  imports: [AuthModule, CatalogModule],
  controllers: [
    AdminAuthController,
    AdminBootstrapController,
    AdminUsersController,
    AdminRolesController,
    AdminAnalyticsController,
  ],
  providers: [
    AdminAuthService,
    AdminUserService,
    AdminRoleService,
    AdminRbacService,
    AdminAnalyticsService,
    // Runs `ensureAdminRbacSeeded` on boot (OnModuleInit) so newly-added
    // permission keys land in the catalog without a manual `prisma db seed`.
    AdminRbacBootstrapService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [
    AdminRbacService,
    AdminUserService,
    AdminRoleService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
})
export class AdminModule {}
