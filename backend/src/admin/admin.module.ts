import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminBootstrapController } from './controllers/admin-bootstrap.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminRolesController } from './controllers/admin-roles.controller';
import { AdminAuthService } from './services/admin-auth.service';
import { AdminUserService } from './services/admin-user.service';
import { AdminRbacService } from './services/admin-rbac.service';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from './guards/admin-permissions.guard';

@Module({
  imports: [AuthModule, CatalogModule],
  controllers: [
    AdminAuthController,
    AdminBootstrapController,
    AdminUsersController,
    AdminRolesController,
  ],
  providers: [
    AdminAuthService,
    AdminUserService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [
    AdminRbacService,
    AdminUserService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
})
export class AdminModule {}
