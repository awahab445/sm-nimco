/**
 * Shared semantic Tailwind classes for storefront forms and alerts.
 * Keeps inputs, labels, and messages aligned with styles/store-themes.css tokens.
 */
export const storefrontUi = {
  input:
    'w-full rounded-md border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 sm:text-sm',
  inputMt:
    'mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 sm:text-sm',
  label: 'block text-sm font-medium text-foreground',
  labelMb: 'mb-1 block text-sm font-medium text-foreground',
  select:
    'w-full rounded-md border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25',
  alertError: 'rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive',
  alertErrorSm:
    'rounded-md border border-destructive/25 bg-destructive/10 p-4 text-destructive',
  checkbox:
    'h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring/30',
  btnPrimary:
    'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimaryLg:
    'mt-6 w-full rounded-md bg-primary py-3 text-base font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
  link: 'font-medium text-primary transition-colors hover:opacity-80',
} as const;
