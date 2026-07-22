import type { BrandConfig } from '../types/email.types';
import {
  escapeHtml,
  renderEmailLayout,
  renderPrimaryButton,
} from './base.template';

export function renderAccountCreationEmail(options: {
  brand: BrandConfig;
  setPasswordUrl: string;
}): { subject: string; html: string; text: string } {
  const { brand, setPasswordUrl } = options;

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:${brand.textColor};">Create Your Password</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${brand.textColor};">
      You requested to create an account password for ${escapeHtml(brand.storeName)}. Click the button below to set your password and access your order history.
    </p>
    ${renderPrimaryButton(setPasswordUrl, 'Create Password', brand)}
    <p style="margin:0;font-size:13px;line-height:1.6;color:${brand.mutedTextColor};">
      This link expires soon. If you did not request this, you can safely ignore this email.
    </p>`;

  const subject = `Create your ${brand.storeName} account password`;

  return {
    subject,
    html: renderEmailLayout({
      brand,
      previewText: 'Set your account password',
      title: subject,
      bodyHtml,
    }),
    text: `Create your password: ${setPasswordUrl}`,
  };
}
