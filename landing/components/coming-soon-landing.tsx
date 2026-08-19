'use client';

import {
  useCallback,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react';

const COUNTDOWN_STORAGE_KEY = 'sm-nimco-coming-soon-target-ms';
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

/** Optional: set at build time, e.g. NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/92XXXXXXXXXX */
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() || '';
const WHATSAPP_MESSAGE =
  'Hi SM NIMCO! I would like to inquire / place an order. Looking forward to your launch!';

/**
 * SheetDB / Google Apps Script webhook URL.
 * Sheet columns expected: Email | SubmittedAt
 */
const SHEET_API_URL =
  process.env.NEXT_PUBLIC_SHEET_API_URL?.trim() ||
  'https://sheetdb.io/api/v1/YOUR_SHEET_API_ID';

const SUCCESS_MESSAGE =
  "Thank you! You've been added to our notification list.";
const ERROR_MESSAGE = 'Something went wrong. Please try again in a moment.';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_RE = /^[\d\s+()-]{7,20}$/;

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const ZERO_TIME: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
const emptySubscribe = () => () => undefined;

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

function calcTimeLeft(targetMs: number, nowMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - nowMs);
  return {
    days: Math.floor(diff / (24 * 60 * 60 * 1000)),
    hours: Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
    minutes: Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000)),
    seconds: Math.floor((diff % (60 * 1000)) / 1000),
  };
}

function readOrCreateTargetMs(): number {
  try {
    const raw = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    const target = Date.now() + TEN_DAYS_MS;
    localStorage.setItem(COUNTDOWN_STORAGE_KEY, String(target));
    return target;
  } catch {
    return Date.now() + TEN_DAYS_MS;
  }
}

let cachedTargetMs: number | null = null;
function getClientTargetMs(): number {
  if (cachedTargetMs == null) cachedTargetMs = readOrCreateTargetMs();
  return cachedTargetMs;
}

let cachedNowMs = 0;
function subscribeToClock(onStoreChange: () => void): () => void {
  cachedNowMs = Date.now();
  const id = window.setInterval(() => {
    cachedNowMs = Date.now();
    onStoreChange();
  }, 1000);
  return () => window.clearInterval(id);
}
function getNowSnapshot(): number {
  return cachedNowMs;
}

