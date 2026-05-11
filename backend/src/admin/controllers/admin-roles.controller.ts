import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminRoleService } from '../services/admin-role.service';
import { CreateAdminRoleDto } from '../dto/create-admin-role.dto';
import { UpdateAdminRoleDto } from '../dto/update-admin-role.dto';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { CheckPermission } from '../decorators/check-permission.decorator';
import { CurrentAdminId } from '../decorators/current-admin.decorator';

@Controller('admin/roles')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminRolesController {
  constructor(private readonly adminRoleService: AdminRoleService) {}

  @Get()
  @CheckPermission('admin.roles', 'read')
  async list() {
    return this.adminRoleService.list();
  }

  /** Catalog of every seeded permission key — used by the role editor UI. */
  @Get('permissions/catalog')
  @CheckPermission('admin.roles', 'read')
  async listPermissions() {
    return this.adminRoleService.listAllPermissionKeys();
  }

  /**
   * Delete a permission row from the catalog entirely.
   *
   * NOTE: This is catalog-wide and revokes the permission from every role
   * that holds it (`admin_role_permissions` cascades on permissionId).
   * The service rejects non-super-admin actors. Super-admins can delete
   * seeded "system" keys too, but the frontend warns first.
   *
   * Permission keys may contain dots (e.g. `admin.users.read`), which the
   * default param matcher handles correctly.
   */
  @Delete('permissions/:key')
  @HttpCode(HttpStatus.OK)
  @CheckPermission('admin.roles', 'manage')
  async removePermission(
    @Param('key') key: string,
    @CurrentAdminId() actorId: string,
  ) {
    return this.adminRoleService.removePermission(key, actorId);
  }

  @Get(':id')
  @CheckPermission('admin.roles', 'read')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminRoleService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPermission('admin.roles', 'manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateAdminRoleDto) {
    return this.adminRoleService.create(dto);
  }

  @Patch(':id')
  @CheckPermission('admin.roles', 'manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAdminRoleDto,
  ) {
    return this.adminRoleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPermission('admin.roles', 'manage')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentAdminId() actorId: string,
  ) {
    return this.adminRoleService.remove(id, actorId);
  }
}
