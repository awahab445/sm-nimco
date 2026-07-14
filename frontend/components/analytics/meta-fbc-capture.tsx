'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const FBC_COOKIE = '_fbc';
/** 90 days — Meta's recommended retention for click IDs. */
const FBC_MAX_AGE_SECONDS = 7_776_000;

/**
 * Captures `fbclid` from the landing URL and stores `_fbc` for Meta Pixel / CAPI.
 * Renders nothing; runs only in the browser after hydration.
 */
function MetaFbcCaptureInner() {
  const searchParams = useSearchParams();
  const fbclid = searchParams.get('fbclid');

  useEffect(() => {
    if (!fbclid?.trim()) return;
    if (typeof document === 'undefined') return;

    const value = `fb.1.${Date.now()}.${fbclid.trim()}`;
    document.cookie = `${FBC_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${FBC_MAX_AGE_SECONDS}; SameSite=Lax`;
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
