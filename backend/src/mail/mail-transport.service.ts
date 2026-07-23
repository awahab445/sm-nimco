import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import type { MailMailbox } from '@prisma/client';
import { MailMailboxService } from './services/mail-mailbox.service';
import {
  MailMailboxPurpose,
  type SmtpConfig,
} from './types/mail-purpose.types';
import {
  createSmtpTransporter,
  isTransientSmtpError,
} from './smtp-transport.factory';

export type SendMailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type CachedTransport = {
  transporter: Transporter;
  from: string;
  mailboxId?: string;
  endpoint: string;
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

  private endpointLabel(config: SmtpConfig): string {
    return `${config.host}:${config.port} secure=${config.secure}`;
  }

  private createTransporterFromConfig(config: SmtpConfig): Transporter {
    return createSmtpTransporter(config);
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
      mailboxId,
      endpoint: this.endpointLabel(config),
    };
    this.transportCache.set(mailboxId, cached);
    this.logger.log(
      `SMTP transport cached for mailbox ${mailboxId} → ${cached.endpoint}`,
    );
    return cached;
  }

  private getEnvTransport(): CachedTransport {
    const config = this.getEnvSmtpConfig();
    if (!config) {
      throw new Error(
        'No mail mailbox configured for this purpose and SMTP env fallback is incomplete. ' +
          'Set SMTP_HOST, SMTP_USER, and SMTP_PASS or create a mailbox in Admin → Mail ' +
          '(purpose AUTH or GENERAL) with Hostinger smtp.hostinger.com.',
      );
    }
    if (!this.envTransporter) {
      this.envTransporter = this.createTransporterFromConfig(config);
      this.logger.log(
        `SMTP env fallback transport → ${this.endpointLabel(config)}`,
      );
    }
    return {
      transporter: this.envTransporter,
      from: this.formatFrom(config),
      endpoint: this.endpointLabel(config),
    };
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async sendWithRetry(
    transport: CachedTransport,
    payload: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
    },
    rebuild: () => CachedTransport,
  ): Promise<string> {
    let lastError: unknown;
    let active = transport;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const info = await active.transporter.sendMail(payload);
        return String(info.messageId ?? '');
      } catch (error) {
        lastError = error;
        if (!isTransientSmtpError(error) || attempt === 2) {
          break;
        }
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Transient SMTP error on ${active.endpoint} (attempt ${attempt}/2): ${message}. Retrying…`,
        );
        if (active.mailboxId) {
          this.invalidateTransports(active.mailboxId);
        } else if (this.envTransporter) {
          this.envTransporter.close();
          this.envTransporter = null;
        }
        await this.sleep(750);
        active = rebuild();
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
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
      const rebuild = (): CachedTransport =>
        resolved
          ? this.getTransportForMailbox(resolved.mailbox.id, resolved.config)
          : this.getEnvTransport();
      const transport = rebuild();

      const messageId = await this.sendWithRetry(
        transport,
        {
          from: transport.from,
          to,
          subject,
          html,
          text,
        },
        rebuild,
      );
      this.logger.log(
        `Email sent to ${to} (${subject}) purpose=${purpose} via ${transport.endpoint} — messageId=${messageId}`,
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
