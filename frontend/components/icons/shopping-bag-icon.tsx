import { ShoppingBag } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

/**
 * Store header cart: Lucide `ShoppingBag` (outlined bag, curved handle).
 * Default stroke matches clear outline at h-6 w-6.
 */
export function ShoppingBagIcon({ strokeWidth = 2, ...rest }: LucideProps) {
  return <ShoppingBag strokeWidth={strokeWidth} {...rest} />;
}
