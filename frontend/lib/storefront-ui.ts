/**
 * Shared semantic Tailwind classes for storefront forms and alerts.
 * Keeps inputs, labels, and messages aligned with styles/store-themes.css tokens.
 */
export const storefrontUi = {
  input:
    'w-full rounded-md border border-input bg-card px-3 py-2 text-brand-text placeholder:text-muted-foreground shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/25 sm:text-sm',
  inputMt:
    'mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-brand-text placeholder:text-muted-foreground shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/25 sm:text-sm',
  label: 'block text-sm font-medium text-brand-text',
  labelMb: 'mb-1 block text-sm font-medium text-brand-text',
  select:
    'w-full rounded-md border border-input bg-card px-3 py-2 text-brand-text focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/25',
  alertError: 'rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive',
  alertErrorSm:
    'rounded-md border border-destructive/25 bg-destructive/10 p-4 text-destructive',
  checkbox:
    'h-4 w-4 rounded border-input text-brand-primary focus:ring-2 focus:ring-brand-primary/30',
  btnPrimary:
    'btn-brand-primary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimaryLg:
    'btn-brand-primary mt-6 w-full py-3 text-base font-medium disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimaryBlock:
    'btn-brand-primary w-full py-2 text-sm disabled:opacity-50',
  link: 'font-medium text-brand-primary transition-colors hover:text-brand-accent',
  btnSecondary:
    'rounded-md border border-brand-primary bg-card px-4 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:cursor-not-allowed disabled:opacity-50',
  badgeBrand:
    'rounded bg-brand-secondary/40 px-2 py-1 text-xs font-medium text-brand-accent ring-1 ring-inset ring-brand-secondary/45',
  card:
    'rounded-lg border border-border bg-card text-brand-text shadow-product-card',
  optionSelected: 'border-brand-primary bg-brand-secondary/40',
  optionIdle: 'border-border hover:border-input',
} as const;
