import { Injectable, Logger } from '@nestjs/common';
import type {
  BrandConfig,
  OrderCancellationEmailDetails,
  OrderEmailDetails,
} from './types/email.types';
import { MailTransportService } from './mail-transport.service';
import { MailMailboxPurpose } from './types/mail-purpose.types';
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

  /**
   * Absolute logo URL for email clients (relative paths will not load).
   * Prefer STORE_LOGO_URL; otherwise FRONTEND_URL + /logo.png (or a relative path).
   */
  private resolveLogoUrl(): string | undefined {
    const explicit = process.env.STORE_LOGO_URL?.trim();
    if (explicit) {
      if (/^https?:\/\//i.test(explicit)) {
        return explicit;
      }
      const path = explicit.startsWith('/') ? explicit : `/${explicit}`;
      return `${this.storefrontUrl}${path}`;
    }

    // Default storefront public asset used by the header when no override is set.
    return `${this.storefrontUrl}/logo.png`;
  }

  private getBrandConfig(): BrandConfig {
    const base = this.storefrontUrl;
    const supportUrl =
      process.env.STORE_SUPPORT_URL?.trim() || `${base}/shipping-returns`;

    return {
      storeName: process.env.STORE_NAME?.trim() || 'M. ESSA CHEMICALS',
      logoUrl: this.resolveLogoUrl(),
      // Essa Chemicals: charcoal text, orange CTAs (aligned with storefront theme)
      primaryColor: process.env.STORE_BRAND_PRIMARY || '#222222',
      ctaColor: process.env.STORE_BRAND_CTA || '#ff4800',
      accentColor: process.env.STORE_BRAND_ACCENT || '#ff6a33',
      textColor: process.env.STORE_BRAND_TEXT || '#222222',
      mutedTextColor: process.env.STORE_BRAND_MUTED || '#878787',
      footerTextColor: process.env.STORE_BRAND_FOOTER_TEXT || '#32355d',
      backgroundColor: process.env.STORE_BRAND_BG || '#f5f5f5',
      borderColor: process.env.STORE_BRAND_BORDER || '#eeeeee',
      social: {
        facebook: process.env.STORE_SOCIAL_FACEBOOK || undefined,
        instagram: process.env.STORE_SOCIAL_INSTAGRAM || undefined,
        twitter: process.env.STORE_SOCIAL_TWITTER || undefined,
        linkedin: process.env.STORE_SOCIAL_LINKEDIN || undefined,
      },
      links: {
        shop: process.env.STORE_SHOP_URL?.trim() || base,
        trackOrder:
          process.env.STORE_TRACK_ORDER_URL?.trim() || `${base}/track-order`,
        privacy:
          process.env.STORE_PRIVACY_URL?.trim() || `${base}/privacy-policy`,
        terms:
          process.env.STORE_TERMS_URL?.trim() || `${base}/terms-conditions`,
        support: supportUrl,
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
      this.mailTransport.sendMail(
        {
          to: normalizedEmail,
          subject,
          html,
          text,
        },
        MailMailboxPurpose.AUTH,
      ),
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
      this.mailTransport.sendMail(
        {
          to: normalizedEmail,
          subject,
          html,
          text,
        },
        MailMailboxPurpose.WELCOME,
      ),
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
      this.mailTransport.sendMail(
        {
          to: normalizedEmail,
          subject,
          html,
          text,
        },
        MailMailboxPurpose.ORDERS,
      ),
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
    const supportUrl = brand.links.support;

    const { subject, html, text } = renderOrderCancellationEmail({
      brand,
      order: orderDetails,
      supportUrl,
    });

    await this.safeSend('sendOrderCancellationEmail', normalizedEmail, () =>
      this.mailTransport.sendMail(
        {
          to: normalizedEmail,
          subject,
          html,
          text,
        },
        MailMailboxPurpose.ORDERS,
      ),
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
      this.mailTransport.sendMail(
        {
          to: normalizedEmail,
          subject,
          html,
          text,
        },
        MailMailboxPurpose.AUTH,
      ),
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
      this.mailTransport.sendMail(
        {
          to: normalizedEmail,
          subject,
          html,
          text,
        },
        MailMailboxPurpose.AUTH,
      ),
    );
  }
}
