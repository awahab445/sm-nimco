import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MailMailboxService } from '../services/mail-mailbox.service';
import { MailTransportService } from '../mail-transport.service';
import { CreateMailMailboxDto } from '../dto/create-mail-mailbox.dto';
import { UpdateMailMailboxDto } from '../dto/update-mail-mailbox.dto';
import { TestMailConnectionDto } from '../dto/test-mail-connection.dto';
import { TestExistingMailboxDto } from '../dto/test-existing-mailbox.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('admin/mail/mailboxes')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminMailMailboxController {
  constructor(
    private readonly mailMailboxService: MailMailboxService,
    private readonly mailTransport: MailTransportService,
  ) {}

  @Get()
  @RequirePermissions('mail.manage')
  async list(@Query('includeInactive') includeInactive?: string) {
    const data = await this.mailMailboxService.list(includeInactive === 'true');
    return { data };
  }

  @Post('test-connection')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('mail.manage')
  async testConnection(@Body() dto: TestMailConnectionDto) {
    return this.mailMailboxService.testConnection(dto);
  }

  @Get(':id')
  @RequirePermissions('mail.manage')
  async findOne(@Param('id') id: string) {
    const data = await this.mailMailboxService.findById(id);
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('mail.manage')
  async create(@Body() dto: CreateMailMailboxDto) {
    const data = await this.mailMailboxService.create(dto);
    this.mailTransport.invalidateTransports();
    return { data };
  }

  @Post(':id/test-connection')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('mail.manage')
  async testExisting(
    @Param('id') id: string,
    @Body() dto: TestExistingMailboxDto,
  ) {
    return this.mailMailboxService.testExistingMailbox(id, dto.testRecipient);
  }

  @Patch(':id')
  @RequirePermissions('mail.manage')
  async update(@Param('id') id: string, @Body() dto: UpdateMailMailboxDto) {
    const data = await this.mailMailboxService.update(id, dto);
    this.mailTransport.invalidateTransports(id);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('mail.manage')
  async remove(@Param('id') id: string) {
    await this.mailMailboxService.remove(id);
    this.mailTransport.invalidateTransports(id);
  }
}
