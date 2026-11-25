'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/events';
import {
  metaMatchUserToPixelData,
  resolveMetaMatchUser,
} from '@/lib/analytics/meta-capi-client';
import { setMetaAdvancedMatching } from '@/lib/analytics/fbq';
import { setTikTokIdentify } from '@/lib/analytics/ttq';
import { stripPiiFromBrowserUrl } from '@/lib/analytics/sanitize-meta-url';
import { useAuthStore } from '@/lib/auth.store';

function AnalyticsPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const matchData = metaMatchUserToPixelData(resolveMetaMatchUser(user));
    setMetaAdvancedMatching(matchData);
    setTikTokIdentify(matchData);
  }, [user]);

  useEffect(() => {
    // Meta PageView reads document.location — strip unhashed PII from the URL first.
    stripPiiFromBrowserUrl();
    const cleaned =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : search
          ? `${pathname}?${search}`
          : pathname;
    trackPageView(
      cleaned || pathname,
      resolveMetaMatchUser(useAuthStore.getState().user),
    );
  }, [pathname, search]);

  return null;
}

export function AnalyticsPageView() {
  return (
    <Suspense fallback={null}>
      <AnalyticsPageViewInner />
    </Suspense>
  );
}
