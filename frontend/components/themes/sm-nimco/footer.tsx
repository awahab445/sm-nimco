'use client';

import Link from 'next/link';
import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { STORE_NAME } from '@/lib/config';
import {
  categoryApi,
  siteConfigApi,
  subscriptionApi,
  type CategoryTreeItem,
  type StorefrontSocialLink,
  type StorefrontSocialPlatform,
} from '@/lib/api-client';
import { policyPageHref } from '@/lib/cms/policy-pages';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

type FooterLink = { href: string; label: string };

const SOCIAL_LABELS: Record<StorefrontSocialPlatform, string> = {
  facebook: 'Facebook',
  x: 'X',
  instagram: 'Instagram',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
};

function sortByPosition<T extends { position?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function envSocialFallback(): StorefrontSocialLink[] {
  const entries: Array<[StorefrontSocialPlatform, string | undefined]> = [
    ['facebook', process.env.NEXT_PUBLIC_STORE_SOCIAL_FACEBOOK],
    ['x', process.env.NEXT_PUBLIC_STORE_SOCIAL_TWITTER],
    ['instagram', process.env.NEXT_PUBLIC_STORE_SOCIAL_INSTAGRAM],
    ['youtube', process.env.NEXT_PUBLIC_STORE_SOCIAL_YOUTUBE],
    ['pinterest', process.env.NEXT_PUBLIC_STORE_SOCIAL_PINTEREST],
    ['tiktok', process.env.NEXT_PUBLIC_STORE_SOCIAL_TIKTOK],
    ['whatsapp', process.env.NEXT_PUBLIC_STORE_SOCIAL_WHATSAPP],
    ['linkedin', process.env.NEXT_PUBLIC_STORE_SOCIAL_LINKEDIN],
  ];
  return entries
    .map(([platform, url], index) => {
      const trimmed = url?.trim();
      if (!trimmed) return null;
      return {
        id: `env-${platform}`,
        platform,
        url: trimmed,
        sortOrder: index,
      } satisfies StorefrontSocialLink;
    })
    .filter((link): link is StorefrontSocialLink => Boolean(link));
}

function useFooterSocialLinks() {
  const [links, setLinks] = useState<StorefrontSocialLink[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await siteConfigApi.getSocialLinks();
        const data = (res.data ?? []).filter((link) => link.url?.trim());
        if (!cancelled) {
          setLinks(data.length > 0 ? data : envSocialFallback());
        }
      } catch {
        if (!cancelled) setLinks(envSocialFallback());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return links;
}

function useCategoryLinks() {
  const [categoryLinks, setCategoryLinks] = useState<CategoryTreeItem[]>([]);

  useEffect(() => {
    categoryApi
      .getCategories({ tree: true })
      .then((res) => {
        const tree = Array.isArray(res) ? res : [];
        setCategoryLinks(sortByPosition(tree as CategoryTreeItem[]).slice(0, 6));
      })
      .catch(() => setCategoryLinks([]));
  }, []);

  return categoryLinks;
}

function SocialGlyph({ platform }: { platform: StorefrontSocialPlatform }) {
  switch (platform) {
    case 'facebook':
      return (
        <svg viewBox="0 0 320 512" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.59l-5.16-6.74L5.2 22H1.94l8.03-9.17L1.5 2h6.75l4.66 6.18L18.244 2zm-1.16 18h1.83L7.02 3.94H5.06L17.084 20z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A4.5 4.5 0 1112 16a4.5 4.5 0 010-9zm0 2A2.5 2.5 0 1014.5 12 2.5 2.5 0 0012 7.5zM17.5 6.75a1 1 0 11-1 1 1 1 0 011-1z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.2-.1-.8-.2-2 0-2.9.2-.8 1.3-5.4 1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.9 0-2.6-1.8-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.7 0 .9.4 1.9.8 2.4.1.1.1.2.1.3l-.3 1.2c0 .2-.1.2-.3.1-1.2-.5-1.9-2.2-1.9-3.5 0-2.9 2.1-5.5 6.1-5.5 3.2 0 5.7 2.3 5.7 5.4 0 3.2-2 5.8-4.8 5.8-.9 0-1.8-.5-2.1-1l-.6 2.2c-.2.8-.8 1.8-1.2 2.4.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
        </svg>
      );
    default:
      return <span className="text-[10px] font-bold">{platform.slice(0, 1).toUpperCase()}</span>;
  }
}

function NewsletterForm() {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await subscriptionApi.subscribe({ email: trimmed, source: 'footer' });
      setSuccess(res.message || 'Thank you for subscribing!');
      setEmail('');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-sm space-y-4" noValidate>
      <label htmlFor={inputId} className="sr-only">
        Email for newsletter
      </label>
      <input
        id={inputId}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your Email"
        required
        disabled={loading}
        suppressHydrationWarning
        className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={loading}
        suppressHydrationWarning
        className="flex items-center justify-center space-x-2 rounded-full bg-[var(--brand-burgundy,#9b1d48)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[var(--footer-newsletter-btn-hover,#83163b)] disabled:opacity-60"
      >
        <span className="text-white">{loading ? 'Subscribing…' : 'Subscribe'}</span>
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-300" role="status">
          {success}
        </p>
      ) : null}
    </form>
  );
}

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="space-y-4">
      <h4 className="font-heading text-xl font-bold text-white">{title}</h4>
      <ul className="space-y-2.5 text-sm text-gray-300">
        {links.map((link) => {
          const external =
            link.href.startsWith('mailto:') ||
            link.href.startsWith('http://') ||
            link.href.startsWith('https://');
          return (
            <li key={`${link.href}-${link.label}`}>
              {external ? (
                <a
                  href={link.href}
                  className="text-gray-300 transition hover:text-[var(--brand-gold-primary,#d4af37)]"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="text-gray-300 transition hover:text-[var(--brand-gold-primary,#d4af37)]"
                >
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContactRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start space-x-3 text-gray-300">
      <span className="mt-0.5 text-[var(--brand-gold-primary,#d4af37)]">{icon}</span>
      <span className="text-gray-300">{children}</span>
    </li>
  );
}

/** Footer layout matching index7.html SM NIMCO reference. */
export function SmNimcoFooter() {
  const socialLinks = useFooterSocialLinks();
  const categoryLinks = useCategoryLinks();
  const phone = process.env.NEXT_PUBLIC_STORE_PHONE?.trim() || '+92 371 1317164';
  const email = process.env.NEXT_PUBLIC_STORE_EMAIL?.trim() || 'orders@smnimco.com';
  const address =
    process.env.NEXT_PUBLIC_STORE_ADDRESS?.trim() || 'Commercial Area, Karachi, Pakistan';

  const quickLinks: FooterLink[] = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Menu' },
    { href: '/deals', label: 'Our Offers' },
    {
      href: `mailto:${process.env.NEXT_PUBLIC_STORE_EMAIL?.trim() || 'orders@smnimco.com'}`,
      label: 'Contact Us',
    },
    ...categoryLinks.slice(0, 2).map((c) => ({
      href: `/categories/${c.slug}`,
      label: c.name,
    })),
  ];

  const supportLinks: FooterLink[] = [
    { href: '/track-order', label: 'Help Center' },
    { href: '/account', label: 'My Account' },
    { href: policyPageHref('privacy-policy'), label: 'Privacy Policy' },
    { href: policyPageHref('terms-conditions'), label: 'Terms & Conditions' },
    { href: policyPageHref('shipping-returns'), label: 'FAQ' },
  ];

  return (
    <footer className="site-footer site-footer--sm-nimco mt-16 border-t border-[var(--footer-border)] bg-[var(--footer-background,#1e1035)] pb-12 pt-16 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-6 pb-10 sm:flex-row">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-gold-primary,#d4af37)] bg-[var(--brand-gold-primary,#d4af37)]/10">
              <span className="font-heading text-xl font-extrabold text-[var(--brand-gold-primary,#d4af37)]">
                SM
              </span>
            </div>
            <span className="font-heading text-3xl font-extrabold tracking-wide text-white sm:text-4xl">
              SM Nimco
            </span>
          </Link>

          {socialLinks.length > 0 ? (
            <div className="flex items-center space-x-4">
              <span className="mr-2 text-sm font-semibold tracking-wide text-gray-300">
                Follow Us
              </span>
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LABELS[link.platform]}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-sm text-gray-300 transition hover:border-[var(--brand-gold-primary,#d4af37)] hover:text-[var(--brand-gold-primary,#d4af37)]"
                >
                  <SocialGlyph platform={link.platform} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="my-4 border-t border-gray-800" />

        <div className="grid grid-cols-1 gap-10 pt-10 md:grid-cols-12">
          <div className="space-y-6 md:col-span-4">
            <h3 className="font-heading text-2xl font-bold text-white sm:text-3xl">
              Subscribe Our Newsletter
            </h3>
            <NewsletterForm />
          </div>

          <div className="md:col-span-2">
            <LinkColumn title="Quick Links" links={quickLinks} />
          </div>

          <div className="md:col-span-3">
            <LinkColumn title="Support" links={supportLinks} />
          </div>

          <div className="space-y-4 md:col-span-3">
            <h4 className="font-heading text-xl font-bold text-white">Contact Info</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <ContactRow
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z" />
                  </svg>
                }
              >
                {address}
              </ContactRow>
              <ContactRow
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2a1 1 0 011-.24c1.1.37 2.3.57 3.5.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.4.57 3.5a1 1 0 01-.25 1l-2.22 2.3z" />
                  </svg>
                }
              >
                {phone}
              </ContactRow>
              <ContactRow
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.75" />
                    <path d="M3 7l9 6 9-6" strokeWidth="1.75" />
                  </svg>
                }
              >
                {email}
              </ContactRow>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
