import type { Config } from 'tailwindcss';

/**
 * Brand palette for household cleaning products storefront.
 * Tailwind v4 also mirrors these in app/globals.css @theme for CSS-first usage.
 */
const config = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2B7FFF',
          secondary: '#A3D2FF',
          accent: '#526BAF',
          text: '#1A2E40',
          bg: '#FFFFFF',
        },
      },
      boxShadow: {
        'product-card':
          '0 1px 3px 0 color-mix(in srgb, #1A2E40 7%, transparent), 0 4px 14px -2px color-mix(in srgb, #2B7FFF 8%, transparent)',
      },
    },
  },
} satisfies Config;

export default config;
