import type { BrandConfig } from '../types/email.types';
import {
  escapeHtml,
  renderEmailLayout,
  renderPrimaryButton,
} from './base.template';

export function renderWelcomeEmail(options: {
  brand: BrandConfig;
  userName: string;
  storefrontUrl: string;
}): { subject: string; html: string; text: string } {
  const { brand, userName, storefrontUrl } = options;
  const greetingName = userName.trim() || 'there';

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:${brand.textColor};">Welcome to ${escapeHtml(brand.storeName)}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${brand.textColor};">
      Hi ${escapeHtml(greetingName)},
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${brand.textColor};">
      Thank you for creating an account with us. You can now track orders, save addresses, and enjoy a faster checkout experience.
    </p>
    ${renderPrimaryButton(storefrontUrl, 'Start Shopping', brand)}
    <p style="margin:0;font-size:13px;line-height:1.6;color:${brand.mutedTextColor};">
      If you did not create this account, please contact our support team.
    </p>`;

  const subject = `Welcome to ${brand.storeName}`;

  return {
    subject,
    html: renderEmailLayout({
      brand,
      previewText: `Welcome aboard, ${greetingName}!`,
      title: subject,
      bodyHtml,
    }),
    text: `Welcome to ${brand.storeName}\n\nHi ${greetingName},\n\nThank you for registering. Visit ${storefrontUrl} to start shopping.`,
  };
}
