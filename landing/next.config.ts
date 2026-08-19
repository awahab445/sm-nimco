import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const landingRoot = path.dirname(fileURLToPath(import.meta.url));

/** Standalone Coming Soon static export — deploy the `out/` folder anywhere. */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  trailingSlash: true,
  // Keep build artifacts inside this package (avoid parent lockfile confusion).
  outputFileTracingRoot: landingRoot,
  turbopack: {
    root: landingRoot,
  },
};

export default nextConfig;
