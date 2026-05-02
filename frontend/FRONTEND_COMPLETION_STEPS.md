# Frontend Completion – Step-by-Step Plan

This document outlines **ordered steps** to make the frontend complete against the current backend APIs. Implement each section in order; you can ask to have each section built in full before moving to the next.

---

## Current State (Summary)

| Area | Frontend | Backend | Gap |
|------|----------|---------|-----|
| **Auth** | Login/register/me/logout UI + store | JWT auth ✅ | Frontend doesn’t store or send `access_token`; middleware uses cookie, not token |
| **Addresses** | Full CRUD + set default UI | `/addresses` ✅ | API client doesn’t send Bearer token; create DTO needs `label` (optional) |
| **Products** | None | `GET /products`, `GET /products/id/:id`, `GET /products/:slug` ✅ | No product API in client; no home, product list, or product detail pages |
| **Cart** | Only `getCart(cartId)` | Full CRUD ✅ | No create, add/update/remove items; no cart ID persistence; no cart page |
| **Checkout** | Full flow (address, shipping, payment, review) | ✅ | Entry needs `cartId`; confirm should send `customerId`/`customerGroupId` when logged in; optional: use saved addresses |
| **Orders** | My orders + order detail pages | `GET /orders/my` (JWT) ✅ | API client doesn’t send Bearer; “my orders” fails without token |
| **Success page** | Shows order + payment status | Order has no `payments` in response | Need to call `GET /payments/order/:orderId` and merge |
| **Customer get-or-create** | Not used | `GET /customers/get-or-create?email=&isGuest=` ✅ | Needed for guest checkout (optional, after auth) |
| **Promotions** | Not used | Validate promotion ✅ | Optional: coupon in cart/checkout |

---

## Step 1 – Auth: JWT storage and sending (Bearer token)

**Goal:** Login/register work with the backend; protected routes and API calls use the token.

**Tasks:**

1. **Auth response**  
   Backend returns `{ access_token, user }`. Update `auth.service.ts` so:
   - Login/register parse `access_token` and `user`.
   - Store `access_token` (e.g. in `localStorage` or a cookie) and `user` in the auth store.

2. **Send token on requests**  
   Update `lib/api-client.ts` (and any other fetch that calls protected APIs) so that when a token exists, every request includes:
   - `Authorization: Bearer <access_token>`.

3. **Middleware**  
   Update `middleware.ts` so “authenticated” is determined by the same place the token is stored (e.g. cookie that holds the token, or a dedicated “auth” cookie set by the frontend after login). Redirect unauthenticated users from `/account`, `/profile`, `/addresses`, `/orders` to `/login`; redirect authenticated users from `/login` and `/register` to `/account`.

4. **Logout**  
   On logout, clear the stored token and user; call `POST /auth/logout` with the Bearer token before clearing (so backend can invalidate if needed).

5. **Auth store**  
   Ensure `checkAuth` uses `GET /auth/me` with the stored Bearer token and sets user; if the request fails (401), clear token and set user to null.

**Deliverables:**  
- Login/register store token and user.  
- All protected API calls send `Authorization: Bearer <token>`.  
- Middleware and logout behave as above.  
- Account, profile, addresses, orders work when logged in.

---

## Step 2 – API client: Products and Cart

**Goal:** Frontend can list products, get product by id/slug, and manage cart via backend.

**Tasks:**

1. **Product API** in `api-client.ts`:
   - `listProducts(query?)` → `GET /products` (support query params the backend expects, e.g. status, limit, search).
   - `getProductById(id)` → `GET /products/id/:id`.
   - `getProductBySlug(slug)` → `GET /products/:slug` (ensure no conflict with other routes).

2. **Cart API** in `api-client.ts`:
   - `createCart()` → `POST /cart` (returns cart with `id`).
   - `getCart(cartId)` (already exists).
   - `addItem(cartId, { productId, variantId, quantity })` → `POST /cart/:cartId/items`.
   - `updateItem(cartId, variantId, { quantity })` → `PUT /cart/:cartId/items/:variantId`.
   - `removeItem(cartId, variantId)` → `DELETE /cart/:cartId/items/:variantId`.
   - `clearCart(cartId)` → `DELETE /cart/:cartId` (if backend supports it).

3. **Cart ID persistence**  
   Introduce a small cart context or helper that:
   - On first “add to cart”, calls `createCart()`, then stores `cartId` in cookie or `localStorage` and uses it for all subsequent cart calls.
   - Exposes `cartId` and “add to cart” / “update” / “remove” so pages can use it.

**Deliverables:**  
- `productApi` and extended `cartApi` in `api-client.ts`.  
- Cart ID persisted and reused across pages.

