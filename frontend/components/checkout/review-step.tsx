'use client';

import { useCheckout } from '@/lib/checkout-context';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart.store';
import { DEFAULT_CURRENCY } from '@/lib/config';

interface ReviewStepProps {
  onBack: () => void;
}

export function ReviewStep({ onBack }: ReviewStepProps) {
  const { checkout, orderId, orderNumber, paymentRedirectUrl, isLoading, confirmCheckout, paymentInfo } = useCheckout();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);

  if (!checkout) {
    return <div>No checkout data available</div>;
  }

  const handlePlaceOrder = async () => {
    // If order already created, handle redirect or success
    if (orderId) {
      if (paymentRedirectUrl) {
        window.location.href = paymentRedirectUrl;
        return;
      }
      await clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
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
      router.push(`/checkout/success?orderId=${result.orderId}`);
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Review Your Order</h2>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Items</h3>
          <div className="border border-gray-200 rounded-lg divide-y">
            {checkout.items.map((item, index) => (
              <div key={index} className="p-4 flex gap-4">
                {item.productImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.productName || 'Product'}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1 flex justify-between">
                  <div>
                    <div className="font-medium">
                      {item.productName || `Product ${item.productId}`}
                    </div>
                    {item.variantName && (
                      <div className="text-sm text-gray-500">{item.variantName}</div>
                    )}
                    <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: DEFAULT_CURRENCY,
                      }).format(item.price * item.quantity)}
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
            <h3 className="text-lg font-medium mb-2">Billing Address</h3>
            {checkout.billingAddress ? (
              <div className="text-sm text-gray-600">
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
              <p className="text-sm text-gray-500">No billing address</p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
            {checkout.shippingAddress ? (
              <div className="text-sm text-gray-600">
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
              <p className="text-sm text-gray-500">No shipping address</p>
            )}
          </div>
        </div>

        {/* Shipping Method */}
        {checkout.shippingMethod && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Shipping Method</h3>
            <div className="text-sm text-gray-600">
              <p>{checkout.shippingMethod.methodName}</p>
              <p>
                Estimated delivery: {checkout.shippingMethod.estimatedDays} day
                {checkout.shippingMethod.estimatedDays !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: DEFAULT_CURRENCY,
                }).format(checkout.subtotal)}
              </span>
            </div>
            {checkout.discountTotal > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>
                  -{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: DEFAULT_CURRENCY,
                  }).format(checkout.discountTotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: DEFAULT_CURRENCY,
                }).format(checkout.shippingTotal)}
              </span>
            </div>
            {checkout.taxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: DEFAULT_CURRENCY,
                  }).format(checkout.taxTotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: DEFAULT_CURRENCY,
                }).format(checkout.grandTotal)}
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
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : paymentRedirectUrl ? 'Proceed to Payment' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}

