import { ApiError } from './api-client';

type StockErrorPayload = {
  message?: string;
  availableStock?: number;
};

function extractStockPayload(data: unknown): StockErrorPayload | null {
  if (!data || typeof data !== 'object') return null;

  const root = data as StockErrorPayload;
  if (typeof root.availableStock === 'number') {
    return {
      message: typeof root.message === 'string' ? root.message : undefined,
      availableStock: root.availableStock,
    };
  }

  if (root.message && typeof root.message === 'object') {
    const nested = root.message as StockErrorPayload;
    if (typeof nested.availableStock === 'number') {
      return {
        message: typeof nested.message === 'string' ? nested.message : undefined,
        availableStock: nested.availableStock,
      };
    }
  }

  return null;
}

function formatStockCountMessage(availableStock: number, prefix: string): string {
  if (availableStock <= 0) {
    return `${prefix}This product is out of stock.`;
  }

  return availableStock === 1
    ? `${prefix}Only 1 item left in stock.`
    : `${prefix}Only ${availableStock} items left in stock.`;
}

/** User-facing message for insufficient-stock API errors (toast / global notifications). */
export function getAddToCartStockErrorMessage(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null;

  const payload = extractStockPayload(err.data);
  if (!payload || payload.availableStock === undefined) return null;

  return formatStockCountMessage(payload.availableStock, 'Cannot add to cart. ');
}

/** Shorter stock message for inline product detail alerts. */
export function getInlineStockAlertMessage(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null;

  const payload = extractStockPayload(err.data);
  if (!payload || payload.availableStock === undefined) return null;

  return formatStockCountMessage(payload.availableStock, '');
}

/** Returns available stock from an insufficient-stock API error, if present. */
export function getAvailableStockFromError(err: unknown): number | null {
  if (!(err instanceof ApiError)) return null;
  const payload = extractStockPayload(err.data);
  return payload?.availableStock ?? null;
}
