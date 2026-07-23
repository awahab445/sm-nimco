'use client';

import Link from 'next/link';
import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
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
import type { StoreThemeCode } from '@/lib/theme/types';
import { Reveal } from '@/components/ui/reveal';
import { SmNimcoFooter } from '@/components/themes/sm-nimco/footer';

function sortByPosition<T extends { position?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

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

function SocialPlatformIcon({
  platform,
  variant,
}: {
  platform: StorefrontSocialPlatform;
  variant: 'default' | 'essa';
}) {
  if (variant === 'essa') {
    switch (platform) {
      case 'facebook':
        return (
          <svg viewBox="0 0 320 512" aria-hidden>
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
          </svg>
        );
      case 'x':
        return (
          <svg viewBox="0 0 512 512" aria-hidden>
            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg viewBox="0 0 448 512" aria-hidden>
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg viewBox="0 0 576 512" aria-hidden>
            <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
          </svg>
        );
      case 'pinterest':
        return (
          <svg viewBox="0 0 496 512" aria-hidden>
            <path d="M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg viewBox="0 0 448 512" aria-hidden>
            <path d="M448 209.9a210.1 210.1 0 01-122.8-39.3v178.7A162.4 162.4 0 11185.4 192v90.1a72.1 72.1 0 1070.4 71.2V0h88.2a121.3 121.3 0 00104 103.5v106.4z" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg viewBox="0 0 448 512" aria-hidden>
            <path d="M380.9 97.1C339 55.1 283.2 32 224.1 32 103.5 32 4.8 130.7 4.8 251.4c0 38.7 10.1 76.5 29.3 109.8L0 480l122.1-32c31.9 17.4 67.8 26.6 104.5 26.6h.1c120.5 0 219.3-98.7 219.3-219.4 0-58.8-23.1-114.1-65.1-157.1zM224.6 438.7h-.1c-32.8 0-64.9-8.8-93-25.5l-6.7-4-72.4 19 19.3-70.6-4.4-7.1c-18.4-29.4-28.1-63.4-28.1-98.1 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 53.9 130.5-.1 101.8-82.9 184.6-183.5 184.6zm101.2-138.3c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg viewBox="0 0 448 512" aria-hidden>
            <path d="M100.3 448H7.4V148.9h92.9V448zM53.8 108.1C24.1 108.1 0 83.5 0 53.8S24.1-.5 53.8-.5 107.7 24.1 107.7 53.8s-24.1 54.3-53.9 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
          </svg>
        );
      default:
        return null;
    }
  }

  switch (platform) {
    case 'facebook':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
        </svg>
      );
    case 'x':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.2 2H21l-6.5 7.4L22 22h-6.2l-4.3-6.4L6 22H3.2l7-8L2 2h6.4l3.9 5.8L18.2 2zm-1.1 18h1.7L7 3.9H5.2L17.1 20z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23 8.2a3 3 0 00-2.1-2.1C19 5.6 12 5.6 12 5.6s-7 0-8.9.5A3 3 0 001 8.2 31.5 31.5 0 001 12a31.5 31.5 0 00.1 3.8 3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1A31.5 31.5 0 0023 12a31.5 31.5 0 00-.1-3.8zM9.8 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.2-2 0-2.9.2-.8 1.3-5.4 1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.2-3.8-3.1 0-5 2.3-5 4.8 0 .9.3 1.5.7 2 .1.1.1.2.1.3l-.3 1.1c0 .2-.1.2-.3.1-1.2-.5-1.8-1.8-1.8-3.3 0-2.5 2.1-5.5 6.3-5.5 3.4 0 5.6 2.4 5.6 5 0 3.4-1.9 5.9-4.7 5.9-.9 0-1.8-.5-2.1-1.1l-.6 2.2c-.2.8-.8 1.8-1.2 2.4 1 .3 2 .5 3.1.5 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.6 8.4a6.7 6.7 0 01-3.9-1.2v5.7a5.2 5.2 0 11-4.5-5.1v2.9a2.3 2.3 0 102.3 2.3V2.5h2.8a3.9 3.9 0 003.3 3.3v2.6z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 00-8.7 14.9L2 22l5.3-1.4A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1s-.7.8-.8 1c-.2.1-.3.2-.6.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4s-.6-1.4-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3s-.9.9-.9 2.1.9 2.4 1 2.6c.1.2 1.8 2.7 4.3 3.8 2.5 1.1 2.5.7 3 .7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M6.9 8.6H3.6V20h3.3V8.6zM5.2 3.5a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM20.4 20h-3.3v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H9.9V8.6h3.2v1.6h.1c.4-.9 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3V20z" />
        </svg>
      );
    default:
      return null;
  }
}

