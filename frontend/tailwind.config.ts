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
      animation: {
        marquee: 'marquee var(--marquee-duration, 25s) linear infinite',
        'whatsapp-bounce': 'whatsapp-bounce 2.5s ease-in-out infinite',
        'plp-sheet-enter': 'plp-sheet-enter 0.32s ease-out',
        'plp-backdrop-enter': 'plp-backdrop-enter 0.24s ease-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-100%, 0, 0)' },
        },
        'whatsapp-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'plp-sheet-enter': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'plp-backdrop-enter': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
} satisfies Config;

export default config;
