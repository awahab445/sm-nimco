import { getAddToCartStockErrorMessage } from '@/lib/cart-errors';
import { showStorefrontToast } from '@/lib/storefront-toast';

/** Show a toast for add-to-cart failures, with stock-specific copy when available. */
export function notifyAddToCartError(err: unknown) {
  const stockMessage = getAddToCartStockErrorMessage(err);
  if (stockMessage) {
    showStorefrontToast(stockMessage, 'error');
    return;
  }

  const fallback =
    err instanceof Error && err.message.trim()
      ? err.message
      : 'Failed to add item to cart. Please try again.';
  showStorefrontToast(fallback, 'error');
}

/** Lightweight success toast after add-to-cart (does not open the cart drawer). */
export function notifyAddToCartSuccess(productName?: string | null) {
  const name = productName?.trim();
  showStorefrontToast(
    name ? `Added ${name} to cart!` : 'Added to cart!',
    'success',
  );
}
