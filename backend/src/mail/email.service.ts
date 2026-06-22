import { Injectable, Logger } from '@nestjs/common';
import type {
  BrandConfig,
  OrderCancellationEmailDetails,
  OrderEmailDetails,
} from './types/email.types';
import { MailTransportService } from './mail-transport.service';
import { renderWelcomeEmail } from './templates/welcome.template';
import { renderOrderPlacementEmail } from './templates/order-placement.template';
import { renderOrderCancellationEmail } from './templates/order-cancellation.template';
import { renderAccountCreationEmail } from './templates/account-creation.template';
import { renderEmailVerificationEmail } from './templates/email-verification.template';
import { renderPasswordResetEmail } from './templates/password-reset.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailTransport: MailTransportService) {}

  private get storefrontUrl(): string {
    return (
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      'http://localhost:3001'
    ).replace(/\/$/, '');
  }

  private get apiBaseUrl(): string {
    return (
      process.env.APP_URL ||
      process.env.API_URL ||
      `http://localhost:${process.env.PORT || 3000}`
    ).replace(/\/$/, '');
  }

  private getBrandConfig(): BrandConfig {
    return {
      storeName: process.env.STORE_NAME || 'M. Essa Chemicals',
      logoUrl: process.env.STORE_LOGO_URL || undefined,
      primaryColor: process.env.STORE_BRAND_PRIMARY || '#4f90f1',
      accentColor: process.env.STORE_BRAND_ACCENT || '#3577d9',
      textColor: process.env.STORE_BRAND_TEXT || '#1A2E40',
      backgroundColor: process.env.STORE_BRAND_BG || '#F5F5F5',
      social: {
        facebook: process.env.STORE_SOCIAL_FACEBOOK || undefined,
        instagram: process.env.STORE_SOCIAL_INSTAGRAM || undefined,
        twitter: process.env.STORE_SOCIAL_TWITTER || undefined,
        linkedin: process.env.STORE_SOCIAL_LINKEDIN || undefined,
      },
    };
  }

  private async safeSend(
    operation: string,
    to: string,
    send: () => Promise<void>,
  ): Promise<void> {
    try {
      await send();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`${operation} failed for ${to}: ${message}`);
    }
  }

  /**
   * Send email verification link for new registrations.
   */
  async sendEmailVerificationEmail(
    userEmail: string,
    userName: string,
    token: string,
  ): Promise<void> {
    const brand = this.getBrandConfig();
    const normalizedEmail = userEmail.toLowerCase().trim();
    const verificationUrl = `${this.storefrontUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const { subject, html, text } = renderEmailVerificationEmail({
      brand,
      userName,
      verificationUrl,
    });

    await this.safeSend('sendEmailVerificationEmail', normalizedEmail, () =>
      this.mailTransport.sendMail({
        to: normalizedEmail,
        subject,
        html,
        text,
      }),
    );
  }

  /**
   * Send welcome email when a customer's email has been verified.
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const brand = this.getBrandConfig();
    const normalizedEmail = userEmail.toLowerCase().trim();
    const { subject, html, text } = renderWelcomeEmail({
      brand,
      userName,
      storefrontUrl: this.storefrontUrl,
    });

    await this.safeSend('sendWelcomeEmail', normalizedEmail, () =>
      this.mailTransport.sendMail({
        to: normalizedEmail,
        subject,
        html,
        text,
      }),
    );
  }

  /**
   * Send order confirmation after successful placement.
   */
  async sendOrderPlacementEmail(
    userEmail: string,
    orderDetails: OrderEmailDetails,
  ): Promise<void> {
    const brand = this.getBrandConfig();
    const normalizedEmail = userEmail.toLowerCase().trim();
    const trackOrderUrl =
      orderDetails.trackOrderUrl ||
      `${this.storefrontUrl}/track-order?orderNumber=${encodeURIComponent(orderDetails.orderNumber)}&email=${encodeURIComponent(normalizedEmail)}`;

    const { subject, html, text } = renderOrderPlacementEmail({
      brand,
      order: { ...orderDetails, trackOrderUrl },
    });

    await this.safeSend('sendOrderPlacementEmail', normalizedEmail, () =>
      this.mailTransport.sendMail({
        to: normalizedEmail,
        subject,
        html,
        text,
      }),
    );
  }

  /**
   * Send order cancellation notification with refund status.
   */
  async sendOrderCancellationEmail(
    userEmail: string,
    orderDetails: OrderCancellationEmailDetails,
  ): Promise<void> {
    const brand = this.getBrandConfig();
    const normalizedEmail = userEmail.toLowerCase().trim();
    const supportUrl = `${this.storefrontUrl}/contact`;

    const { subject, html, text } = renderOrderCancellationEmail({
      brand,
      order: orderDetails,
      supportUrl,
    });

    await this.safeSend('sendOrderCancellationEmail', normalizedEmail, () =>
      this.mailTransport.sendMail({
        to: normalizedEmail,
        subject,
        html,
        text,
      }),
    );
  }

  /**
   * Send set-password link for guest account conversion (existing auth flow).
   */
  async sendAccountCreationLink(email: string, token: string): Promise<void> {
    const brand = this.getBrandConfig();
    const normalizedEmail = email.toLowerCase().trim();
    const setPasswordUrl = `${this.storefrontUrl}/create-password?token=${encodeURIComponent(token)}`;
    const { subject, html, text } = renderAccountCreationEmail({
      brand,
      setPasswordUrl,
    });

    await this.safeSend('sendAccountCreationLink', normalizedEmail, () =>
      this.mailTransport.sendMail({
        to: normalizedEmail,
        subject,
        html,
        text,
      }),
    );
  }

  /**
   * Send password reset link for registered customers.
   */
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    token: string,
  ): Promise<void> {
    const brand = this.getBrandConfig();
    const normalizedEmail = userEmail.toLowerCase().trim();
    const resetPasswordUrl = `${this.storefrontUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const { subject, html, text } = renderPasswordResetEmail({
      brand,
      userName,
      resetPasswordUrl,
    });

    await this.safeSend('sendPasswordResetEmail', normalizedEmail, () =>
      this.mailTransport.sendMail({
        to: normalizedEmail,
        subject,
        html,
        text,
      }),
    );
  }
}
