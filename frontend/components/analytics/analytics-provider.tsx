'use client';

import { useEffect } from 'react';
import type { Ga4PublicConfig } from '@/lib/analytics/types';
import { setAnalyticsConfig } from '@/lib/analytics/gtag';
import { setMetaPixelConfig } from '@/lib/analytics/fbq';
import { GoogleAnalyticsLoader } from './google-analytics';
import { MetaPixel } from './meta-pixel';
import { AnalyticsPageView } from './analytics-page-view';

type Props = {
  config: Ga4PublicConfig;
  children: React.ReactNode;
};

export function AnalyticsProvider({ config, children }: Props) {
  useEffect(() => {
    setAnalyticsConfig(config);
    setMetaPixelConfig(config);
  }, [config]);

  const gaActive = config.isEnabled && config.measurementId;
  const metaActive = config.metaPixelEnabled && config.metaPixelId;
  const trackPageViews =
    (gaActive && config.trackPageViews) ||
    (metaActive && config.trackPageViews);

  return (
    <>
      {gaActive ? <GoogleAnalyticsLoader config={config} /> : null}
      {metaActive ? <MetaPixel pixelId={config.metaPixelId} /> : null}
      {trackPageViews ? <AnalyticsPageView /> : null}
      {children}
    </>
  );
}
