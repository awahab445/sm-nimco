/**
 * Shared semantic Tailwind classes for storefront forms and alerts.
 * Colors resolve from <html data-theme> / data-store-theme CSS variables.
 * Visual variants (pill, uppercase, orange ATC) are theme-scoped in globals.css.
 */
export const storefrontUi = {
  input:
    'w-full rounded-md border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm',
  inputMt:
    'mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm',
  inputSm:
    'min-w-0 flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
  inputCompact:
    'w-16 rounded-md border border-input bg-card px-2 py-1.5 text-center text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
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
    'btn-brand-primary mt-6 w-full px-8 py-3 text-base font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70',
  btnPrimarySubmit:
    'btn-brand-primary px-8 py-3 text-base font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70',
  btnPrimaryBlock:
    'btn-brand-primary w-full py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimaryInline:
    'btn-brand-primary px-6 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  link: 'font-medium text-primary transition-colors hover:text-primary-hover',
  btnSecondary:
    'btn-brand-secondary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  btnNeutral:
    'btn-brand-outline px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  btnNeutralLg:
    'btn-brand-outline w-full px-6 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  btnDestructive:
    'rounded-md border border-destructive/30 bg-card px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-50',
  btnDestructiveText:
    'font-medium text-destructive transition-colors hover:text-destructive/80 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimaryInverted:
    'btn-brand-inverted inline-flex items-center justify-center px-6 py-3 text-sm',
  badgeBrand:
    'rounded bg-secondary/60 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-secondary/80',
  card:
    'rounded-lg border border-border bg-card text-foreground shadow-product-card',
  optionSelected: 'border-primary bg-secondary/50',
  optionIdle: 'border-border hover:border-primary/40',
} as const;
