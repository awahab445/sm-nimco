'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error') || 'Payment could not be processed';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Failure Icon */}
          <div className="text-red-600 text-6xl mb-4">✕</div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-8">{error}</p>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-red-800">
              Your order may have been created, but payment could not be completed. Please try
              again or contact support if the problem persists.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderId && (
              <button
                onClick={() => router.push(`/checkout?orderId=${orderId}`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry Payment
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Return to Home
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

