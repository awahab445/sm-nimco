import type { BrandConfig, OrderEmailDetails } from '../types/email.types';
import { formatCurrency } from '../utils/format-currency';
import {
  escapeHtml,
  renderEmailLayout,
  renderPrimaryButton,
} from './base.template';

function renderOrderItemsTable(
  order: OrderEmailDetails,
  brand: BrandConfig,
): string {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 10px;border-bottom:1px solid #e5e7eb;font-size:14px;color:${brand.textColor};">${escapeHtml(item.name)}</td>
        <td align="center" style="padding:12px 10px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">${item.quantity}</td>
        <td align="right" style="padding:12px 10px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">${formatCurrency(item.unitPrice, order.currency)}</td>
        <td align="right" style="padding:12px 10px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:600;color:${brand.textColor};">${formatCurrency(item.lineTotal, order.currency)}</td>
      </tr>`,
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin:20px 0;">
      <thead>
        <tr style="background-color:#eef4fe;">
          <th align="left" style="padding:12px 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.4px;color:${brand.textColor};">Product</th>
          <th align="center" style="padding:12px 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.4px;color:${brand.textColor};">Qty</th>
          <th align="right" style="padding:12px 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.4px;color:${brand.textColor};">Price</th>
          <th align="right" style="padding:12px 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.4px;color:${brand.textColor};">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

function renderTotals(order: OrderEmailDetails, brand: BrandConfig): string {
  const row = (label: string, value: number, bold = false) => `
    <tr>
      <td style="padding:6px 0;font-size:14px;color:#6b7280;${bold ? `font-weight:700;color:${brand.textColor};` : ''}">${label}</td>
      <td align="right" style="padding:6px 0;font-size:14px;color:${bold ? brand.textColor : '#374151'};${bold ? 'font-weight:700;font-size:16px;' : ''}">${formatCurrency(value, order.currency)}</td>
    </tr>`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
      ${row('Subtotal', order.subtotal)}
      ${order.discountTotal > 0 ? row('Discount', -order.discountTotal) : ''}
      ${row('Shipping', order.shippingTotal)}
      ${row('Tax', order.taxTotal)}
      ${row('Grand Total', order.grandTotal, true)}
    </table>`;
}

export function renderOrderPlacementEmail(options: {
  brand: BrandConfig;
  order: OrderEmailDetails;
}): { subject: string; html: string; text: string } {
  const { brand, order } = options;
  const customerName = order.customerName?.trim() || 'Customer';
  const placedDate = order.placedAt.toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const trackButton = order.trackOrderUrl
    ? renderPrimaryButton(order.trackOrderUrl, 'Track Your Order', brand)
    : '';

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:${brand.textColor};">Order Confirmed</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      Hi ${escapeHtml(customerName)}, thank you for your order. We have received it and will begin processing it shortly.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:8px;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0;font-size:13px;color:#6b7280;">Order Number</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:${brand.textColor};">${escapeHtml(order.orderNumber)}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Placed on ${escapeHtml(placedDate)}</p>
        </td>
      </tr>
    </table>
    ${renderOrderItemsTable(order, brand)}
    ${renderTotals(order, brand)}
    ${trackButton}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
      If you have any questions about your order, reply to this email or contact our support team.
    </p>`;

  const subject = `Order Confirmation — ${order.orderNumber}`;

  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.name} x${item.quantity} @ ${formatCurrency(item.unitPrice, order.currency)} = ${formatCurrency(item.lineTotal, order.currency)}`,
    )
    .join('\n');

  return {
    subject,
    html: renderEmailLayout({
      brand,
      previewText: `Your order ${order.orderNumber} has been placed.`,
      title: subject,
      bodyHtml,
    }),
    text: `Order Confirmation\n\nOrder: ${order.orderNumber}\nPlaced: ${placedDate}\n\n${itemsText}\n\nGrand Total: ${formatCurrency(order.grandTotal, order.currency)}`,
  };
}
