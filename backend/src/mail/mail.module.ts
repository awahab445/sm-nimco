import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { EmailService } from './email.service';
import { MailTransportService } from './mail-transport.service';
import { MailEventHandlers } from './events/mail.handlers';

@Module({
  imports: [CatalogModule],
  providers: [MailTransportService, EmailService, MailEventHandlers],
  exports: [EmailService],
})
export class MailModule {}
