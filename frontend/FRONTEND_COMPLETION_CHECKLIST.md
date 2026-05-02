# Frontend Completion Checklist – Consuming Backend API

**Post–9 steps:** All 9 frontend steps below are complete. For next actions (testing, Stripe, guest order lookup, categories, production), see **[NEXT_STEPS.md](../NEXT_STEPS.md)** at the repo root.

This document lists what was required on the **frontend** to fully consume the **backend API** and deliver a complete storefront and account experience.

---

## 1. Backend APIs the frontend expects but **do not exist**

These need either a **backend implementation** or a **frontend workaround**.

| Area | Frontend usage | Backend status | Recommendation |
|------|-----------------|----------------|----------------|
| **Auth** | `auth.service.ts`: `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me` | No auth module in backend | **Option A:** Add backend auth (JWT/session + login/register/me/logout). **Option B:** Use backend `GET /customers/get-or-create?email=...` for “guest” and keep login/register as client-only (no real auth) until backend has auth. |
| **Address book** | `addressApi` → `/addresses` (CRUD, set default billing/shipping) | No `/addresses` API in backend | **Option A:** Add backend “saved addresses” (e.g. per customerId). **Option B:** Remove Addresses page or use local storage only and prefill checkout from “saved” addresses in memory. |

---

## 2. API client gaps – backend has the API, frontend does not call it

Extend `lib/api-client.ts` and use the new methods in the UI where needed.

| Backend API | Frontend gap | Action |
|-------------|--------------|--------|
| **Products** | No `productApi` | Add: `listProducts(query?)`, `getProductById(id)`, `getProductBySlug(slug)`. Use for storefront and product detail. |
| **Cart** | Only `getCart(cartId)` | Add: `createCart()`, `addItem(cartId, { productId, variantId, quantity })`, `updateItem(cartId, variantId, { quantity })`, `removeItem(cartId, variantId)`, `clearCart(cartId)`. |
| **Promotions** | Not used | Add: `validatePromotion(promotionId, { cartId, couponCode?, customerGroupId? })` (and optionally list promotions). Use in cart/checkout for coupon field and discount display. |
| **Customer get-or-create** | Not used | Add: `getOrCreateByEmail(email, isGuest?)`. Use at checkout start for guest users instead of (or in addition to) auth. |

---

## 3. New pages / flows required to use backend fully

| Item | Description |
|------|-------------|
| **Home / storefront** | Replace default Next.js content with: product listing (from `GET /products`), category filter if you add categories API, “Add to cart” that creates/updates cart and navigates to cart or checkout. |
| **Product listing page** | e.g. `/products` – list products (and optionally by category), link to product detail. |
| **Product detail page** | e.g. `/products/[slug]` or `/products/id/[id]` – fetch by slug or id, show variant(s), “Add to cart” (create cart if needed, then add item). |
| **Cart page** | e.g. `/cart` – get cart by id (from cookie/localStorage/context), show line items, update quantity, remove item, “Proceed to checkout” → `/checkout?cartId=...`. |
| **Entry point to checkout** | Ensure checkout is only started with a valid `cartId` (from cart page or after “checkout” from product/cart). Current checkout page already expects `?cartId=`. |

---

## 4. Cart and checkout flow wiring

| Step | What’s needed |
|------|----------------|
| **Cart ID** | Create cart when user first adds to cart (`POST /cart`); persist `cartId` (e.g. in cookie or localStorage) and reuse for get/update/delete and for starting checkout. |
| **Add to cart** | Call `POST /cart/:cartId/items` with `productId`, `variantId`, `quantity`. Backend reserves inventory; on success refresh cart. |
| **Checkout start** | From cart page, redirect to `/checkout?cartId=<id>`. Checkout page already calls `POST /checkout/start` with `cartId`. |
| **Order / payments on success** | Backend `GET /orders/:id` does not include `payments`. Either: (1) On success page, call `GET /payments/order/:orderId` and merge into order for display, or (2) extend backend order response to include payments. Prefer (1) for minimal backend change. |

---

## 5. Auth and protected routes

