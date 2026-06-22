import type { BrandConfig } from '../types/email.types';
import { escapeHtml, renderEmailLayout, renderPrimaryButton } from './base.template';

export function renderEmailVerificationEmail(options: {
  brand: BrandConfig;
  userName: string;
  verificationUrl: string;
}): { subject: string; html: string; text: string } {
  const { brand, userName, verificationUrl } = options;
  const greetingName = userName.trim() || 'there';

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:${brand.textColor};">Verify your email</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      Hi ${escapeHtml(greetingName)},
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      Thanks for signing up with ${escapeHtml(brand.storeName)}. Please confirm your email address to activate your account and start shopping.
    </p>
    ${renderPrimaryButton(verificationUrl, 'Verify Email Address', brand)}
    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#6b7280;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 16px;font-size:12px;line-height:1.5;color:#4f90f1;word-break:break-all;">
      ${escapeHtml(verificationUrl)}
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
      If you did not create an account, you can safely ignore this email.
    </p>`;

  const subject = `Verify your ${brand.storeName} account`;

  return {
    subject,
    html: renderEmailLayout({
      brand,
      previewText: 'Confirm your email to activate your account.',
      title: subject,
      bodyHtml,
    }),
    text: `Verify your ${brand.storeName} account\n\nHi ${greetingName},\n\nPlease verify your email: ${verificationUrl}`,
  };
}
