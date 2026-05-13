import { ShoppingBag } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

function mergeClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Store cart bag icon. Stroke uses `currentColor`, defaulting to `--foreground`
 * so light/dark and store-theme token changes apply automatically.
 * Inside links/buttons, color inherits from the parent (header nav, footer, etc.).
 */
export function ShoppingBagIcon({
  className,
  strokeWidth = 2,
  ...rest
}: LucideProps) {
  return (
    <ShoppingBag
      strokeWidth={strokeWidth}
      stroke="currentColor"
      className={mergeClassNames('cart-icon', className)}
      {...rest}
    />
  );
}
