import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type SendMailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

@Injectable()
export class MailTransportService implements OnModuleDestroy {
  private readonly logger = new Logger(MailTransportService.name);
  private transporter: Transporter | null = null;

  isEnabled(): boolean {
    return this.readEnv('MAIL_ENABLED') === 'true';
  }

  /** Read env var, trimming whitespace and optional surrounding quotes. */
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

  private getFromAddress(): string {
    const name = this.readEnv('MAIL_FROM_NAME') || this.readEnv('STORE_NAME') || 'Store';
    const address =
      this.readEnv('MAIL_FROM_ADDRESS') ||
      this.readEnv('SMTP_USER') ||
      'noreply@localhost';
    return `"${name}" <${address}>`;
  }

  private createTransporter(): Transporter {
    const host = this.readEnv('SMTP_HOST');
    const port = Number(this.readEnv('SMTP_PORT') || 587);
    const user = this.readEnv('SMTP_USER');
    const pass = this.readEnv('SMTP_PASS');
    const secureEnv = this.readEnv('SMTP_SECURE');
    const secure = secureEnv === 'true' || port === 465;

    if (!host || !user || !pass) {
      throw new Error(
        'SMTP is not fully configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS when MAIL_ENABLED=true.',
      );
    }

    this.logger.log(
      `Initializing Gmail SMTP transport → ${host}:${port} (secure=${secure}, user=${user})`,
    );

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = this.createTransporter();
    }
    return this.transporter;
  }

  async sendMail(payload: SendMailPayload): Promise<void> {
    const { to, subject, html, text } = payload;

    if (!this.isEnabled()) {
      this.logger.log(
        `[DEV] Email skipped (MAIL_ENABLED is not true) → ${to} | ${subject}`,
      );
      this.logger.debug(`[DEV] Text preview: ${text.slice(0, 240)}`);
      return;
    }

    try {
      const info = await this.getTransporter().sendMail({
        from: this.getFromAddress(),
        to,
        subject,
        html,
        text,
      });
      this.logger.log(`Email sent to ${to} (${subject}) — messageId=${info.messageId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send email to ${to}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
  }
}
