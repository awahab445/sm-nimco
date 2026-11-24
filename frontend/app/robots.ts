import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

const PRIVATE_PATHS = [
  '/admin',
  '/api',
  '/checkout',
  '/cart',
  '/account',
  '/profile',
  '/addresses',
  '/orders',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/create-password',
  '/verify-email',
  '/wishlist',
];

/** Product feeds (Google Merchant Center scheduled fetch) live under the otherwise-private /api. */
const PUBLIC_PATHS = ['/', '/api/feeds/'];

/**
 * AI search / training crawlers, named so they stay allowed even if the `*` group is tightened.
 * A named group replaces `*` for that bot, so it must repeat PRIVATE_PATHS.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'bingbot',
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      { userAgent: '*', allow: PUBLIC_PATHS, disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: PUBLIC_PATHS, disallow: PRIVATE_PATHS },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