function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function resolveWhatsAppHref(): string | null {
  const raw = WHATSAPP_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://wa.me/${raw.replace(/\D/g, '')}`);
    if (!url.searchParams.has('text')) {
      url.searchParams.set('text', WHATSAPP_MESSAGE);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TimerUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-full min-w-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 px-2 py-4 shadow-[0_0_40px_-12px_rgba(245,158,11,0.35)] backdrop-blur-md sm:px-3 sm:py-5">
        <span className="font-heading text-3xl font-bold tabular-nums tracking-tight text-amber-400 sm:text-4xl md:text-5xl">
          {value}
        </span>
      </div>
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function ComingSoonLanding() {
  const hydrated = useHydrated();
  const whatsappUrl = resolveWhatsAppHref();
  const targetMs = useSyncExternalStore(emptySubscribe, getClientTargetMs, () => 0);
  const nowMs = useSyncExternalStore(subscribeToClock, getNowSnapshot, () => 0);

  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [notifyMessage, setNotifyMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setNotifyMessage(null);
      setNotifyStatus('idle');

      const value = contact.trim();
      if (!value) {
        setNotifyStatus('error');
        setNotifyMessage('Please enter your phone number or email.');
        return;
      }

      const isEmail = value.includes('@');
      if (isEmail && !EMAIL_RE.test(value)) {
        setNotifyStatus('error');
        setNotifyMessage('Please enter a valid email address.');
        return;
      }
      if (!isEmail && !PHONE_RE.test(value)) {
        setNotifyStatus('error');
        setNotifyMessage('Please enter a valid phone number or email.');
        return;
      }

      if (
        !SHEET_API_URL ||
        SHEET_API_URL.includes('YOUR_SHEET_API_ID')
      ) {
        setNotifyStatus('error');
        setNotifyMessage(
          'Subscriptions are not configured yet. Please set NEXT_PUBLIC_SHEET_API_URL.',
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(SHEET_API_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: value,
            SubmittedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Sheet webhook failed with status ${response.status}`);
        }

        setNotifyStatus('success');
        setNotifyMessage(SUCCESS_MESSAGE);
        setContact('');
      } catch {
        setNotifyStatus('error');
        setNotifyMessage(ERROR_MESSAGE);
      } finally {
        setIsSubmitting(false);
      }
    },
    [contact],
  );

  const display = hydrated && targetMs > 0 ? calcTimeLeft(targetMs, nowMs) : ZERO_TIME;

  return (
    <section
      className="relative isolate min-h-dvh overflow-hidden bg-[#0b0f17] text-white"
      aria-labelledby="coming-soon-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 18%, rgba(245,158,11,0.22) 0%, rgba(234,88,12,0.08) 42%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(217,119,6,0.12) 0%, transparent 55%)',
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl motion-safe:animate-pulse"
        aria-hidden
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-20 md:py-24">
        <div
          className={`flex w-full flex-col items-center transition-all duration-700 ease-out ${
            hydrated ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-white/5 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-amber-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
            SM NIMCO • Official Online Store
          </span>

          <h1
            id="coming-soon-heading"
            className="font-heading max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Something Crispy &amp; Delicious is{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Coming Soon
            </span>
            !
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Premium quality Nimco, traditional snacks, and doorstep delivery across Pakistan.
            We&apos;re putting the finishing touches on smnimco.com — get ready for authentic taste
            at your doorstep.
          </p>
        </div>

        <div
          className={`mt-10 w-full max-w-xl transition-all delay-150 duration-700 ease-out sm:mt-12 ${
            hydrated ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Launch countdown"
        >
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <TimerUnit value={pad2(display.days)} label="Days" />
            <TimerUnit value={pad2(display.hours)} label="Hours" />
            <TimerUnit value={pad2(display.minutes)} label="Minutes" />
            <TimerUnit value={pad2(display.seconds)} label="Seconds" />
          </div>
          <p className="mt-4 text-xs text-slate-500 sm:text-sm">
            Launch countdown — we go live in just a few days.
          </p>
        </div>

        <div
          className={`mt-10 flex w-full max-w-md flex-col items-stretch gap-6 transition-all delay-300 duration-700 ease-out sm:mt-12 ${
            hydrated ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_32px_-8px_rgba(16,185,129,0.55)] transition-transform duration-200 hover:scale-[1.02] hover:bg-emerald-400 active:scale-[0.98]"
            >
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              Inquire / Order on WhatsApp
            </a>
          ) : null}

          {hydrated ? (
            <form onSubmit={(e) => void handleSubmit(e)} className="w-full space-y-3 text-left" noValidate>
              <label htmlFor="coming-soon-notify" className="sr-only">
                Phone or email for launch notification
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  id="coming-soon-notify"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Phone or email"
                  value={contact}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (notifyStatus !== 'idle') {
                      setNotifyStatus('idle');
                      setNotifyMessage(null);
                    }
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_10px_28px_-10px_rgba(245,158,11,0.65)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950"
                        aria-hidden
                      />
                      Submitting…
                    </>
                  ) : (
                    'Notify Me at Launch'
                  )}
                </button>
              </div>
              {notifyMessage ? (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    notifyStatus === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-orange-500/10 text-orange-300'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {notifyMessage}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Optional — leave your contact and we&apos;ll ping you when we open.
                </p>
              )}
            </form>
          ) : (
            <div className="w-full space-y-3 text-left" aria-hidden>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="min-h-[2.75rem] min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/70" />
                <div className="min-h-[2.75rem] shrink-0 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 sm:w-44" />
              </div>
              <p className="text-xs text-slate-500">
                Optional — leave your contact and we&apos;ll ping you when we open.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
