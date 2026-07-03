import type { Config } from 'tailwindcss';

/** Theme tokens are driven by CSS variables on <html data-theme> (see app/globals.css). */
const config = {
  theme: {
    extend: {
        colors: {
        'primary-hover': 'var(--primary-hover)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        background: 'var(--background)',
        brand: {
          primary: 'var(--primary)',
          secondary: 'var(--secondary)',
          accent: 'var(--primary-hover)',
          text: 'var(--foreground)',
          bg: 'var(--background)',
        },
      },
      boxShadow: {
        'product-card':
          '0 1px 3px 0 color-mix(in srgb, var(--foreground) 7%, transparent), 0 4px 14px -2px color-mix(in srgb, var(--primary) 10%, transparent)',
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