function SocialIcon({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: ReactNode;
}) {
  const className =
    'site-footer__social inline-flex h-6 w-6 items-center justify-center text-foreground transition-opacity hover:opacity-75';

  if (href) {
    return (
      <a
        href={href}
        className={className}
        aria-label={label}
        title={label}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <span className={className} aria-label={label} title={label}>
      {children}
    </span>
  );
}

function SocialIconsRow() {
  const links = useFooterSocialLinks();
  if (links.length === 0) return null;

  return (
    <div className="flex flex-row flex-wrap items-center gap-4 sm:gap-5" aria-label="Social media">
      {links.map((link) => (
        <SocialIcon key={link.id} label={SOCIAL_LABELS[link.platform]} href={link.url}>
          <SocialPlatformIcon platform={link.platform} variant="default" />
        </SocialIcon>
      ))}
    </div>
  );
}

/** Kalles demo footer socials: style-simple + size-small (18px icons, brand-color hover). */
type EssaSocialNetwork = StorefrontSocialPlatform;

function EssaSocialIcon({
  network,
  label,
  href,
  children,
}: {
  network: EssaSocialNetwork;
  label: string;
  href?: string;
  children: ReactNode;
}) {
  const className = `site-footer__social site-footer__social--${network} inline-flex items-center justify-center`;

  if (href) {
    return (
      <a
        href={href}
        className={className}
        aria-label={label}
        title={label}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <span className={className} aria-label={label} title={label}>
      {children}
    </span>
  );
}

function EssaSocialIconsRow() {
  const links = useFooterSocialLinks();
  if (links.length === 0) return null;

  return (
    <ul className="site-footer__socials flex flex-wrap items-center" aria-label="Social media">
      {links.map((link) => (
        <li key={link.id} className="site-footer__socials-item inline-flex leading-none">
          <EssaSocialIcon
            network={link.platform}
            label={SOCIAL_LABELS[link.platform]}
            href={link.url}
          >
            <SocialPlatformIcon platform={link.platform} variant="essa" />
          </EssaSocialIcon>
        </li>
      ))}
    </ul>
  );
}

const ESSA_SERVICE_ITEMS: Array<{
  title: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    title: 'Shipping Countrywide',
    description: 'Free Shipping on orders Rs. 1,500 and above!',
    Icon: Truck,
  },
  {
    title: '14 Days Return',
    description: 'Simply return it within 14 days for an exchange',
    Icon: RotateCcw,
  },
  {
    title: 'Security Payment',
    description: 'We ensure secure payment on every order',
    Icon: ShieldCheck,
  },
];

function FooterAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="site-footer__col border-b border-border md:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left md:pointer-events-none md:cursor-default md:py-0 md:pb-5"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <h3 className="site-footer__heading font-sans text-[17px] font-medium tracking-normal">
          {title}
        </h3>
        <span
          className={`site-footer__collapse-icon relative inline-flex h-7 w-7 items-center justify-center md:hidden ${open ? 'is-open' : ''}`}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        className={`${open ? 'block pb-5' : 'hidden'} md:block md:pb-0`}
      >
        {children}
      </div>
    </div>
  );
}

