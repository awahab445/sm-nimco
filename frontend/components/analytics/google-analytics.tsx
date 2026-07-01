'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
import type { Ga4PublicConfig } from '@/lib/analytics/types';

type Props = {
  config: Ga4PublicConfig;
};

export function GoogleAnalyticsLoader({ config }: Props) {
  if (!config.isEnabled || !config.measurementId) {
    return null;
  }

  const gaId = config.measurementId;

  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      {config.debugMode ? (
        <Script id="ga4-debug-mode" strategy="afterInteractive">
          {`window.gtag?.('config', '${gaId}', { debug_mode: true });`}
        </Script>
      ) : null}
      {config.anonymizeIp ? (
        <Script id="ga4-anonymize-ip" strategy="afterInteractive">
          {`window.gtag?.('config', '${gaId}', { anonymize_ip: true });`}
        </Script>
      ) : null}
    </>
  );
}
