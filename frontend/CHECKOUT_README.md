# Checkout UI Implementation

This document describes the complete checkout UI implementation for the e-commerce platform.

## Overview

The checkout system is a multi-step process that integrates with the NestJS backend to handle:
- Address collection (billing and shipping)
- Shipping method selection
- Payment method selection
- Order review and confirmation
- Payment processing (Stripe, EasyPaisa, JazzCash, Bank Hosted Pages, COD)
- Success/failure handling

## Architecture

### File Structure

```
frontend/
├── app/
│   └── checkout/
│       ├── page.tsx              # Main checkout page
│       ├── success/
│       │   └── page.tsx          # Success page with order verification
│       └── failure/
│           └── page.tsx          # Failure page with retry option
├── components/
│   └── checkout/
│       ├── address-step.tsx      # Step 1: Address collection
│       ├── shipping-step.tsx     # Step 2: Shipping method selection
│       ├── payment-step.tsx       # Step 3: Payment method & customer info
│       ├── review-step.tsx        # Step 4: Order review
│       └── stripe-payment.tsx     # Stripe payment component (placeholder)
└── lib/
    ├── api-client.ts              # API client utilities
    └── checkout-context.tsx       # React Context for checkout state
```

## Features

### 1. Multi-Step Checkout Flow

- **Step 1: Address** - Collect billing and shipping addresses
- **Step 2: Shipping** - Select shipping method (fetched from backend)
- **Step 3: Payment** - Select payment method and enter customer information
- **Step 4: Review** - Review order details before placing order

### 2. State Management

The `CheckoutContext` provides centralized state management:
- Checkout session data
- Current step tracking
- Loading and error states
- Payment redirect URLs
- Order information

### 3. Payment Handling

#### Redirect Gateways (EasyPaisa, JazzCash, Bank Hosted Pages)
- User is redirected to payment gateway after order creation
- Backend handles callback verification
- Success page polls for payment status

#### Client-Side Payments (Stripe)
- Payment form rendered in browser
- Payment confirmed client-side
- Order created after successful payment

#### Cash on Delivery (COD)
- Order created immediately
- Payment status set to pending
- No redirect required

### 4. Security Features

- All pricing calculations done on backend
- No price data stored in frontend
- Payment secrets never exposed to client
- Order verification on success page (doesn't trust redirect alone)

## Usage

### Starting Checkout

```tsx
// Navigate to checkout with cartId
router.push(`/checkout?cartId=${cartId}`);
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### API Integration

The checkout system uses the following backend endpoints:

- `POST /checkout/start` - Start checkout from cart
- `GET /checkout/:checkoutId` - Get checkout session
- `POST /checkout/:checkoutId/address` - Update addresses
- `POST /checkout/:checkoutId/shipping` - Update shipping method
- `POST /checkout/:checkoutId/confirm` - Confirm checkout and create order
- `POST /shipping/calculate` - Calculate shipping options
- `GET /orders/:id` - Get order details

## Payment Methods

### Supported Payment Methods

1. **Stripe** (`stripe`)
   - Flow: Client-side
   - Requires: Stripe.js integration
   - Status: Placeholder implementation

2. **EasyPaisa** (`easypaisa`)
   - Flow: Redirect
   - User redirected to EasyPaisa gateway

3. **JazzCash** (`jazzcash`)
   - Flow: Redirect
   - User redirected to JazzCash gateway

4. **HBL Bank** (`hbl`)
   - Flow: Hosted page
   - User redirected to bank hosted page

5. **UBL Bank** (`ubl`)
   - Flow: Hosted page
   - User redirected to bank hosted page

6. **Cash on Delivery** (`cod`)
   - Flow: Offline
   - Order created, payment pending

## Success Page

The success page:
- Fetches order details from backend
- Verifies payment status (doesn't trust redirect)
- Polls for payment status updates (for redirect gateways)
- Shows appropriate status (Confirmed, Pending, Failed)

## Failure Page

The failure page:
- Shows error message
- Provides retry option (if orderId available)
- Links back to home page

## Customization

### Adding Payment Methods

Update the `PAYMENT_METHODS` array in `components/checkout/payment-step.tsx`:

```tsx
const PAYMENT_METHODS = [
  { code: 'your-method', name: 'Your Payment Method', type: 'redirect' },
  // ...
];
```

### Styling

The checkout uses TailwindCSS. Customize styles by modifying the className props in components.

### Stripe Integration

To complete Stripe integration:
1. Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
2. Update `components/checkout/stripe-payment.tsx` to use Stripe Elements
3. Add Stripe publishable key to environment variables

## Error Handling

- API errors are caught and displayed to user
- Form validation prevents invalid submissions
- Loading states prevent duplicate submissions
- Network errors show user-friendly messages

## Testing

1. Start the backend server
2. Create a cart with items
3. Navigate to `/checkout?cartId=<cartId>`
4. Complete the checkout flow
5. Verify order creation and payment processing

## Notes

- The checkout session expires after 30 minutes (backend setting)
- Payment redirect URLs are handled automatically
- Order verification is critical - never trust redirect success alone
- All totals come from backend - frontend never calculates prices

