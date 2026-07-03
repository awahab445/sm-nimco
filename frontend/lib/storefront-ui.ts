/**
 * Shared semantic Tailwind classes for storefront forms and alerts.
 * Keeps inputs, labels, and messages aligned with styles/store-themes.css tokens.
 */
const btnFocus =
  'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-brand-bg';
const btnDisabled = 'disabled:cursor-not-allowed disabled:opacity-50';

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
  /** Primary filled CTA — uses .btn-brand-primary in globals.css for theme-aware fill */
  btnPrimary: `btn-brand-primary px-4 py-2 text-sm ${btnFocus} ${btnDisabled}`,
  btnPrimaryLg: `btn-brand-primary mt-6 w-full py-3 text-base font-medium ${btnDisabled}`,
  btnPrimaryCheckout: `btn-brand-primary mt-6 w-full px-8 py-3 text-base font-semibold tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] ${btnDisabled}`,
  btnPrimarySubmit: `btn-brand-primary px-8 py-3 text-base font-semibold tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] ${btnDisabled}`,
  btnPrimaryBlock: 'btn-brand-primary w-full py-2.5',
  btnPrimaryInline: 'btn-brand-primary px-6 py-2',
  btnPrimaryInverted:
    'inline-flex justify-center rounded-md border border-primary-foreground/40 bg-primary-foreground px-5 py-2.5 text-sm font-medium text-primary shadow-sm transition-opacity hover:opacity-90',
  /** Outlined brand secondary action */
  btnSecondary: `rounded-md border border-brand-primary bg-card px-4 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-secondary/40 ${btnFocus} ${btnDisabled}`,
  /** Neutral cancel / back actions */
  btnNeutral: `rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted ${btnFocus} ${btnDisabled}`,
  btnNeutralLg: `rounded-md border border-border bg-card px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted ${btnFocus} ${btnDisabled}`,
  btnDestructive: `rounded-md border border-destructive/40 bg-card px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/30 ${btnDisabled}`,
  btnDestructiveText: `text-sm font-medium text-destructive transition-colors hover:opacity-80 ${btnDisabled}`,
  link: 'font-medium text-brand-primary transition-colors hover:text-brand-accent',
  badgeBrand:
    'rounded bg-brand-secondary/40 px-2 py-1 text-xs font-medium text-brand-accent ring-1 ring-inset ring-brand-secondary/45',
  card:
    'rounded-lg border border-border bg-card text-brand-text shadow-product-card',
  optionSelected: 'border-brand-primary bg-brand-secondary/40',
  optionIdle: 'border-border hover:border-input',
} as const;
