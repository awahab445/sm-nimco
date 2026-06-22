'use client';

import { useEffect, useState } from 'react';
import { subscribeStorefrontToast } from '@/lib/storefront-toast';

type ToastState = {
  message: string;
  type: 'error' | 'success';
} | null;

const AUTO_DISMISS_MS = 5000;

export function StorefrontToast() {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    return subscribeStorefrontToast((message, type) => {
      setToast({ message, type });
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[300] flex justify-center px-4"
      role={isError ? 'alert' : 'status'}
      aria-live="assertive"
    >
      <div
        className={`pointer-events-auto max-w-md rounded-lg border px-4 py-3 text-sm shadow-lg ${
          isError
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-success/30 bg-success/10 text-success'
        }`}
      >
        <div className="flex items-start gap-3">
          <p className="flex-1 font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 rounded p-1 text-current/80 transition hover:bg-black/5"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
