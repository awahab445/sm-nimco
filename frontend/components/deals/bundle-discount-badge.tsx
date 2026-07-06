import {
  formatBundleDiscountBadgePercentLine,
  getBundleDiscountAriaLabel,
} from '@/lib/deals/discount-badge';

type BundleDiscountBadgeProps = {
  percent: number;
  className?: string;
};

export function BundleDiscountBadge({ percent, className = '' }: BundleDiscountBadgeProps) {
  const percentLine = formatBundleDiscountBadgePercentLine(percent);

  return (
    <div
      className={`absolute top-4 right-4 z-10 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#FFB800] text-center shadow-md ${className}`.trim()}
      aria-label={getBundleDiscountAriaLabel(percent)}
      role="status"
    >
      <span className="text-base font-black leading-none text-[#0B2347]">{percentLine}</span>
      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0B2347]">
        OFF
      </span>
    </div>
  );
}
