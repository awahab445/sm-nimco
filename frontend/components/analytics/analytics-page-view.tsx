'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/events';
import { stripPiiFromBrowserUrl } from '@/lib/analytics/sanitize-meta-url';

function AnalyticsPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    // Meta PageView reads document.location — strip unhashed PII from the URL first.
    stripPiiFromBrowserUrl();
    const cleaned =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : search
          ? `${pathname}?${search}`
          : pathname;
    trackPageView(cleaned || pathname);
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