---

## Step 3 – Storefront: Home, product list, product detail, “Add to cart”

**Goal:** Home and product pages are the main shopping surface and feed the cart.

**Tasks:**

1. **Home page** (`app/page.tsx`):
   - Replace default Next.js content with a storefront home: featured or recent products (from `listProducts`), site header/footer, nav (e.g. Home, Products, Cart, Account/Login).
   - “Add to cart” on each product (or link to product detail to add from there).

2. **Product listing** (e.g. `app/products/page.tsx`):
   - List products from `GET /products` (paginated if backend supports it).
   - Each item links to product detail; optional “Add to cart” on list.
   - Optional: simple filters (e.g. by status or search) if backend supports query params.

3. **Product detail** (e.g. `app/products/[slug]/page.tsx` or `app/products/id/[id]/page.tsx`):
   - Fetch product by slug or id (`getProductBySlug` or `getProductById`).
   - Show name, price, description, variants (if any); variant selector if applicable.
   - “Add to cart” button: use persisted `cartId` (create cart if none), then `addItem` with selected variant and quantity; show success and optionally link to cart or checkout.

4. **Header / layout**  
   - Global header with cart link (and cart item count if you have it from `getCart`) and account/login links.

**Deliverables:**  
- Home, product list, product detail pages wired to backend.  
- Add to cart creates/uses cart and updates backend; cart count (optional) in header.

---

## Step 4 – Cart page and checkout entry

**Goal:** Dedicated cart page and a single, clear path into checkout with `cartId`.

**Tasks:**

1. **Cart page** (e.g. `app/cart/page.tsx`):
   - Load cart by persisted `cartId`; if none or invalid, show empty cart and link to products.
   - List line items (product name, variant, quantity, price, row total); allow update quantity and remove line.
   - Show subtotal (and any discount/shipping/tax if you display them); “Proceed to checkout” button → redirect to `/checkout?cartId=<cartId>`.

2. **Checkout entry**  
   - Ensure the only way to reach the checkout flow is with a valid `cartId` (e.g. from cart page or after adding to cart).  
   - Keep existing checkout page logic that reads `cartId` from query and calls `POST /checkout/start` with it.

**Deliverables:**  
- Cart page with list, update, remove, and “Proceed to checkout” with `cartId`.  
- Checkout always receives `cartId` from cart (or from a controlled redirect after add-to-cart).

---

## Step 5 – Checkout: logged-in user and saved addresses

**Goal:** When the user is logged in, send `customerId`/`customerGroupId` and optionally prefill or choose saved addresses.

**Tasks:**

1. **Confirm checkout**  
   In the step that calls `confirmCheckout` (review step):
   - If user is logged in (from auth store), include `customerId` and `customerGroupId` (from `user` or from `GET /auth/me` / `GET /customers/me`) in the confirm payload.

2. **Address step**  
   - If user is logged in, load saved addresses via `GET /addresses` (with Bearer token).
   - Allow “Use saved address” for billing/shipping (select from list and map to the address shape the checkout API expects).
   - Keep existing manual address form for new or edit; optional “Save this address” that calls `POST /addresses` and then refreshes the list.

**Deliverables:**  
- Logged-in checkout sends `customerId` and `customerGroupId`.  
- Address step can use saved addresses and optionally save new ones.

---

## Step 6 – Order success page: show payments

**Goal:** Success page shows order and payment status even though the order API doesn’t include payments.

**Tasks:**

1. **Payments by order**  
   In `api-client.ts`, add:
   - `paymentApi.getPaymentsByOrder(orderId)` → `GET /payments/order/:orderId`.

2. **Success page**  
   In `app/checkout/success/page.tsx`:
   - After loading order by `orderId` or `orderNumber`, call `getPaymentsByOrder(orderId)`.
   - Merge the result into the order object (e.g. `order.payments = payments`) and use it for display and polling (if you keep polling for payment status).

**Deliverables:**  
- Success page displays payment status and amount using `GET /payments/order/:orderId`.  
- No dependency on order response including payments.

---

## Step 7 – Address book: token and DTO alignment

**Goal:** Addresses page works with the real backend and supports default billing/shipping.

**Tasks:**

1. **Bearer token**  
   Already covered in Step 1; ensure `/addresses` is called with `Authorization: Bearer <token>` (via the same mechanism as other protected APIs).

