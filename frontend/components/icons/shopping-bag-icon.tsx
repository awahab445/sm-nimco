import type { SVGProps } from 'react';

function mergeClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

type CartIconProps = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

/**
 * Kalles-style shopping cart (Feather cart) — thin outline with basket + wheels.
 * Kept export name for existing imports; visual matches demo `#icon-h-cart`.
 */
export function ShoppingBagIcon({
  className,
  strokeWidth = 1.2,
  ...rest
}: CartIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={mergeClassNames('cart-icon', className)}
      aria-hidden
      {...rest}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
