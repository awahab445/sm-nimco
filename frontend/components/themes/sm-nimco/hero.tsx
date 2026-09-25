import Link from 'next/link';

/** Premium dark hero — purple surfaces with gold CTAs (SM Nimco brand). */
export function SmNimcoHero() {
  return (
    <section
      className="relative isolate overflow-hidden px-4 py-16 text-white sm:px-8 sm:py-20 md:py-24"
      style={{ backgroundColor: 'var(--brand-purple-dark, #1e1035)' }}
      aria-labelledby="home-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 12%, color-mix(in srgb, var(--brand-gold-primary, #d4af37) 28%, transparent) 0%, color-mix(in srgb, var(--brand-gold-hover, #b89628) 10%, transparent) 42%, transparent 70%), radial-gradient(ellipse 45% 40% at 88% 78%, color-mix(in srgb, var(--brand-purple-deep, #2e1a47) 95%, transparent) 0%, transparent 60%)',
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--brand-gold-primary, #d4af37) 22%, transparent)',
        }}
        aria-hidden
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row md:gap-10">
        <div className="max-w-2xl space-y-6 text-center md:text-left">
          <span
            className="inline-flex items-center gap-2 rounded-full border bg-white/5 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] backdrop-blur-md sm:text-xs"
            style={{
              borderColor:
                'color-mix(in srgb, var(--brand-gold-primary, #d4af37) 45%, transparent)',
              color: 'var(--brand-gold-primary, #d4af37)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_90%,transparent)]"
              style={{ backgroundColor: 'var(--brand-gold-primary, #d4af37)' }}
            />
            SM NIMCO • Official Online Store
          </span>
          <h1
            id="home-hero-heading"
            className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Authentic &amp; Crispy{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, var(--brand-gold-primary, #d4af37), color-mix(in srgb, var(--brand-gold-primary, #d4af37) 75%, white), var(--brand-gold-hover, #b89628))',
              }}
            >
              Pakistani Nimco &amp; Sweets
            </span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Premium quality traditional snacks delivered fresh across Pakistan.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
            <Link
              href="/products"
              className="rounded-xl bg-[var(--brand-gold-primary,#d4af37)] px-6 py-3 text-sm font-bold text-[var(--brand-purple-dark,#1e1035)] shadow-[0_10px_28px_-10px_color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_65%,transparent)] transition-colors hover:bg-[var(--brand-gold-hover,#b89628)]"
            >
              Shop Now
            </Link>
            <Link
              href="#featured-categories"
              className="rounded-xl border border-[color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_70%,transparent)] px-6 py-3 text-sm font-semibold text-[var(--brand-gold-primary,#d4af37)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_12%,transparent)]"
            >
              Explore Categories
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 justify-center">
          <div
            className="flex h-64 w-64 flex-col items-center justify-center rounded-3xl border-2 p-4 text-center shadow-[0_0_40px_-12px_color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_40%,transparent)]"
            style={{
              borderColor:
                'color-mix(in srgb, var(--brand-gold-primary, #d4af37) 35%, transparent)',
              backgroundColor: 'var(--brand-purple-deep, #2e1a47)',
            }}
          >
            <svg
              className="mb-3 h-14 w-14"
              style={{ color: 'var(--brand-gold-primary, #d4af37)' }}
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
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--brand-gold-primary, #d4af37)' }}
            >
              Crispy nimco, mithai &amp; festive packs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
