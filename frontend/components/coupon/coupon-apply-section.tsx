'use client';

import { useState } from 'react';
import type { ValidatePromotionItem } from '@/lib/api-client';
import { validateCouponCodeForCartLike } from '@/lib/coupon-sync';
import { storefrontUi } from '@/lib/storefront-ui';

export type CouponApplySectionProps = {
  appliedCouponCode: string | null;
  subtotal: number;
  items: ValidatePromotionItem[];
  customerId?: string;
  customerGroupId?: string;
  disabled?: boolean;
  /** After server-side rules pass; parent persists (localStorage and/or checkout API). */
  onValidatedApply: (
    code: string,
    meta: { discountAmount: number; isFreeShipping: boolean },
  ) => Promise<void>;
  onRemove: () => Promise<void>;
  className?: string;
};

export function CouponApplySection({
  appliedCouponCode,
  subtotal,
  items,
  customerId,
  customerGroupId,
  disabled,
  onValidatedApply,
  onRemove,
  className = '',
}: CouponApplySectionProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleApply = async () => {
    const code = input.trim();
    if (!code || disabled) return;
    setError(null);
    setLoading(true);
    try {
      const result = await validateCouponCodeForCartLike({
        code,
        subtotal,
        items,
        customerId,
        customerGroupId,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      await onValidatedApply(result.appliedCode, {
        discountAmount: result.discountAmount,
        isFreeShipping: result.isFreeShipping,
      });
      setInput('');
    } catch {
      setError('Failed to apply coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setError(null);
    setRemoving(true);
    try {
      await onRemove();
    } catch {
      setError('Failed to remove coupon.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={className}>
      {!appliedCouponCode && (
        <p className="mb-2 text-sm font-medium text-foreground">Apply coupon</p>
      )}
      {appliedCouponCode ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2">
          <span className="text-sm font-medium text-success">Coupon: {appliedCouponCode}</span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-success transition-colors hover:bg-success/20 disabled:opacity-50"
            aria-label="Remove coupon"
            title="Remove coupon"
          >
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <label htmlFor="coupon-code-input" className="sr-only">
            Apply coupon
          </label>
          <div className="flex gap-2">
            <input
              id="coupon-code-input"
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleApply();
                }
              }}
              placeholder="Coupon code"
              autoComplete="off"
              disabled={loading || !!disabled}
              className="min-w-0 flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
            />
            <button
              type="button"
              onClick={() => void handleApply()}
              disabled={loading || !!disabled || !input.trim()}
              className={`shrink-0 ${storefrontUi.btnPrimary} px-3 py-2`}
            >
              {loading ? '…' : 'Apply'}
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
