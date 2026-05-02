# Next Steps – After Completing All 9 Frontend Steps

This document suggests **recommended next steps** now that the storefront, cart, checkout, orders, auth, addresses, promotions, and reorder flows are wired end-to-end.

---

## 1. Testing (High impact)

| Area | Status | Notes |
|------|--------|--------|
| **Backend unit** | Done | `cart.service.spec.ts` (createCart, getCart not found, getCart enriched), `checkout.totals.spec.ts` (calculateSubtotal), `order.factory.spec.ts` (createOrderData: cart not found, empty cart). Run: `npm run test`. Jest `maxWorkers: 2` in package.json avoids `os.availableParallelism` on older Node. |
| **Backend e2e** | Done | `test/cart.e2e-spec.ts`: POST /cart, GET /cart/:id (404 and 200). Requires Redis (or `REDIS_ENABLED=false` for in-memory) and DB. See `backend/test/README.md`. Run: `npm run test:e2e`. |
| **Frontend unit** | Done | Jest + ts-jest + jsdom; tests in `lib/__tests__/`: `auth-token.test.ts` (getToken, setToken, clearToken), `cart.store.test.ts` (getOrCreateCartId, clearError, reorderFromOrder), `config.test.ts` (DEFAULT_CURRENCY). Run: `npm test`. Uses standalone Jest config (no next/jest) and `maxWorkers: 2` for older Node. |
| **Frontend E2E** | Optional | Add Playwright or Cypress for: add to cart → checkout → place order → success. |

**Why:** Prevents regressions and gives confidence before deployment.

---

## 2. Complete Stripe client-side flow (Optional)

| Current state | Recommendation |
|---------------|----------------|
| `stripe-payment.tsx` is a placeholder (no card element, `confirmCardPayment` with empty card) | Integrate Stripe Elements: mount CardElement, call `stripe.confirmCardPayment(clientSecret)` with `payment_method: { card: cardElement }`. Use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. See Stripe docs and CHECKOUT_README. |

**Why:** Enables real card payments; COD and redirect gateways already work.

---

## 3. Guest order lookup (Optional) ✅ Done

| Current state | Recommendation |
|---------------|----------------|
| ~~“My orders” requires login. Guests have no way to see past orders.~~ | **Implemented:** `/track-order` page: guests enter email + order number → `GET /orders?customerEmail=...` (existing API) → match by `orderNumber` (case-insensitive) → redirect to `/orders/[id]`. Order detail route `/orders/[id]` is public so guests can view after lookup. “Track order” links in header, footer, and login page (“Track an order without logging in”). |

**Why:** Better UX for guest checkout users.

---

## 4. Categories on the storefront (Optional) ✅ Done

| Current state | Recommendation |
|---------------|----------------|
| ~~No categories API.~~ | **Implemented:** Backend: **Category** model (id, name, slug, description, parentId, position, isActive). **ProductCategory** now has FK to Category. Public **GET /categories** (flat or ?tree=true), **GET /categories/slug/:slug**. Admin **CRUD** at **/admin/categories**. Products list supports **?category=id**. Frontend: **categoryApi** (getCategories, getCategoryBySlug). **Category sidebar** on `/products` with “All products” + category links. **/categories/[slug]** page shows category name, description, and products. Products page supports **?category=** for filtered list. Run **`npx prisma migrate deploy`** (or `migrate dev`) and **`npx prisma generate`**; if you have existing `product_categories` rows, ensure their `category_id` exists in `categories` or clear them first. |

**Why:** Improves discovery and navigation.

---

## 5. Documentation and checklist (Quick win) Done

| Action |
|--------|
| **FRONTEND_COMPLETION_CHECKLIST.md:** Summary table updated; all items marked done; Post–9 steps section at top points to NEXT_STEPS.md. |
| **README (frontend):** Run instructions, env vars (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, etc.), project structure. |
| **README (backend):** Quick start, env vars table (DATABASE_URL, JWT_SECRET, REDIS_*, etc.), link to SETUP.md and Postman. |

**Why:** Keeps the repo clear for future you or other developers.

---

## 6. Production readiness (Before go-live)

| Area | Recommendation |
|------|----------------|
| **Environment** | Use strong `JWT_SECRET`; set `NEXT_PUBLIC_API_URL` to production API; configure Redis and DB for production. |
| **CORS** | Restrict backend CORS to the real frontend origin(s) in production. |
| **Cookies** | In production, consider `SameSite=Strict` or `Lax` and `Secure` for auth cookie (HTTPS). |
| **Health checks** | Backend: expose a health endpoint (e.g. `/health`) that checks DB and Redis; use for load balancer or orchestrator. |
| **Logging / errors** | Ensure backend logs errors and request ids; optional: frontend error tracking (e.g. Sentry). |

**Why:** Security, stability, and operability in production.

---

## 7. Admin panel

| Decision | Recommendation |
|----------|----------------|
| **Where to build admin?** | See **[ADMIN_PANEL.md](ADMIN_PANEL.md)** for a full comparison. **Recommended:** a **separate Next.js application** that consumes the existing backend admin APIs. **Implementation:** use **[MASTER_PROMPT_ADMIN_NEXTJS.md](MASTER_PROMPT_ADMIN_NEXTJS.md)** as the module-by-module build spec. **Alternative:** add `/admin/*` routes inside the current frontend if you need a minimal admin quickly. |

---

## 8. Suggested order

1. **Documentation** – Update checklist and README (quick).
2. **Admin panel** – Decide same app vs. separate app (see ADMIN_PANEL.md); then implement.
3. **Testing** – Backend e2e for checkout + order; then frontend E2E if you have capacity.
4. **Stripe** – If you need card payments; otherwise rely on COD/redirect.
5. **Production readiness** – Before first real deployment.

---

## Summary

- **Core flows are done:** Browse → cart → checkout (guest or logged-in) → order → success, with payments, addresses, coupons, search, categories, and reorder.
- **Next:** Decide admin panel approach (see ADMIN_PANEL.md), then tests, Stripe (optional), and production hardening.
