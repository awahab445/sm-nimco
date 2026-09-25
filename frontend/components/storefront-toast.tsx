'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { subscribeStorefrontToast } from '@/lib/storefront-toast';

type ToastPayload = {
  message: string;
  type: 'error' | 'success';
};

const AUTO_DISMISS_MS = 3500;
const EXIT_MS = 220;

export function StorefrontToast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const enterFrameRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (dismissTimerRef.current != null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (exitTimerRef.current != null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (enterFrameRef.current != null) {
      window.cancelAnimationFrame(enterFrameRef.current);
      enterFrameRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    if (dismissTimerRef.current != null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setVisible(false);
    exitTimerRef.current = window.setTimeout(() => {
      setToast(null);
      exitTimerRef.current = null;
    }, EXIT_MS);
  }, []);

  useEffect(() => {
    return subscribeStorefrontToast((message, type) => {
      clearTimers();
      setToast({ message, type });
      setVisible(false);
      enterFrameRef.current = window.requestAnimationFrame(() => {
        enterFrameRef.current = window.requestAnimationFrame(() => {
          setVisible(true);
          enterFrameRef.current = null;
        });
      });
    });
  }, [clearTimers]);

  useEffect(() => {
    if (!toast || !visible) return;
    dismissTimerRef.current = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => {
      if (dismissTimerRef.current != null) {
        window.clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [toast, visible, dismiss]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const Icon = isError ? CircleAlert : CheckCircle2;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[300] flex justify-end p-3 sm:inset-x-auto sm:right-4 sm:left-auto sm:p-0"
      style={{
        top: 'calc(var(--site-header-height, 4.5rem) + 0.5rem)',
      }}
      role={isError ? 'alert' : 'status'}
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className={`pointer-events-auto w-full max-w-[min(100%,22rem)] origin-top-right rounded-xl border px-4 py-3 shadow-lg transition-[opacity,transform] duration-200 ease-out sm:w-[22rem] ${
          visible
            ? 'translate-y-0 opacity-100 sm:translate-x-0'
            : '-translate-y-2 opacity-0 sm:translate-x-3 sm:translate-y-0'
        } ${
          isError
            ? 'border-red-200 bg-red-50 text-red-950'
            : 'border-emerald-200 bg-emerald-50 text-emerald-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon
            className={`mt-0.5 size-5 shrink-0 ${
              isError ? 'text-red-600' : 'text-emerald-600'
            }`}
            aria-hidden
          />
          <p className="min-w-0 flex-1 text-sm font-semibold leading-snug break-words">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={dismiss}
            className={`-mr-1 -mt-1 shrink-0 rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 ${
              isError
                ? 'text-red-700 hover:bg-red-100 focus-visible:ring-red-300'
                : 'text-emerald-800 hover:bg-emerald-100 focus-visible:ring-emerald-300'
            }`}
            aria-label="Dismiss notification"
          >
            <X className="size-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
