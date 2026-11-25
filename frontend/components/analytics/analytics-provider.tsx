'use client';

import { useEffect } from 'react';
import type { Ga4PublicConfig } from '@/lib/analytics/types';
import { setAnalyticsConfig } from '@/lib/analytics/gtag';
import { setMetaPixelConfig } from '@/lib/analytics/fbq';
import { setTikTokPixelConfig } from '@/lib/analytics/ttq';
import {
  ensureMetaFbcFromUrl,
  ensureTikTokClickIdFromUrl,
} from '@/lib/analytics/meta-capi-client';
import { GoogleAnalyticsLoader } from './google-analytics';
import { MetaPixel } from './meta-pixel';
import { TikTokPixel } from './tiktok-pixel';
import { MetaFbcCapture } from './meta-fbc-capture';
import { AnalyticsPageView } from './analytics-page-view';

type Props = {
  config: Ga4PublicConfig;
  children: React.ReactNode;
};

export function AnalyticsProvider({ config, children }: Props) {
  useEffect(() => {
    setAnalyticsConfig(config);
    setMetaPixelConfig(config);
    setTikTokPixelConfig(config);
    // Capture fbclid ASAP (does not wait for Pixel / Suspense searchParams).
    ensureMetaFbcFromUrl();
    ensureTikTokClickIdFromUrl();
  }, [config]);

  const gaActive = config.isEnabled && config.measurementId;
  const metaActive = config.metaPixelEnabled && config.metaPixelId;
  const tiktokActive = config.tiktokPixelEnabled && config.tiktokPixelId;
  const trackPageViews =
    Boolean(gaActive || metaActive || tiktokActive) && config.trackPageViews;

  return (
    <>
      {/* Always on: capture ad click IDs even before Pixel loads */}
      <MetaFbcCapture />
      {gaActive ? <GoogleAnalyticsLoader config={config} /> : null}
      {metaActive ? <MetaPixel pixelId={config.metaPixelId} /> : null}
      {tiktokActive ? <TikTokPixel pixelId={config.tiktokPixelId} /> : null}
      {trackPageViews ? <AnalyticsPageView /> : null}
      {children}
    </>
  );
}
