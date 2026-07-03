/**
 * Shared semantic Tailwind classes for storefront forms and alerts.
 * Colors resolve from <html data-theme> CSS variables (see app/globals.css).
 */
const btnPrimary =
  'rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

export const storefrontUi = {
  input:
    'w-full rounded-md border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm',
  inputMt:
    'mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm',
  label: 'block text-sm font-medium text-foreground',
  labelMb: 'mb-1 block text-sm font-medium text-foreground',
  select:
    'w-full rounded-md border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
  alertError: 'rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive',
  alertErrorSm:
    'rounded-md border border-destructive/25 bg-destructive/10 p-4 text-destructive',
  checkbox:
    'h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/30',
  btnPrimary:
    'btn-brand-primary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimaryLg:
    'btn-brand-primary mt-6 w-full py-3 text-base font-medium disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimaryCheckout:
    'mt-6 w-full rounded-md bg-primary px-8 py-3 text-base font-semibold tracking-wide text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70',
  btnPrimarySubmit:
    'rounded-md bg-primary px-8 py-3 text-base font-semibold tracking-wide text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70',
  btnPrimaryBlock: `${btnPrimary} w-full py-2.5`,
  btnPrimaryInline: `${btnPrimary} px-6 py-2`,
  link: 'font-medium text-primary transition-colors hover:text-primary-hover',
  btnSecondary:
    'rounded-md border border-primary bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  badgeBrand:
    'rounded bg-secondary/60 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-secondary/80',
  card:
    'rounded-lg border border-border bg-card text-foreground shadow-product-card',
  optionSelected: 'border-primary bg-secondary/50',
  optionIdle: 'border-border hover:border-primary/40',
} as const;
