import { Injectable, Logger } from '@nestjs/common';

/**
 * Sends account-creation (set-password) link to guest customers.
 * In development we log the link; in production you can plug in nodemailer/SendGrid etc.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  /** Base URL for the frontend (e.g. https://shop.example.com). Used to build set-password link. */
  private get baseUrl(): string {
    return (
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      'http://localhost:3001'
    ).replace(/\/$/, '');
  }

  /**
   * Send "create your password" email to the given address.
   * For now we log the link; replace with real SMTP when MAIL_ENABLED or similar is set.
   */
  async sendAccountCreationLink(email: string, token: string): Promise<void> {
    const link = `${this.baseUrl}/create-password?token=${encodeURIComponent(token)}`;
    if (process.env.NODE_ENV !== 'production' || !process.env.MAIL_ENABLED) {
      this.logger.log(
        `[DEV] Account creation link for ${email}: ${link}`,
      );
      return;
    }
    // TODO: send real email via nodemailer/SendGrid
    this.logger.log(`Account creation email would be sent to ${email}`);
  }
}
