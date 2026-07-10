'use client';

import Script from 'next/script';
import type { Ga4PublicConfig } from '@/lib/analytics/types';

type Props = {
  config: Ga4PublicConfig;
};

/**
 * Loads GA4 after the page is idle so it does not compete with LCP/TBT.
 * Page views still fire via AnalyticsPageView once gtag is available.
 */
export function GoogleAnalyticsLoader({ config }: Props) {
  if (!config.isEnabled || !config.measurementId) {
    return null;
  }

  const gaId = config.measurementId;
  const debugMode = Boolean(config.debugMode);
  const anonymizeIp = Boolean(config.anonymizeIp);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}', {
  send_page_view: false${debugMode ? ',\n  debug_mode: true' : ''}${anonymizeIp ? ',\n  anonymize_ip: true' : ''}
});
`}
      </Script>
    </>
  );
}
