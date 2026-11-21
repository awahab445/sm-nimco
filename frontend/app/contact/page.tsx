import type { Metadata } from 'next';
import Link from 'next/link';
import { CmsHtmlContent } from '@/components/cms/cms-html-content';
import { JsonLd } from '@/components/seo/json-ld';
import { getCmsPageBySlug } from '@/lib/cms/cms-page.service';
import { policyPageHref } from '@/lib/cms/policy-pages';
import { STORE_NAME } from '@/lib/config';
import { absoluteUrl, buildPageMetadata } from '@/lib/seo';
import { organizationId } from '@/lib/seo/schemas';
import { formatPhone, getStoreFacts } from '@/lib/store-facts';
import { storefrontUi } from '@/lib/storefront-ui';

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: `Contact ${STORE_NAME}`,
  description: `Call or WhatsApp ${STORE_NAME} for orders, delivery and returns.`,
  path: '/contact',
});

/** Fixed contact facts first; an admin CMS page with slug `contact` (address, hours, map) renders below. */
export default async function ContactPage() {
  const [facts, cms] = await Promise.all([getStoreFacts(), getCmsPageBySlug('contact')]);
  const phone = formatPhone(facts.phone);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          url: absoluteUrl('/contact'),
          name: `Contact ${facts.storeName}`,
          mainEntity: { '@id': organizationId() },
        }}
      />
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-text">Contact us</h1>
        <p className="mt-4 leading-relaxed text-brand-text/80">
          Questions about a product, your order, delivery or a return? Reach {facts.storeName} here.
        </p>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-brand-text">Phone</dt>
            <dd className="mt-1">
              <a href={`tel:+${facts.phone}`} className={storefrontUi.link}>
                {phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-brand-text">WhatsApp</dt>
            <dd className="mt-1">
              <a href={`https://wa.me/${facts.phone}`} target="_blank" rel="noopener noreferrer" className={storefrontUi.link}>
                Chat on WhatsApp ({phone})
              </a>
            </dd>
          </div>
          {facts.email ? (
            <div>
              <dt className="text-sm font-semibold text-brand-text">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${facts.email}`} className={storefrontUi.link}>
                  {facts.email}
                </a>
              </dd>
            </div>
          ) : null}
          {facts.paymentMethods.length ? (
            <div>
              <dt className="text-sm font-semibold text-brand-text">Payment</dt>
              <dd className="mt-1 text-brand-text/80">{facts.paymentMethods.join(', ')}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-8 text-sm text-brand-text/75">
          Delivery, returns and refunds are explained on our{' '}
          <Link href={policyPageHref('shipping-returns')} className={storefrontUi.link}>
            Shipping &amp; Returns
          </Link>{' '}
          page. To follow a parcel, use{' '}
          <Link href="/track-order" className={storefrontUi.link}>
            Track order
          </Link>
          .
        </p>

        {cms?.contentHtml ? <CmsHtmlContent html={cms.contentHtml} /> : null}
      </div>
    </>
  );
}
