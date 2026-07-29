'use client';

import { useState } from 'react';
import { useCheckout } from '@/lib/checkout-context';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart.store';
import { formatPrice } from '@/lib/currency';
import { formatVariantAttributes } from '@/lib/format-variant-attributes';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { storefrontUi } from '@/lib/storefront-ui';

function ReviewItemThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = resolveImageUrl(src);
  if (!imageUrl || failed) return null;
  return (
    <div className="flex-shrink-0">
      <img
        src={imageUrl}
        alt={alt}
        className="h-20 w-20 rounded-md object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

interface ReviewStepProps {
  onBack: () => void;
}

export function ReviewStep({ onBack }: ReviewStepProps) {
  const { checkout, orderId, orderNumber, paymentRedirectUrl, isLoading, confirmCheckout, paymentInfo } = useCheckout();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);

  if (!checkout) {
    return <div className="text-muted-foreground">No checkout data available</div>;
  }

  const handlePlaceOrder = async () => {
    // If order already created, handle redirect or success
    if (orderId) {
      if (paymentRedirectUrl) {
        window.location.href = paymentRedirectUrl;
        return;
      }
      await clearCart();
      const sp = new URLSearchParams({
        orderId,
        ...(orderNumber ? { orderNumber } : {}),
        ...(checkout.customerEmail ? { email: checkout.customerEmail } : {}),
      });
      router.push(`/checkout/success?${sp.toString()}`);
      return;
    }

    // Confirm checkout (create order)
    if (!paymentInfo) {
      return;
    }

    try {
      const result = await confirmCheckout();

      // If redirect URL is provided (for redirect/hosted gateways), redirect immediately
      if (result.paymentIntent?.redirectUrl) {
        window.location.href = result.paymentIntent.redirectUrl;
        return;
      }

      // For client-side payments (Stripe) or COD, clear cart and redirect to success page
      await clearCart();
      const sp = new URLSearchParams({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        ...(checkout.customerEmail ? { email: checkout.customerEmail } : {}),
      });
      router.push(`/checkout/success?${sp.toString()}`);
    } catch {
      // Error is handled by context
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display mb-4 text-2xl font-semibold tracking-tight text-foreground">Review Your Order</h2>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="font-display mb-3 text-lg font-semibold tracking-tight text-foreground">Items</h3>
          <div className={`${storefrontUi.card} divide-y divide-border/60`}>
            {checkout.items.map((item, index) => (
              <div key={index} className="p-4 flex gap-4">
                {item.productImage ? (
                  <ReviewItemThumb
                    src={item.productImage}
                    alt={item.productName || 'Product'}
                  />
                ) : null}
                <div className="flex-1 flex justify-between">
                  <div>
                    <div className="font-medium text-foreground">
                      {item.productName || `Product ${item.productId}`}
                    </div>
                    {(() => {
                      const attrLines = formatVariantAttributes(
                        item.variantAttributes ?? item.attributes,
                      );
                      if (attrLines.length > 0) {
                        return (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {attrLines.map((line, lineIndex) => (
                              <span
                                key={`${item.variantId}-${lineIndex}-${line}`}
                                className="inline-flex max-w-full items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground"
                              >
                                <span className="truncate">{line}</span>
                              </span>
                            ))}
                          </div>
                        );
                      }
                      if (item.variantName) {
                        return <div className="mt-0.5 text-sm text-muted-foreground">{item.variantName}</div>;
                      }
                      return null;
                    })()}
                    <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      {formatPrice(item.price * item.quantity, checkout.currency)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-display mb-2 text-lg font-semibold tracking-tight text-foreground">Billing Address</h3>
            {checkout.billingAddress ? (
              <div className="text-sm text-muted-foreground">
                <p>
                  {checkout.billingAddress.firstName} {checkout.billingAddress.lastName}
                </p>
                <p>{checkout.billingAddress.addressLine1}</p>
                {checkout.billingAddress.addressLine2 && (
                  <p>{checkout.billingAddress.addressLine2}</p>
                )}
                <p>
                  {checkout.billingAddress.city}, {checkout.billingAddress.state}{' '}
                  {checkout.billingAddress.postalCode}
                </p>
                <p>{checkout.billingAddress.country}</p>
                {checkout.billingAddress.phone && <p>{checkout.billingAddress.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No billing address</p>
            )}
          </div>
          <div>
            <h3 className="font-display mb-2 text-lg font-semibold tracking-tight text-foreground">Shipping Address</h3>
            {checkout.shippingAddress ? (
              <div className="text-sm text-muted-foreground">
                <p>
                  {checkout.shippingAddress.firstName} {checkout.shippingAddress.lastName}
                </p>
                <p>{checkout.shippingAddress.addressLine1}</p>
                {checkout.shippingAddress.addressLine2 && (
                  <p>{checkout.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {checkout.shippingAddress.city}, {checkout.shippingAddress.state}{' '}
                  {checkout.shippingAddress.postalCode}
                </p>
                <p>{checkout.shippingAddress.country}</p>
                {checkout.shippingAddress.phone && <p>{checkout.shippingAddress.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No shipping address</p>
            )}
          </div>
        </div>

        {/* Shipping Method */}
        {checkout.shippingMethod && (
          <div className="mb-6">
            <h3 className="font-display mb-2 text-lg font-semibold tracking-tight text-foreground">Shipping Method</h3>
            <div className="text-sm text-muted-foreground">
              <p>{checkout.shippingMethod.methodName}</p>
              <p>
                Estimated delivery: {checkout.shippingMethod.estimatedDays} day
                {checkout.shippingMethod.estimatedDays !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-border pt-4">
          <h3 className="font-display mb-3 text-lg font-semibold tracking-tight text-foreground">Order Summary</h3>
          <div className="space-y-2 text-foreground">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                {formatPrice(checkout.subtotal, checkout.currency)}
              </span>
            </div>
            {checkout.discountTotal > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>
                  -{formatPrice(checkout.discountTotal, checkout.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {formatPrice(checkout.shippingTotal, checkout.currency)}
              </span>
            </div>
            {checkout.taxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>
                  {formatPrice(checkout.taxTotal, checkout.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/60 pt-2 text-lg font-semibold">
              <span>Total</span>
              <span>
                {formatPrice(checkout.grandTotal, checkout.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className={`${storefrontUi.btnNeutralLg} disabled:opacity-50`}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className={storefrontUi.btnPrimarySubmit}
        >
          {isLoading ? 'Processing...' : paymentRedirectUrl ? 'Proceed to Payment' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}

