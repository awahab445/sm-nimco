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
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data:; connect-src 'self' http: https: https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net; frame-src 'self' https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
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
} | null {
  try {
    const url = new URL(origin);
    const protocol = url.protocol.replace(':', '') as 'http' | 'https';
    if (protocol !== 'http' && protocol !== 'https') return null;
    return {
      protocol,
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: '/**',
    };
  } catch {
    return null;
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
