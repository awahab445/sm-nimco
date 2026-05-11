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
import { AdminUserService } from '../services/admin-user.service';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dto/update-admin-user.dto';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { CheckPermission } from '../decorators/check-permission.decorator';
import { CurrentAdminId } from '../decorators/current-admin.decorator';

@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminUsersController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @CheckPermission('admin.users', 'read')
  async list() {
    return this.adminUserService.listAll();
  }

  @Get(':id')
  @CheckPermission('admin.users', 'read')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.adminUserService.findById(id);
    return this.adminUserService.serializeUser(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPermission('admin.users', 'create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() dto: CreateAdminUserDto,
    @CurrentAdminId() actorId: string,
  ) {
    return this.adminUserService.create(dto, actorId);
  }

  @Patch(':id')
  @CheckPermission('admin.users', 'update')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentAdminId() actorId: string,
  ) {
    return this.adminUserService.update(id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPermission('admin.users', 'delete')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentAdminId() actorId: string,
  ) {
    return this.adminUserService.remove(id, actorId);
  }
}
