import type { BrandConfig } from '../types/email.types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function socialLinksHtml(brand: BrandConfig): string {
  const links: Array<{ label: string; url: string }> = [];
  if (brand.social.facebook) links.push({ label: 'Facebook', url: brand.social.facebook });
  if (brand.social.instagram) links.push({ label: 'Instagram', url: brand.social.instagram });
  if (brand.social.twitter) links.push({ label: 'Twitter', url: brand.social.twitter });
  if (brand.social.linkedin) links.push({ label: 'LinkedIn', url: brand.social.linkedin });

  if (links.length === 0) {
    return `
      <p style="margin:0;font-size:12px;color:#6b7280;">
        Connect with us on social media (links coming soon).
      </p>`;
  }

  return links
    .map(
      (link) => `
      <a href="${escapeHtml(link.url)}" style="color:${brand.primaryColor};text-decoration:none;font-size:13px;font-weight:600;margin:0 10px;">
        ${escapeHtml(link.label)}
      </a>`,
    )
    .join('');
}

export function renderEmailLayout(options: {
  brand: BrandConfig;
  previewText: string;
  title: string;
  bodyHtml: string;
}): string {
  const { brand, previewText, title, bodyHtml } = options;
  const logoBlock = brand.logoUrl
    ? `<img src="${escapeHtml(brand.logoUrl)}" alt="${escapeHtml(brand.storeName)}" width="160" style="display:block;max-width:160px;height:auto;border:0;" />`
    : `<div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">${escapeHtml(brand.storeName)}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-padding { padding: 20px !important; }
      .stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${brand.backgroundColor};font-family:Arial,Helvetica,sans-serif;color:${brand.textColor};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${brand.backgroundColor};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 18px rgba(26,46,64,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.accentColor} 100%);padding:28px 32px;">
              ${logoBlock}
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e5e7eb;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 12px;font-size:13px;color:${brand.textColor};font-weight:600;">${escapeHtml(brand.storeName)}</p>
              <div style="margin-bottom:14px;">${socialLinksHtml(brand)}</div>
              <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.5;">
                You received this email because you have an account or placed an order with ${escapeHtml(brand.storeName)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderPrimaryButton(href: string, label: string, brand: BrandConfig): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:${brand.primaryColor};">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export { escapeHtml };
