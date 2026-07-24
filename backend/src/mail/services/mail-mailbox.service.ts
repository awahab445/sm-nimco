import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { MailMailbox } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import {
  MailMailboxPurpose,
  type SmtpConfig,
} from '../types/mail-purpose.types';
import { CreateMailMailboxDto } from '../dto/create-mail-mailbox.dto';
import { UpdateMailMailboxDto } from '../dto/update-mail-mailbox.dto';
import { TestMailConnectionDto } from '../dto/test-mail-connection.dto';
import { MASKED_SMTP_PASSWORD } from '../constants/mail.constants';
import { createSmtpTransporter } from '../smtp-transport.factory';

export type MailMailboxAdminDto = {
  id: string;
  code: string;
  name: string;
  purpose: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromAddress: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class MailMailboxService {
  private readonly logger = new Logger(MailMailboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  toAdminDto(mailbox: MailMailbox): MailMailboxAdminDto {
    return {
      id: mailbox.id,
      code: mailbox.code,
      name: mailbox.name,
      purpose: mailbox.purpose,
      smtpHost: mailbox.smtpHost,
      smtpPort: mailbox.smtpPort,
      smtpSecure: mailbox.smtpSecure,
      smtpUser: mailbox.smtpUser,
      smtpPass: mailbox.smtpPassEnc ? MASKED_SMTP_PASSWORD : '',
      fromName: mailbox.fromName,
      fromAddress: mailbox.fromAddress,
      isActive: mailbox.isActive,
      isDefault: mailbox.isDefault,
      createdAt: mailbox.createdAt,
      updatedAt: mailbox.updatedAt,
    };
  }

  async list(includeInactive = false): Promise<MailMailboxAdminDto[]> {
    const rows = await this.prisma.mailMailbox.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ purpose: 'asc' }, { isDefault: 'desc' }, { name: 'asc' }],
    });
    return rows.map((row) => this.toAdminDto(row));
  }

  async findById(id: string): Promise<MailMailboxAdminDto> {
    const row = await this.prisma.mailMailbox.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Mail mailbox not found');
    }
    return this.toAdminDto(row);
  }

  async create(dto: CreateMailMailboxDto): Promise<MailMailboxAdminDto> {
    const code = dto.code.trim().toLowerCase();
    await this.assertUniqueCode(code);
    if (dto.isDefault) {
      await this.clearDefaultForPurpose(dto.purpose);
    }
    const smtpPassEnc = this.encryption.encrypt(dto.smtpPass);
    const row = await this.prisma.mailMailbox.create({
      data: {
        code,
        name: dto.name.trim(),
        purpose: dto.purpose,
        smtpHost: dto.smtpHost.trim(),
        smtpPort: dto.smtpPort,
        smtpSecure: dto.smtpSecure ?? dto.smtpPort === 465,
        smtpUser: dto.smtpUser.trim(),
        smtpPassEnc,
        fromName: dto.fromName.trim(),
        fromAddress: dto.fromAddress.trim().toLowerCase(),
        isActive: dto.isActive ?? true,
        isDefault: dto.isDefault ?? false,
      },
    });
    return this.toAdminDto(row);
  }

  async update(
    id: string,
    dto: UpdateMailMailboxDto,
  ): Promise<MailMailboxAdminDto> {
    const existing = await this.prisma.mailMailbox.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Mail mailbox not found');
    }
    if (dto.code && dto.code.trim().toLowerCase() !== existing.code) {
      await this.assertUniqueCode(dto.code.trim().toLowerCase(), id);
    }
    const purpose = dto.purpose ?? (existing.purpose as MailMailboxPurpose);
    if (dto.isDefault === true) {
      await this.clearDefaultForPurpose(purpose, id);
    }
    const smtpPassEnc =
      dto.smtpPass !== undefined && dto.smtpPass.trim().length > 0
        ? this.encryption.encrypt(dto.smtpPass)
        : undefined;
    const row = await this.prisma.mailMailbox.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code.trim().toLowerCase() }),
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.purpose !== undefined && { purpose: dto.purpose }),
        ...(dto.smtpHost !== undefined && { smtpHost: dto.smtpHost.trim() }),
        ...(dto.smtpPort !== undefined && { smtpPort: dto.smtpPort }),
        ...(dto.smtpSecure !== undefined && { smtpSecure: dto.smtpSecure }),
        ...(dto.smtpUser !== undefined && { smtpUser: dto.smtpUser.trim() }),
        ...(smtpPassEnc !== undefined && { smtpPassEnc }),
        ...(dto.fromName !== undefined && { fromName: dto.fromName.trim() }),
        ...(dto.fromAddress !== undefined && {
          fromAddress: dto.fromAddress.trim().toLowerCase(),
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
    return this.toAdminDto(row);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.mailMailbox.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Mail mailbox not found');
    }
    await this.prisma.mailMailbox.delete({ where: { id } });
  }

  /** Resolve active mailbox for outbound email by purpose (falls back to GENERAL). */
  async resolveForPurpose(
    purpose: MailMailboxPurpose,
  ): Promise<MailMailbox | null> {
    const preferred = await this.prisma.mailMailbox.findFirst({
      where: { purpose, isActive: true, isDefault: true },
    });
    if (preferred) return preferred;

    const byPurpose = await this.prisma.mailMailbox.findFirst({
      where: { purpose, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    if (byPurpose) return byPurpose;

    if (purpose === MailMailboxPurpose.GENERAL) {
      return null;
    }

    // Allow a single Hostinger mailbox marked GENERAL to cover AUTH/ORDERS/etc.
    const generalDefault = await this.prisma.mailMailbox.findFirst({
      where: {
        purpose: MailMailboxPurpose.GENERAL,
        isActive: true,
        isDefault: true,
      },
    });
    if (generalDefault) return generalDefault;

    return this.prisma.mailMailbox.findFirst({
      where: { purpose: MailMailboxPurpose.GENERAL, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Decrypt SMTP credentials in memory only — never log or return from API. */
  getSmtpConfig(mailbox: MailMailbox): SmtpConfig {
    let pass: string;
    try {
      pass = this.encryption.decrypt(mailbox.smtpPassEnc);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to decrypt SMTP password for mailbox ${mailbox.code}: ${message}`,
      );
      throw new BadRequestException(
        'Mailbox SMTP credentials could not be decrypted. Check MAIL_ENCRYPTION_KEY.',
      );
    }
    return {
      host: mailbox.smtpHost,
      port: mailbox.smtpPort,
      // Normalize Hostinger-style ports regardless of what was saved in admin.
      secure:
        mailbox.smtpPort === 465
          ? true
          : mailbox.smtpPort === 587
            ? false
            : mailbox.smtpSecure,
      user: mailbox.smtpUser,
      pass,
      fromName: mailbox.fromName,
      fromAddress: mailbox.fromAddress,
    };
  }

  async getSmtpConfigById(id: string): Promise<SmtpConfig> {
    const mailbox = await this.prisma.mailMailbox.findUnique({ where: { id } });
    if (!mailbox) {
      throw new NotFoundException('Mail mailbox not found');
    }
    return this.getSmtpConfig(mailbox);
  }

  async testConnection(
    dto: TestMailConnectionDto,
  ): Promise<{ ok: true; message: string }> {
    const secure = dto.smtpSecure ?? dto.smtpPort === 465;
    const transporter = createSmtpTransporter({
      host: dto.smtpHost.trim(),
      port: dto.smtpPort,
      secure,
      user: dto.smtpUser.trim(),
      pass: dto.smtpPass,
    });
    try {
      await transporter.verify();
      if (dto.testRecipient) {
        const fromName = dto.fromName?.trim() || 'SM NIMCO & Sweets';
        const fromAddress =
          dto.fromAddress?.trim().toLowerCase() || dto.smtpUser.trim();
        await transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to: dto.testRecipient.trim().toLowerCase(),
          subject: 'SMTP test — SM NIMCO & Sweets',
          text: 'This is a test message from your mail server configuration.',
          html: '<p>This is a test message from your mail server configuration.</p>',
        });
        return {
          ok: true,
          message: `SMTP connection verified and test email sent to ${dto.testRecipient}.`,
        };
      }
      return { ok: true, message: 'SMTP connection verified successfully.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(
        `SMTP test failed (${dto.smtpHost}:${dto.smtpPort}, secure=${secure}): ${message}. ` +
          'For Hostinger try smtp.hostinger.com port 465 (SSL) or port 587 (STARTTLS).',
      );
    } finally {
      transporter.close();
    }
  }

  async testExistingMailbox(
    id: string,
    testRecipient?: string,
  ): Promise<{ ok: true; message: string }> {
    const config = await this.getSmtpConfigById(id);
    return this.testConnection({
      smtpHost: config.host,
      smtpPort: config.port,
      smtpSecure: config.secure,
      smtpUser: config.user,
      smtpPass: config.pass,
      fromName: config.fromName,
      fromAddress: config.fromAddress,
      testRecipient,
    });
  }

  private async assertUniqueCode(
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.mailMailbox.findUnique({
      where: { code },
    });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(`Mailbox code "${code}" is already in use`);
    }
  }

  private async clearDefaultForPurpose(
    purpose: MailMailboxPurpose,
    excludeId?: string,
  ): Promise<void> {
    await this.prisma.mailMailbox.updateMany({
      where: {
        purpose,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      data: { isDefault: false },
    });
  }
}
