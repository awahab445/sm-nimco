import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminUserService } from '../services/admin-user.service';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { CurrentAdminId } from '../decorators/current-admin.decorator';

@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminUsersController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('admin.users.create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() dto: CreateAdminUserDto,
    @CurrentAdminId() actorId: string,
  ) {
    return this.adminUserService.create(dto, actorId);
  }
}
