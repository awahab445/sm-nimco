import type { CartItem } from '@/lib/api-client';
import { getCartItemImageUrl } from '@/lib/use-cart-item-fallback-images';

type CartLineItemThumbProps = {
  item: CartItem;
  fallbackProductImages: Record<string, string>;
  size?: 'sm' | 'md';
};

const sizeClass = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]',
} as const;

export function CartLineItemThumb({
  item,
  fallbackProductImages,
  size = 'md',
}: CartLineItemThumbProps) {
  const imageUrl = getCartItemImageUrl(item, fallbackProductImages);

  return (
    <div
      className={`${sizeClass[size]} shrink-0 overflow-hidden rounded-lg border border-border bg-muted shadow-sm`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.productName || 'Product'}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
          No image
        </div>
      )}
    </div>
  );
}