| Topic | Current state | Recommendation |
|-------|----------------|----------------|
| **Middleware** | Protects `/account`, `/profile`, `/addresses`, `/orders` using `session` / `connect.sid` / `auth-token` cookie. | Backend has no auth, so no cookie is set; protected routes will always redirect to login. Either implement backend auth and set cookie/token, or relax middleware (e.g. allow access without cookie and show “Guest” or “Login to see orders”) and use optional auth. |
| **Orders “my”** | `orderApi.getMyOrders()` calls `GET /orders/my`, which expects `request.user.customerId`. | Backend has no auth, so `customerId` is never set and “my orders” may fail or return empty. Once auth exists, ensure backend reads customerId from JWT/session. For now, you could use `GET /orders?customerEmail=...` if backend supports it. |
| **Profile** | `customerApi.getProfile()` → `GET /customers/me`; backend expects auth. | Same as above: implement auth and set user/customerId, or hide profile until auth exists. |

---

## 6. Addresses page vs backend

| Option | Action |
|--------|--------|
| **Keep Addresses page** | Implement backend CRUD for saved addresses (e.g. `GET/POST/PATCH/DELETE /customers/me/addresses` or `/addresses` scoped by customer). Then point `addressApi` to these endpoints. |
| **Remove or simplify** | Remove “Manage Addresses” from account and/or use only checkout address form; optionally prefill from a single “last used” address in localStorage. |

---

## 7. Optional but useful

| Feature | Backend | Frontend |
|---------|---------|----------|
| **Categories** | Used in product (assign category); no dedicated “list categories” in Postman. | If you add a categories API, add category filter and category pages; otherwise skip or filter only by product search. |
| **Reorder** | No “reorder” API. | “Reorder” can be implemented by creating a new cart, then calling add-item for each order line (productId/variantId/quantity); use existing cart APIs. |
| **Stripe** | Payment intent and callback exist. | Complete Stripe Elements in `stripe-payment.tsx` and use `paymentApi.createIntent` + clientSecret as per CHECKOUT_README. |
| **Payment status on success** | Order does not include `payments`. | Call `paymentApi` by order id on success page and show payment status (see section 4). |

---

## 8. Suggested implementation order

1. **Products + cart API on frontend**  
   Add product and cart methods to `api-client.ts`.

2. **Home + product list + product detail + cart page**  
   Implement storefront and cart UI, wire “Add to cart” and “Proceed to checkout” with real `cartId`.

3. **Checkout entry**  
   Ensure `/checkout?cartId=...` is the only entry; checkout flow already uses backend.

4. **Success page payments**  
   Fetch payments by order on success page and display status (or extend backend order to include payments).

5. **Auth**  
   Either add backend auth and wire login/register/me/logout and cookies, or make auth optional and use guest + get-or-create customer where needed.

6. **Address book**  
   Either add backend address CRUD and wire `addressApi`, or remove/simplify addresses and rely on checkout-only addresses.

7. **Promotions**  
   Add promotion validate (and optionally list) to api-client and add coupon field in checkout/cart.

8. **Reorder**  
   Implement reorder by creating cart and adding items from order.

---

## 9. Environment

- Ensure `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3000` (or your backend URL).
- For Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` as in CHECKOUT_README.

---

## Summary table

| Category | Status | Notes |
|----------|--------|--------|
| Products (list, by id, by slug) | Backend ✅ / Frontend ✅ | productApi, product listing, product detail, category sidebar & filter |
| Cart (create, add, update, remove, clear) | Backend ✅ / Frontend ✅ | Full cart API, cart page, cartId in cookie/store |
| Checkout (start, address, shipping, customer, coupon, confirm) | Backend ✅ / Frontend ✅ | One-page checkout; guest customer & coupon wired |
| Orders (get, list, my, by email) | Backend ✅ / Frontend ✅ | Order list/detail; guest lookup via track-order page |
| Payments (methods, intent, by order) | Backend ✅ / Frontend ✅ | Success page loads payments by order; COD/redirect work |
| Shipping calculate | Backend ✅ / Frontend ✅ | Used in checkout shipping step |
| Auth (login, register, me, logout, request-account-creation, set-password) | Backend ✅ / Frontend ✅ | JWT auth; optional guest checkout with get-or-create |
| Address book (CRUD) | Backend ✅ / Frontend ✅ | Saved addresses API; Addresses page under account |
| Promotions (validate, list) | Backend ✅ / Frontend ✅ | Coupon in checkout; validate + discount display |
| Customer get-or-create | Backend ✅ / Frontend ✅ | Used for guest checkout and track-order |

All 9 steps are complete. For what to do next (testing, Stripe, production), see **[NEXT_STEPS.md](../NEXT_STEPS.md)**.
