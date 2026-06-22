import type { BrandConfig } from '../types/email.types';
import { escapeHtml, renderEmailLayout, renderPrimaryButton } from './base.template';

export function renderPasswordResetEmail(options: {
  brand: BrandConfig;
  userName: string;
  resetPasswordUrl: string;
}): { subject: string; html: string; text: string } {
  const { brand, userName, resetPasswordUrl } = options;

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:${brand.textColor};">Reset Your Password</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      Hi ${escapeHtml(userName)},
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      We received a request to reset the password for your ${escapeHtml(brand.storeName)} account. Click the button below to choose a new password.
    </p>
    ${renderPrimaryButton(resetPasswordUrl, 'Reset Password', brand)}
    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#6b7280;">
      This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
      If the button does not work, copy and paste this link into your browser:<br />
      <a href="${escapeHtml(resetPasswordUrl)}" style="color:${brand.primaryColor};word-break:break-all;">${escapeHtml(resetPasswordUrl)}</a>
    </p>`;

  const subject = `Reset your ${brand.storeName} password`;

  return {
    subject,
    html: renderEmailLayout({
      brand,
      previewText: 'Reset your account password',
      title: subject,
      bodyHtml,
    }),
    text: `Reset your password: ${resetPasswordUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
  };
}
