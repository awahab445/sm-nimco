import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { EncryptionService } from '../common/services/encryption.service';
import { EmailService } from './email.service';
import { MailTransportService } from './mail-transport.service';
import { MailEventHandlers } from './events/mail.handlers';
import { MailMailboxService } from './services/mail-mailbox.service';
import { AdminMailMailboxController } from './controllers/admin-mail-mailbox.controller';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule],
  controllers: [AdminMailMailboxController],
  providers: [
    EncryptionService,
    MailMailboxService,
    MailTransportService,
    EmailService,
    MailEventHandlers,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [EmailService, MailMailboxService, MailTransportService],
})
export class MailModule {}
