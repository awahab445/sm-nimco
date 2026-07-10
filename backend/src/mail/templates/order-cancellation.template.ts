import type {
  BrandConfig,
  OrderCancellationEmailDetails,
} from '../types/email.types';
import { formatCurrency } from '../utils/format-currency';
import {
  escapeHtml,
  renderEmailLayout,
  renderPrimaryButton,
} from './base.template';

export function renderOrderCancellationEmail(options: {
  brand: BrandConfig;
  order: OrderCancellationEmailDetails;
  supportUrl?: string;
}): { subject: string; html: string; text: string } {
  const { brand, order, supportUrl } = options;
  const customerName = order.customerName?.trim() || 'Customer';
  const cancelledDate = order.cancelledAt.toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const reasonBlock = order.reason
    ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;"><strong>Reason:</strong> ${escapeHtml(order.reason)}</p>`
    : '';

  const refundBlock = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:16px 0;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#991b1b;">Refund Status</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#7f1d1d;">${escapeHtml(order.refundMessage)}</p>
        </td>
      </tr>
    </table>`;

  const supportButton = supportUrl
    ? renderPrimaryButton(supportUrl, 'Contact Support', brand)
    : '';

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:${brand.textColor};">Order Cancelled</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      Hi ${escapeHtml(customerName)}, your order <strong>${escapeHtml(order.orderNumber)}</strong> has been cancelled as of ${escapeHtml(cancelledDate)}.
    </p>
    ${reasonBlock}
    ${refundBlock}
    <p style="margin:0 0 8px;font-size:14px;color:#374151;">
      Order total: <strong>${formatCurrency(order.grandTotal, order.currency)}</strong>
    </p>
    ${supportButton}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
      If this cancellation was unexpected, please contact us immediately.
    </p>`;

  const subject = `Order Cancelled — ${order.orderNumber}`;

  return {
    subject,
    html: renderEmailLayout({
      brand,
      previewText: `Your order ${order.orderNumber} has been cancelled.`,
      title: subject,
      bodyHtml,
    }),
    text: `Order Cancelled\n\nOrder: ${order.orderNumber}\nCancelled: ${cancelledDate}\n${order.reason ? `Reason: ${order.reason}\n` : ''}Refund: ${order.refundMessage}\nTotal: ${formatCurrency(order.grandTotal, order.currency)}`,
  };
}