function FooterNewsletterForm({ inputId }: { inputId: string }) {
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
      const res = await subscriptionApi.subscribe({
        email: trimmed,
        source: 'footer',
      });
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
    <div>
      <form className="mt-5 w-full" onSubmit={(e) => void onSubmit(e)} noValidate>
        <label htmlFor={inputId} className="sr-only">
          Email for newsletter
        </label>
        <div className="site-footer__newsletter flex w-full flex-row items-stretch gap-0 overflow-hidden border border-[var(--footer-foreground,var(--foreground))] p-0.5">
          <input
            id={inputId}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            autoComplete="email"
            disabled={loading}
            suppressHydrationWarning
            className="min-w-0 w-full flex-1 border-0 bg-transparent px-3.5 py-2 text-xs text-[var(--footer-foreground,var(--foreground))] placeholder:text-[var(--footer-muted-foreground,var(--muted-foreground))] focus:outline-none focus:ring-0 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="site-footer__newsletter-submit w-auto shrink-0 px-4 py-2 text-[13px] font-semibold tracking-normal text-[var(--footer-newsletter-btn-foreground,#fff)] transition-colors disabled:opacity-60 sm:px-5"
          >
            {loading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </div>
      </form>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-2 text-sm text-emerald-600" role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}

function LinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <Link
            href={link.href}
            className="site-footer__link text-[15px] text-muted-foreground transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function useCategoryLinks() {
  const [categoryLinks, setCategoryLinks] = useState<CategoryTreeItem[]>([]);

  useEffect(() => {
    categoryApi
      .getCategories({ tree: true })
      .then((res) => {
        const tree = Array.isArray(res) ? res : [];
        setCategoryLinks(sortByPosition(tree as CategoryTreeItem[]).slice(0, 8));
      })
      .catch(() => setCategoryLinks([]));
  }, []);

  return categoryLinks;
}

function DefaultFooter() {
  const categoryLinks = useCategoryLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer border-t border-border bg-[var(--footer-background,var(--card))] text-[var(--footer-foreground,var(--foreground))]">
      <div className="mx-auto w-full max-w-[100rem] px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20 xl:px-16">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-4 lg:gap-12">
          <FooterAccordion title="Categories" defaultOpen>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="site-footer__link text-[15px] text-muted-foreground transition-colors">
                  All products
                </Link>
              </li>
              {categoryLinks.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="site-footer__link text-[15px] text-muted-foreground transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Information">
            <LinkList
              links={[
                { href: '/track-order', label: 'Track order' },
                { href: '/cart', label: 'Shopping cart' },
                { href: policyPageHref('shipping-returns'), label: 'Shipping & returns' },
                { href: policyPageHref('privacy-policy'), label: 'Privacy policy' },
                { href: policyPageHref('terms-conditions'), label: 'Terms & conditions' },
              ]}
            />
          </FooterAccordion>

          <FooterAccordion title="Useful links">
            <LinkList
              links={[
                { href: '/login', label: 'Log in' },
                { href: '/register', label: 'Create account' },
                { href: '/account', label: 'My account' },
                { href: '/orders', label: 'My orders' },
                { href: '/deals', label: 'Deals' },
              ]}
            />
          </FooterAccordion>

          <div className="border-b border-border py-4 md:border-0 md:py-0">
            <h3 className="site-footer__heading font-sans text-[17px] font-medium tracking-normal md:pb-5">
              FOLLOW US
            </h3>
            <div className="mt-1 md:mt-0">
              <SocialIconsRow />
            </div>
            <p className="site-footer__muted mt-5 max-w-none text-[15px] leading-relaxed text-muted-foreground md:max-w-sm">
              Subscribe to our newsletter and get 10% off your first purchase
            </p>
            <FooterNewsletterForm inputId="footer-newsletter" />
          </div>
        </div>

        <div className="site-footer__divider mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p className="site-footer__muted text-[15px] text-muted-foreground">
            © {year} {STORE_NAME}. All rights reserved.
          </p>
          <p className="site-footer__brand font-sans text-[15px] font-medium tracking-normal text-foreground">
            {STORE_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}

function EssaFooter() {
  const categoryLinks = useCategoryLinks();
  const year = new Date().getFullYear();

  const aboutLinks: FooterLink[] = [
    { href: policyPageHref('shipping-returns'), label: 'Shipping & returns' },
    { href: policyPageHref('terms-conditions'), label: 'Terms & conditions' },
    { href: policyPageHref('privacy-policy'), label: 'Privacy policy' },
    { href: '/track-order', label: 'Track order' },
    { href: '/deals', label: 'Deals' },
  ];

  const quickLinks: FooterLink[] = [
    { href: '/products', label: 'All products' },
    ...categoryLinks.map((c) => ({
      href: `/categories/${c.slug}`,
      label: c.name,
    })),
  ];

  const helpLinks: FooterLink[] = [
    { href: '/account', label: 'My account' },
    { href: '/orders', label: 'My orders' },
    { href: '/cart', label: 'Shopping cart' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/login', label: 'Log in' },
    { href: '/register', label: 'Create account' },
  ];

  const bottomLinks: FooterLink[] = [
    { href: policyPageHref('shipping-returns'), label: 'Shipping & returns' },
    { href: policyPageHref('privacy-policy'), label: 'Privacy policy' },
    { href: policyPageHref('terms-conditions'), label: 'Terms' },
    { href: '/track-order', label: 'Track order' },
    { href: '/account', label: 'My account' },
  ];

  return (
    <footer className="site-footer site-footer--essa border-t border-border text-[var(--footer-foreground,var(--foreground))]">
      <div className="site-footer__services bg-white">
        <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 sm:gap-6 sm:px-8 sm:py-12 lg:gap-10 lg:px-12 xl:px-16">
          {ESSA_SERVICE_ITEMS.map((item, index) => (
            <Reveal key={item.title} timeline order={index} className="site-footer__service-item">
              <div className="flex flex-col items-center gap-2.5 text-center">
                <span className="inline-flex shrink-0 text-[var(--footer-foreground,#222)]">
                  <item.Icon className="h-7 w-7 stroke-[1.15]" aria-hidden />
                </span>
                <div>
                  <h3 className="site-footer__service-title font-sans text-[15px] font-semibold tracking-normal text-[var(--footer-foreground,#222)]">
                    {item.title}
                  </h3>
                  <p className="site-footer__service-text mt-1 max-w-[16rem] text-[13px] leading-relaxed text-[var(--footer-muted-foreground,#878787)] sm:max-w-none">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="site-footer__main">
        <div className="mx-auto w-full max-w-[100rem] px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-4 lg:gap-12">
            <Reveal timeline order={0}>
              <FooterAccordion title="ABOUT" defaultOpen>
                <LinkList links={aboutLinks} />
              </FooterAccordion>
            </Reveal>

            <Reveal timeline order={1}>
              <FooterAccordion title="QUICK LINKS">
                <LinkList links={quickLinks} />
              </FooterAccordion>
            </Reveal>

            <Reveal timeline order={2}>
              <FooterAccordion title="HELP">
                <LinkList links={helpLinks} />
              </FooterAccordion>
            </Reveal>

            <Reveal timeline order={3}>
              <div className="site-footer__col border-b border-border py-4 md:border-0 md:py-0">
                <h3 className="site-footer__heading font-sans text-[17px] font-medium tracking-normal md:pb-5">
                  FOLLOW US
                </h3>
                <div className="mt-1 md:mt-0">
                  <EssaSocialIconsRow />
                </div>
                <p className="site-footer__muted mt-5 max-w-none text-[15px] leading-relaxed text-muted-foreground md:max-w-sm">
                  Subscribe to our newsletter and get 10% off your first purchase
                </p>
                <FooterNewsletterForm inputId="footer-newsletter-essa" />
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="site-footer__bar bg-white">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6 lg:px-12 xl:px-16">
          <p className="site-footer__muted text-[13px] text-[var(--footer-muted-foreground,#878787)] sm:text-[14px]">
            All Rights Reserved © {year} {STORE_NAME}
          </p>
          <nav aria-label="Footer secondary">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
              {bottomLinks.map((link) => (
                <li key={`bar-${link.href}`}>
                  <Link
                    href={link.href}
                    className="site-footer__bar-link text-[13px] text-[var(--footer-muted-foreground,#878787)] transition-colors hover:text-[var(--footer-link-hover,var(--foreground))] sm:text-[14px]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function Footer({ theme }: { theme: StoreThemeCode }) {
  if (theme === 'essa_chemicals') {
    return <EssaFooter />;
  }
  if (theme === 'sm_nimco') {
    return <SmNimcoFooter />;
  }
  return <DefaultFooter />;
}
