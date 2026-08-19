import Link from 'next/link';

/** Premium dark hero — slate tones with warm amber CTAs. */
export function SmNimcoHero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-gray-900 px-4 py-16 text-white sm:px-8 sm:py-20 md:py-24"
      aria-labelledby="home-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 12%, rgba(245,158,11,0.22) 0%, rgba(217,119,6,0.08) 42%, transparent 70%), radial-gradient(ellipse 45% 40% at 88% 78%, rgba(31,41,55,0.9) 0%, transparent 60%)',
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row md:gap-10">
        <div className="max-w-2xl space-y-6 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-white/5 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-amber-100/95 backdrop-blur-md sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
            SM NIMCO • Official Online Store
          </span>
          <h1
            id="home-hero-heading"
            className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Authentic &amp; Crispy{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Pakistani Nimco &amp; Sweets
            </span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
            Premium quality traditional snacks delivered fresh across Pakistan.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
            <Link
              href="/products"
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-gray-950 shadow-[0_10px_28px_-10px_rgba(245,158,11,0.65)] transition-colors hover:bg-amber-600"
            >
              Shop Now
            </Link>
            <Link
              href="#featured-categories"
              className="rounded-xl border border-amber-500/70 px-6 py-3 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/10"
            >
              Explore Categories
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 justify-center">
          <div className="flex h-64 w-64 flex-col items-center justify-center rounded-3xl border-2 border-amber-500/30 bg-gray-800 p-4 text-center shadow-[0_0_40px_-12px_rgba(245,158,11,0.35)]">
            <svg
              className="mb-3 h-14 w-14 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 10h16l-1.2 9.2a2 2 0 01-2 1.8H7.2a2 2 0 01-2-1.8L4 10z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 018 0v3" />
            </svg>
            <h3 className="font-heading text-xl font-bold text-white">Fresh Daily Batches</h3>
            <p className="mt-1 text-xs text-amber-400">Crispy nimco, mithai &amp; festive packs</p>
          </div>
        </div>
      </div>
    </section>
  );
}
