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
  if (brand.social.facebook)
    links.push({ label: 'Facebook', url: brand.social.facebook });
  if (brand.social.instagram)
    links.push({ label: 'Instagram', url: brand.social.instagram });
  if (brand.social.twitter)
    links.push({ label: 'X', url: brand.social.twitter });
  if (brand.social.linkedin)
    links.push({ label: 'LinkedIn', url: brand.social.linkedin });

  if (links.length === 0) {
    return '';
  }

  return `
    <div style="margin:16px 0 0;">
      ${links
        .map(
          (link) => `
      <a href="${escapeHtml(link.url)}" style="color:${brand.ctaColor};text-decoration:none;font-size:12px;font-weight:600;margin:0 8px;">
        ${escapeHtml(link.label)}
      </a>`,
        )
        .join('')}
    </div>`;
}

function footerNavHtml(brand: BrandConfig): string {
  const items: Array<{ label: string; url: string }> = [
    { label: 'Shop', url: brand.links.shop },
    { label: 'Track order', url: brand.links.trackOrder },
  ];
  if (brand.links.support) {
    items.push({ label: 'Support', url: brand.links.support });
  }
  if (brand.links.privacy) {
    items.push({ label: 'Privacy', url: brand.links.privacy });
  }
  if (brand.links.terms) {
    items.push({ label: 'Terms', url: brand.links.terms });
  }

  return items
    .map(
      (item, index) => `
      <a href="${escapeHtml(item.url)}" style="color:${brand.footerTextColor};text-decoration:none;font-size:12px;font-weight:500;">
        ${escapeHtml(item.label)}
      </a>${index < items.length - 1 ? `<span style="color:${brand.borderColor};margin:0 8px;">·</span>` : ''}`,
    )
    .join('');
}

/**
 * Shared customer-facing email chrome: logo header + standard footer.
 * All transactional templates should render body content through this layout.
 */
export function renderEmailLayout(options: {
  brand: BrandConfig;
  previewText: string;
  title: string;
  bodyHtml: string;
}): string {
  const { brand, previewText, title, bodyHtml } = options;
  const year = new Date().getFullYear();
  const logoBlock = brand.logoUrl
    ? `<img src="${escapeHtml(brand.logoUrl)}" alt="${escapeHtml(brand.storeName)}" width="180" style="display:block;max-width:180px;height:auto;border:0;margin:0 auto;" />`
    : `<div style="font-size:20px;font-weight:700;color:${brand.textColor};letter-spacing:0.4px;text-align:center;">${escapeHtml(brand.storeName)}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-padding { padding: 24px 20px !important; }
      .email-header { padding: 20px 16px !important; }
      .email-footer { padding: 24px 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${brand.backgroundColor};font-family:Arial,Helvetica,sans-serif;color:${brand.textColor};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(previewText)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${brand.backgroundColor};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid ${brand.borderColor};border-radius:4px;overflow:hidden;">
          <tr>
            <td class="email-header" align="center" style="background-color:#ffffff;padding:28px 32px 20px;border-bottom:1px solid ${brand.borderColor};">
              ${logoBlock}
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding:32px;background-color:#ffffff;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td class="email-footer" style="background-color:#fafafa;border-top:1px solid ${brand.borderColor};padding:28px 32px;text-align:center;">
              <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:${brand.footerTextColor};letter-spacing:0.3px;">
                ${escapeHtml(brand.storeName)}
              </p>
              <div style="margin:0 0 16px;line-height:1.8;">
                ${footerNavHtml(brand)}
              </div>
              ${socialLinksHtml(brand)}
              <p style="margin:16px 0 0;font-size:11px;color:${brand.mutedTextColor};line-height:1.6;">
                © ${year} ${escapeHtml(brand.storeName)}. All rights reserved.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:${brand.mutedTextColor};line-height:1.5;">
                You received this email because you have an account or placed an order with us.
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

export function renderPrimaryButton(
  href: string,
  label: string,
  brand: BrandConfig,
): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="border-radius:999px;background-color:${brand.ctaColor};">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;font-family:Arial,Helvetica,sans-serif;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export { escapeHtml };
