import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(frontendRoot, "..");

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://analytics.tiktok.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data:; connect-src 'self' http: https: https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net https://analytics.tiktok.com; frame-src 'self' https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
];

const backendOrigin = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

function remotePatternFromOrigin(origin: string): {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname: string;
};

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

const backendOrigin = stripTrailingSlashes(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
);

/**
 * Build remotePatterns for every known media host.
 * Includes env origins plus production Essa Chemicals hosts, both http + https,
 * so next/image accepts absolute upload URLs even if build-time API_URL drifts.
 */
function collectImageRemotePatterns(): ImageRemotePattern[] {
  const origins = [
    backendOrigin,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    // StorefrontImage optimizes URLs on this origin (getPublicApiOrigin), so it must be allowed.
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
    // Production storefront / API (hardcoded fallbacks for image optimization)
    'https://api.essachemicals.pk',
    'http://api.essachemicals.pk',
    'https://shop.essachemicals.pk',
    'http://shop.essachemicals.pk',
    // Local / Docker defaults
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ]
    .map((o) => (o ? stripTrailingSlashes(o.trim()) : ''))
    .filter(Boolean);

  const seen = new Set<string>();
  const patterns: ImageRemotePattern[] = [];

  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin.includes('://') ? origin : `https://${origin}`);
    } catch {
      continue;
    }

    const hostname = parsed.hostname;
    if (!hostname) continue;

    for (const protocol of ['https', 'http'] as const) {
      const key = `${protocol}://${hostname}${parsed.port ? `:${parsed.port}` : ''}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const pattern: ImageRemotePattern = {
        protocol,
        hostname,
        pathname: '/**',
      };
      // Only attach port for localhost/dev — production hosts should not pin a port.
      if (
        parsed.port &&
        (hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.endsWith('.local'))
      ) {
        pattern.port = parsed.port;
      }
      patterns.push(pattern);
    }
  }
}

const localhostPatterns = [3000, 3001, 3002].flatMap((port) => [
  {
    protocol: 'http' as const,
    hostname: 'localhost',
    port: String(port),
    pathname: '/**',
  },
  {
    protocol: 'http' as const,
    hostname: '127.0.0.1',
    port: String(port),
    pathname: '/**',
  },
]);

const apiPattern = remotePatternFromOrigin(backendOrigin);
const remotePatterns = [
  ...localhostPatterns,
  ...(apiPattern ? [apiPattern] : []),
].filter(
  (pattern, index, all) =>
    all.findIndex(
      (p) =>
        p.protocol === pattern.protocol &&
        p.hostname === pattern.hostname &&
        p.port === pattern.port &&
        p.pathname === pattern.pathname,
    ) === index,
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Pin tracing root to this monorepo (avoids picking up C:\Users\pc\package-lock.json).
  outputFileTracingRoot: monorepoRoot,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns,
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendOrigin}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
