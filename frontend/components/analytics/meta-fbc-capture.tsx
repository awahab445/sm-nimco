'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ensureMetaFbcFromUrl } from '@/lib/analytics/meta-capi-client';

/**
 * Captures `fbclid` from the landing URL and stores `_fbc` for Meta Pixel / CAPI.
 * Renders nothing; runs only in the browser after hydration.
 */
function MetaFbcCaptureInner() {
  const searchParams = useSearchParams();
  const fbclid = searchParams.get('fbclid');

  useEffect(() => {
    ensureMetaFbcFromUrl(fbclid);
  }, [fbclid]);

  return null;
}

export function MetaFbcCapture() {
  return (
    <Suspense fallback={null}>
      <MetaFbcCaptureInner />
    </Suspense>
  );
}
