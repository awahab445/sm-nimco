import Link from 'next/link';

/** Hero banner — purple gradient plane matching index7.html. */
export function SmNimcoHero() {
  return (
    <section className="sm-nimco-on-purple bg-gradient-to-r from-[var(--brand-purple-dark,#1e1035)] via-[var(--brand-purple-deep,#2e1a47)] to-[var(--brand-purple-dark,#1e1035)] px-4 py-16 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between md:flex-row">
        <div className="space-y-6 text-center md:w-1/2 md:text-left">
          <span className="inline-block rounded-full border border-[var(--brand-gold-primary,#d4af37)]/40 bg-[var(--brand-gold-primary,#d4af37)]/20 px-3 py-1 text-xs font-bold uppercase text-[var(--brand-gold-primary,#d4af37)]">
            Premium Traditional Taste
          </span>
          <h1 className="font-heading text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Authentic Karachi Nimco, Sweets &amp; Fresh Bakery
          </h1>
          <p className="text-sm text-amber-100/90">
            Hygienically packed, crisp, and made with pure ingredients daily for your family tea
            time.
          </p>
          <div className="flex justify-center space-x-4 pt-2 md:justify-start">
            <Link
              href="/products"
              className="rounded-xl bg-[var(--brand-gold-primary,#d4af37)] px-6 py-3 font-bold text-[var(--brand-purple-dark,#1e1035)] shadow-lg transition-colors hover:bg-[var(--brand-gold-hover,#b89628)]"
            >
              Explore All Delights
            </Link>
            <Link
              href="/checkout"
              className="rounded-xl border border-[var(--brand-gold-primary,#d4af37)] px-6 py-3 font-semibold text-[var(--brand-gold-primary,#d4af37)] transition-colors hover:bg-white/5"
            >
              Quick Order
            </Link>
          </div>
        </div>

        <div className="mt-8 flex justify-center md:mt-0">
          <div className="sm-nimco-on-purple flex h-64 w-64 flex-col items-center justify-center rounded-3xl border-2 border-[var(--brand-gold-primary,#d4af37)]/30 bg-[var(--brand-purple-deep,#2e1a47)] p-4 text-center text-white">
            <svg
              className="mb-3 h-14 w-14 text-[var(--brand-gold-primary,#d4af37)]"
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
            <h3 className="font-heading text-xl font-bold text-white">Special Mix Nimco</h3>
            <p className="mt-1 text-xs text-[var(--brand-gold-primary,#d4af37)]">
              Flat 15% OFF On Family Combos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