2. **Create/update DTO**  
   Backend expects optional `label` and required `firstName`, `lastName`, `addressLine1`, `city`, `state`, `postalCode`, `country` (and optional `company`, `addressLine2`, `phone`, `isDefaultBilling`, `isDefaultShipping`).  
   - In `api-client.ts`, ensure `Address` / `AddressWithId` and the payload for create/update match backend (add `label` if missing).  
   - In address form, add optional “Label” (e.g. “Home”, “Office”) and pass it in create/update.

3. **Set default**  
   Backend supports:
   - `POST /addresses/:id/default-billing`
   - `POST /addresses/:id/default-shipping`  
   Optionally use these instead of (or in addition to) PATCH with `isDefaultBilling`/`isDefaultShipping` so the UI matches backend.

**Deliverables:**  
- Addresses page works when logged in; create/update include `label` and match backend.  
- Set default billing/shipping works (via PATCH or dedicated POST).

---

## Step 8 – Optional: Guest checkout and promotions

**Goal:** Guest users can checkout; optional coupon support.

**Tasks:**

1. **Customer get-or-create**  
   Add to `api-client.ts`: `getOrCreateByEmail(email, isGuest?)` → `GET /customers/get-or-create?email=...&isGuest=...`.  
   At checkout start or address step, for guests (no token), call this with the guest email and use returned `customerId`/`customerGroupId` in confirm if needed.

2. **Promotions**  
   Add to `api-client.ts`: e.g. `validatePromotion(promotionId, { cartId, couponCode?, customerGroupId? })` (or whatever the backend expects).  
   In cart or checkout, add a “Coupon” field; on submit, call validate and show discount or error; pass validated promotion/code into checkout confirm if the backend requires it.

**Deliverables:**  
- Guest checkout can associate cart/checkout with a customer via get-or-create.  
- Optional coupon field and discount display in cart/checkout.

---

## Step 9 – Optional: Reorder and polish

**Goal:** “Reorder” from order history and small UX improvements.

**Tasks:**

1. **Reorder**  
   On “My orders” or order detail, add “Reorder”. Implement by creating a new cart (`createCart`), then for each order line calling `addItem` with the same `productId`/`variantId`/quantity; then redirect to `/cart` or `/checkout?cartId=...`.

2. **Polish**  
   - Metadata (title/description) for home, products, cart, checkout, account.  
   - Loading and error states on all data-fetching pages.  
   - Accessibility (labels, focus, basic ARIA where needed).

**Deliverables:**  
- Reorder creates a new cart and fills it from the order.  
- Consistent titles and error/loading handling.

---

## Suggested order of implementation

| Step | Section | Dependency |
|------|---------|------------|
| **1** | Auth: JWT storage and sending | None |
| **2** | API client: Products and Cart | None |
| **3** | Storefront: Home, product list, product detail | Step 2 |
| **4** | Cart page and checkout entry | Step 2 |
| **5** | Checkout: logged-in user and saved addresses | Step 1, 7 (address API) |
| **6** | Order success: payments | Step 1 (token for getOrder if protected) |
| **7** | Address book: token and DTO | Step 1 |
| **8** | Optional: Guest checkout and promotions | Step 1, 2 |
| **9** | Optional: Reorder and polish | Step 1, 2, 4 |

Recommended sequence: **1 → 2 → 3 → 4 → 7 → 5 → 6**, then **8** and **9** as needed.

---

## Quick reference: backend endpoints used

- **Auth:** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/logout` (Bearer).  
- **Customers:** `GET /customers/me`, `PATCH /customers/me` (Bearer); `GET /customers/get-or-create?email=&isGuest=` (public).  
- **Addresses:** `GET/POST /addresses`, `GET/PATCH/DELETE /addresses/:id`, `POST /addresses/:id/default-billing`, `POST /addresses/:id/default-shipping` (Bearer).  
- **Products:** `GET /products`, `GET /products/id/:id`, `GET /products/:slug`.  
- **Cart:** `POST /cart`, `GET /cart/:cartId`, `POST /cart/:cartId/items`, `PUT /cart/:cartId/items/:variantId`, `DELETE /cart/:cartId/items/:variantId`, `DELETE /cart/:cartId`.  
- **Checkout:** `POST /checkout/start`, `GET /checkout/:checkoutId`, `POST /checkout/:checkoutId/address`, `POST /checkout/:checkoutId/shipping`, `POST /checkout/:checkoutId/confirm`.  
- **Orders:** `GET /orders/my` (Bearer), `GET /orders/:id`, `GET /orders/number/:number`.  
- **Payments:** `GET /payments/order/:orderId`, `GET /payments/methods`, `POST /payments/intent`, etc.

You can ask to implement **Step N** in full (e.g. “Implement Step 1 – Auth: JWT storage and sending”) and we’ll go through each task in that section.
