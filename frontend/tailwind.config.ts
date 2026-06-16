import type { Config } from 'tailwindcss';

/** Brand palette + product-card shadow — sole theme source (see app/globals.css @config). */
const config = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4f90f1',
          secondary: '#eef4fe',
          accent: '#3577d9',
          text: '#1A2E40',
          bg: '#F5F5F5',
        },
      },
      boxShadow: {
        'product-card':
          '0 1px 3px 0 color-mix(in srgb, #1A2E40 7%, transparent), 0 4px 14px -2px color-mix(in srgb, #4f90f1 10%, transparent)',
      },
    },
  },
} satisfies Config;

export default config;
