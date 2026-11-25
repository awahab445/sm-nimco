import { formatPrice } from '@/lib/currency';
import { formatPhone, type StoreFacts } from '@/lib/store-facts';

export const POLICY_PAGE_SLUGS = [
  'shipping-returns',
  'privacy-policy',
  'terms-conditions',
] as const;

export type PolicyPageSlug = (typeof POLICY_PAGE_SLUGS)[number];

export type PolicyPageContent = {
  title: string;
  slug: PolicyPageSlug;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentHtml: string;
  updatedAt?: string;
};

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function contactHtml(f: StoreFacts): string {
  const phone = formatPhone(f.phone);
  const email = f.email ? ` or email <a href="mailto:${esc(f.email)}">${esc(f.email)}</a>` : '';
  return `<h2>Contact us</h2><p>Call or WhatsApp <a href="https://wa.me/${f.phone}">${phone}</a>${email}. More ways to reach us are on our <a href="/contact">contact page</a>.</p>`;
}

function paymentHtml(f: StoreFacts): string {
  const list = f.paymentMethods.length ? esc(f.paymentMethods.join(', ')) : 'the options shown at checkout';
  return `<h2>Payment</h2><p>We accept ${list}. With Cash on Delivery you pay the rider in cash when your parcel arrives. The total you pay, including delivery, is shown before you confirm your order.</p>`;
}

/**
 * Fallback policy text, used until an admin publishes a CMS page with the same slug.
 * Built from live store facts so each store shows its own name, phone, payment methods and free-delivery threshold.
 */
export function buildPolicyPageDefault(slug: PolicyPageSlug, f: StoreFacts): PolicyPageContent {
  const name = esc(f.storeName);
  const freeDelivery = f.freeDeliveryThreshold
    ? ` Orders delivered within Karachi ship free when the order total is ${formatPrice(f.freeDeliveryThreshold)} or more.`
    : '';

  switch (slug) {
    case 'shipping-returns':
      return {
        slug,
        title: 'Shipping & Returns',
        excerpt: 'Delivery areas, times and charges, payment methods, and how returns (including change of mind) and refunds work.',
        metaTitle: 'Shipping & Returns',
        metaDescription: `Delivery across Pakistan, shipping charges, Cash on Delivery and the return and refund policy of ${f.storeName}.`,
        contentHtml: [
          '<h2>Delivery areas</h2>',
          `<p>${name} delivers to cities across Pakistan by courier.</p>`,
          '<h2>Delivery times</h2>',
          '<p>We process orders within 1–2 business days. After dispatch, delivery usually takes 3–7 business days depending on your city. You can follow your parcel on our <a href="/track-order">order tracking page</a>.</p>',
          '<h2>Delivery charges</h2>',
          `<p>Delivery charges depend on your city and the weight of your order, and are shown at checkout before you place your order. Applicable sales tax on delivery is included in the amount shown.${freeDelivery}</p>`,
          paymentHtml(f),
          '<h2>Returns and replacements</h2>',
          '<p>If your order arrives damaged, leaking, or is not the item you ordered, contact us within 7 days of delivery with your order number and photos of the item and packaging.</p>',
          '<p>Once we approve the return, we arrange pickup at no cost to you. We then send a replacement or give you a full refund, as you prefer.</p>',
          '<h2>Change of mind</h2>',
          '<p>Changed your mind? You can return an item within 7 days of delivery if it is unused, unopened and in its original packaging with the seal intact. Contact us with your order number to arrange the return. For change-of-mind returns, you pay the return delivery cost and the original delivery charge is not refunded. Once we receive and check the item, we refund the product price.</p>',
          '<h2>Refunds</h2>',
          '<p>Refunds are made within 7 working days after we receive the returned item, by bank transfer, JazzCash or Easypaisa. Orders paid online are refunded to the original payment method.</p>',
          contactHtml(f),
        ].join(''),
      };
    case 'privacy-policy':
      return {
        slug,
        title: 'Privacy Policy',
        excerpt: 'How we collect, use, and protect your personal information.',
        metaTitle: 'Privacy Policy',
        metaDescription: `How ${f.storeName} collects, uses and protects your personal information.`,
        contentHtml: [
          `<p>This policy explains how ${name} handles your personal information when you use this website.</p>`,
          '<h2>What we collect</h2>',
          '<p>Your name, phone number, email, and delivery address when you create an account, place an order, or contact us, plus your order history.</p>',
          '<h2>How we use it</h2>',
          '<p>To process and deliver your orders, contact you about your order (including by WhatsApp or SMS), provide customer support, and send offers if you subscribe to them.</p>',
          '<h2>Who we share it with</h2>',
          '<p>Only with the courier that delivers your order and with payment providers when you pay online. We do not sell your personal information.</p>',
          '<h2>Cookies and analytics</h2>',
          '<p>We use cookies to keep your cart and login working, and analytics and advertising tools (such as Google Analytics, Meta and TikTok) to understand how the site is used and to measure our ads.</p>',
          '<h2>Your choices</h2>',
          '<p>You can ask us to correct or delete your personal information, or unsubscribe from marketing messages at any time.</p>',
          contactHtml(f),
        ].join(''),
      };
    case 'terms-conditions':
      return {
        slug,
        title: 'Terms & Conditions',
        excerpt: 'Terms governing use of our website and purchases.',
        metaTitle: 'Terms & Conditions',
        metaDescription: `Terms of use, ordering, pricing and delivery rules for ${f.storeName}.`,
        contentHtml: [
          `<p>This website is operated by ${name}. By browsing or buying from it, you agree to these terms.</p>`,
          '<h2>Orders</h2>',
          '<p>You must give accurate contact and delivery details. An order is confirmed when we accept it; we may contact you to verify Cash on Delivery orders, and may cancel orders we cannot verify or deliver.</p>',
          '<h2>Prices</h2>',
          '<p>All prices are in Pakistani Rupees (PKR). Delivery charges are added at checkout. If a price is listed in error, we will contact you before dispatch to confirm or cancel the order.</p>',
          '<h2>Delivery, returns and payment</h2>',
          `<p>See our <a href="${policyPageHref('shipping-returns')}">Shipping &amp; Returns</a> page.</p>`,
          '<h2>Governing law</h2>',
          '<p>These terms are governed by the laws of Pakistan.</p>',
          contactHtml(f),
        ].join(''),
      };
  }
}

export function isPolicyPageSlug(slug: string): slug is PolicyPageSlug {
  return (POLICY_PAGE_SLUGS as readonly string[]).includes(slug);
}

export function policyPageHref(slug: PolicyPageSlug): string {
  return `/${slug}`;
}
