import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { MailMailbox } from '@prisma/client';
import { MailMailboxService } from './services/mail-mailbox.service';
import {
  MailMailboxPurpose,
  type SmtpConfig,
} from './types/mail-purpose.types';

export type SendMailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type CachedTransport = {
  transporter: Transporter;
  from: string;
};

@Injectable()
export class MailTransportService implements OnModuleDestroy {
  private readonly logger = new Logger(MailTransportService.name);
  private readonly transportCache = new Map<string, CachedTransport>();
  private envTransporter: Transporter | null = null;

  constructor(private readonly mailMailboxService: MailMailboxService) {}

  isEnabled(): boolean {
    return this.readEnv('MAIL_ENABLED') === 'true';
  }

  /** Clear cached nodemailer transports (call after mailbox updates). */
  invalidateTransports(mailboxId?: string): void {
    if (mailboxId) {
      const cached = this.transportCache.get(mailboxId);
      if (cached) {
        cached.transporter.close();
        this.transportCache.delete(mailboxId);
      }
      return;
    }
    for (const [, cached] of this.transportCache) {
      cached.transporter.close();
    }
    this.transportCache.clear();
    if (this.envTransporter) {
      this.envTransporter.close();
      this.envTransporter = null;
    }
  }

  private readEnv(key: string): string | undefined {
    const raw = process.env[key];
    if (raw == null || raw === '') return undefined;
    const trimmed = raw.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  private formatFrom(config: SmtpConfig): string {
    return `"${config.fromName}" <${config.fromAddress}>`;
  }

  private createTransporterFromConfig(config: SmtpConfig): Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      tls: { rejectUnauthorized: false },
    });
  }

  private getEnvSmtpConfig(): SmtpConfig | null {
    const host = this.readEnv('SMTP_HOST');
    const user = this.readEnv('SMTP_USER');
    const pass = this.readEnv('SMTP_PASS');
    if (!host || !user || !pass) return null;
    const port = Number(this.readEnv('SMTP_PORT') || 587);
    const secureEnv = this.readEnv('SMTP_SECURE');
    return {
      host,
      port,
      secure: secureEnv === 'true' || port === 465,
      user,
      pass,
      fromName:
        this.readEnv('MAIL_FROM_NAME') ||
        this.readEnv('STORE_NAME') ||
        'M. Essa Chemicals',
      fromAddress:
        this.readEnv('MAIL_FROM_ADDRESS') || user || 'noreply@localhost',
    };
  }

  private async resolveMailbox(
    purpose: MailMailboxPurpose,
  ): Promise<{ mailbox: MailMailbox; config: SmtpConfig } | null> {
    const mailbox = await this.mailMailboxService.resolveForPurpose(purpose);
    if (!mailbox) return null;
    const config = this.mailMailboxService.getSmtpConfig(mailbox);
    return { mailbox, config };
  }

  private getTransportForMailbox(
    mailboxId: string,
    config: SmtpConfig,
  ): CachedTransport {
    const existing = this.transportCache.get(mailboxId);
    if (existing) return existing;
    const transporter = this.createTransporterFromConfig(config);
    const cached: CachedTransport = {
      transporter,
      from: this.formatFrom(config),
    };
    this.transportCache.set(mailboxId, cached);
    this.logger.log(
      `SMTP transport cached for mailbox ${mailboxId} → ${config.host}:${config.port}`,
    );
    return cached;
  }

  private getEnvTransport(): CachedTransport {
    const config = this.getEnvSmtpConfig();
    if (!config) {
      throw new Error(
        'No mail mailbox configured for this purpose and SMTP env fallback is incomplete. ' +
          'Set SMTP_HOST, SMTP_USER, and SMTP_PASS or create a mailbox in Admin → Mail.',
      );
    }
    if (!this.envTransporter) {
      this.envTransporter = this.createTransporterFromConfig(config);
      this.logger.log(
        `SMTP env fallback transport → ${config.host}:${config.port}`,
      );
    }
    return {
      transporter: this.envTransporter,
      from: this.formatFrom(config),
    };
  }

  async sendMail(
    payload: SendMailPayload,
    purpose: MailMailboxPurpose,
  ): Promise<void> {
    const { to, subject, html, text } = payload;

    if (!this.isEnabled()) {
      this.logger.log(
        `[DEV] Email skipped (MAIL_ENABLED is not true) → ${to} | ${subject} | purpose=${purpose}`,
      );
      this.logger.debug(`[DEV] Text preview: ${text.slice(0, 240)}`);
      return;
    }

    try {
      const resolved = await this.resolveMailbox(purpose);
      const transport = resolved
        ? this.getTransportForMailbox(resolved.mailbox.id, resolved.config)
        : this.getEnvTransport();

      const info = await transport.transporter.sendMail({
        from: transport.from,
        to,
        subject,
        html,
        text,
      });
      this.logger.log(
        `Email sent to ${to} (${subject}) purpose=${purpose} — messageId=${info.messageId}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send email to ${to} purpose=${purpose}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.invalidateTransports();
  }
}
