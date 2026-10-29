/**
 * Shared button / chrome classes for the SM Nimco & Sweets admin panel.
 */
const btnDisabled = 'disabled:cursor-not-allowed disabled:opacity-50';

export const adminUi = {
  btnPrimary: `inline-flex items-center justify-center rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110 hover:shadow-brand-glow ${btnDisabled}`,
  btnPrimarySm: `inline-flex items-center justify-center rounded-lg bg-brand-gradient px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 ${btnDisabled}`,
  btnPrimaryMd: `inline-flex items-center justify-center rounded-lg bg-brand-gradient px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110 ${btnDisabled}`,
  btnSecondary: `inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-soft hover:border-brand/30 dark:hover:bg-brand-soft ${btnDisabled}`,
  btnDestructive: `inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-950 ${btnDisabled}`,
  link: 'font-medium text-brand hover:text-brand-secondary dark:text-amber-400 dark:hover:text-amber-300',
  tableHead:
    'border-b border-border bg-muted/80 dark:bg-stone-900/60',
  tableHeadCell:
    'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
  tableRow:
    'transition-colors duration-150 hover:bg-brand-soft/70 dark:hover:bg-brand-soft',
} as const;

/** Recharts palette — SM Nimco amber / terracotta. */
export const chartColors = {
  primary: '#d97706',
  primaryBright: '#f59e0b',
  secondary: '#ea580c',
  terracotta: '#c2410c',
  muted: '#a8a29e',
  grid: '#e7e5e4',
  gridDark: '#292524',
} as const;
