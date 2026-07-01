'use client';

import { useEffect } from 'react';
import type { Ga4PublicConfig } from '@/lib/analytics/types';
import { setAnalyticsConfig } from '@/lib/analytics/gtag';
import { GoogleAnalyticsLoader } from './google-analytics';
import { AnalyticsPageView } from './analytics-page-view';

type Props = {
  config: Ga4PublicConfig;
  children: React.ReactNode;
};

export function AnalyticsProvider({ config, children }: Props) {
  useEffect(() => {
    setAnalyticsConfig(config);
  }, [config]);

  const active = config.isEnabled && config.measurementId;

  return (
    <>
      {active ? <GoogleAnalyticsLoader config={config} /> : null}
      {active && config.trackPageViews ? <AnalyticsPageView /> : null}
      {children}
    </>
  );
}
