# Master Prompt: Separate Admin Next.js Application (Option B)

Use this document as the **single reference** when building the **back-office admin frontend** as a **standalone Next.js application** that communicates only with the existing **ecommerce-platform backend API**. Implement **module by module** in the order listed so each phase delivers visible, testable functionality.

**Related docs:** [ADMIN_PANEL.md](./ADMIN_PANEL.md) (architecture decision), backend [SETUP.md](./backend/SETUP.md), [Postman collection](./backend/postman/Ecommerce-Platform-API.postman_collection.json).

---

## 1. Project charter

### 1.1 What you are building

- A **new** Next.js project (e.g. repository path `admin/` or `apps/admin/`), **not** inside the storefront `frontend/` app.
- **Consumers only:** All data and mutations go through the **existing REST API** (same base URL as storefront, typically `http://localhost:3000` in development).
- **Users:** Internal operators (merchandising, support, warehouse). **Not** end customers.

### 1.2 Non-goals (for v1)

- Do not duplicate storefront flows (cart, checkout, public product browse).
- Do not require changes to the backend unless you discover a missing endpoint; prefer Postman-verified APIs first.
- Optional later: role-based admin vs super-admin (only if backend adds roles).

### 1.3 Quality bar

- **Consistent layout:** Sidebar navigation, top bar (user, logout), breadcrumbs where helpful.
- **Tables:** Sortable/filterable lists, pagination where the API supports `page` / `limit`.
- **Forms:** Validation aligned with backend DTOs; show API error messages clearly.
- **Security:** Store admin auth token securely (httpOnly cookie preferred, or secure memory + refresh strategy); never expose secrets in client bundles.
- **Performance:** Lazy-load heavy routes; debounce search inputs; reasonable page sizes (e.g. 20–50 rows).

---

## 2. Technical baseline

### 2.1 Suggested stack

| Layer | Suggestion |
|-------|------------|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS (match team familiarity) |
| Tables | TanStack Table (or simple HTML tables for v1) |
| Forms | React Hook Form + Zod (optional) |
| HTTP | `fetch` wrapper or axios; mirror storefront patterns |
| UI kit | shadcn/ui, Radix, or Headless UI (pick one and stay consistent) |

### 2.2 Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:3000`) |
| Optional | `NEXT_PUBLIC_ADMIN_APP_NAME` for branding |

**CORS:** Backend must allow the admin origin (e.g. `http://localhost:3002`). Set `CORS_ORIGIN` or equivalent on the backend for production admin URL.

### 2.3 Authentication (align with backend)

- Backend uses **`POST /auth/login`** (and optionally register) with JWT.
- **Important:** Today the API may not distinguish “admin” vs “customer” in the token. For v1 you may use the same login with known admin credentials, or add backend `role` later. Document in README who is allowed to use the admin app.
- Admin app should:
  - Call login → receive `access_token` (or whatever the backend returns).
  - Attach **`Authorization: Bearer <token>`** on every admin API request.
  - On **401**, clear session and redirect to `/login`.
- Protect all routes under `(dashboard)` or `/` except `/login` (and `/forgot-password` if added).

### 2.4 API client structure

- One module per domain: `lib/api/products.ts`, `lib/api/orders.ts`, etc., or a single `lib/api-client.ts` with namespaces.
- Base URL from `NEXT_PUBLIC_API_URL`.
- **Reference:** Use the Postman collection folder names as the source of truth for paths and example bodies.

### 2.5 Progressive delivery rule

For **each module** below:

1. Implement **list** (and filters if API supports them).
2. Implement **detail** where applicable.
3. Implement **create / update / delete** as the API allows.
4. Smoke-test against running backend before moving to the next module.

---

## 3. Module roadmap (implementation order)

Complete modules **in this order** to minimize rework and dependency gaps.

| Phase | Module | Rough dependency |
|-------|--------|------------------|
| A | Foundation & authentication | None |
| B | Dashboard shell & navigation | A |
| C | Categories | A |
| D | Products (catalog) | A, C (for assign category) |
| E | Inventory | A, D (variant/product IDs) |
| F | Customer groups | A |
| G | Customers | A, F (assign group) |
| H | Orders | A |
| I | Promotions | A |
| J | Shipping (admin) | A |
| K | Tax | A |
| L | Payments & operations | A, H (orders) |

---

## Module A — Foundation & authentication

### Purpose

Boot the Next.js app, global styles, API base URL, and **login/logout** so all later modules can call authenticated admin endpoints.

### Backend reference

- `POST /auth/login` — body: `email`, `password`
- `POST /auth/logout` — optional, with Bearer token
- `GET /auth/me` — validate session after login

### Frontend deliverables

- [ ] Next.js app created with TypeScript + Tailwind (or chosen stack).
- [ ] **Login page** (`/login`): form, error states, redirect to dashboard on success.
- [ ] **Auth context or store**: token (or cookie), `login`, `logout`, `isAuthenticated`.
- [ ] **HTTP helper**: injects `Authorization` header when token present.
- [ ] **Route guard**: middleware or layout that redirects unauthenticated users to `/login`.
- [ ] **Logout** control in header.

### Acceptance criteria

- Invalid credentials show backend error message.
- Refreshing the app keeps session (if using cookie) or documents limitation if using memory-only token.
- Calling a protected admin route without token redirects to login.

### Notes

- If backend later adds admin-only roles, gate navigation or API errors with a dedicated “Access denied” page.

---

## Module B — Dashboard shell & navigation

### Purpose

Provide the **persistent admin UI frame**: sidebar, header, active route highlighting, and a simple home/dashboard view.

### Backend reference

- Optional: `GET /` root health — not required for UI.
- Optional v2: aggregate stats endpoints if you add them later.

### Frontend deliverables

- [ ] **App shell layout** (sidebar + main content).
- [ ] **Nav links** to every module route (stub pages with “Coming soon” until that module is built).
- [ ] **Dashboard page** (`/` or `/dashboard`): welcome text, quick links (e.g. “Open orders”, “Low stock” — can be static links to filtered lists in later modules).
- [ ] Responsive behavior: collapsible sidebar on small screens.

### Acceptance criteria

- All module routes are reachable from the nav.
- Layout does not remount unnecessarily when navigating between sections.

---

## Module C — Categories

### Purpose

Manage the **category tree** used by the storefront and product assignments: create, edit, delete, list (including inactive for admin).

### Backend reference

- `GET /admin/categories` — list all (includes inactive per backend behavior)
- `GET /admin/categories/:id`
- `POST /admin/categories` — body: `name`, optional `slug`, `description`, `parentId`, `position`
- `PATCH /admin/categories/:id`
- `DELETE /admin/categories/:id`

### Frontend deliverables

- [ ] **Categories list** table: name, slug, parent, position, active flag, product count (if returned by API).
- [ ] **Create category** form.
- [ ] **Edit category** form.
- [ ] **Delete** with confirmation dialog.
- [ ] Optional: filter by parent / tree view if API supports `tree` on public `GET /categories` for read-only preview (admin uses `/admin/categories` for writes).

### Acceptance criteria

- Creating a category appears in list and can be selected when assigning products (Module D).
- Deleting handles backend errors (e.g. FK constraints) with clear messaging.

### Depends on

- Module A (auth).

---

## Module D — Products (catalog)

### Purpose

Full **product lifecycle**: CRUD, **variants**, **images**, and **category assignment** — the largest admin module.

### Backend reference

- `POST /admin/products` — create product (see Postman “Create product” for body shape).
- `GET /admin/products/:id`
- `PATCH /admin/products/:id`
- `DELETE /admin/products/:id`
- `POST /admin/products/:id/variants` — create variant
- `PATCH /admin/products/variants/:id` — update variant
- `DELETE /admin/products/variants/:id`
- `POST /admin/products/:id/images` — create image
- `PATCH /admin/products/images/:id` — update image
- `DELETE /admin/products/images/:id`
- `POST /admin/products/:id/categories` — body: `categoryId`, optional `position`

### Frontend deliverables

- [ ] **Product list** with search (if you add query params) or client-side filter; link to detail/edit.
- [ ] **Create product** wizard or single long form (status, visibility, pricing, SKU, slug, type, etc.).
- [ ] **Edit product** — same fields as create.
- [ ] **Product detail** page with tabs or sections:
  - [ ] **Variants**: list, add, edit, delete.
  - [ ] **Images**: list, set primary, reorder if API supports, delete.
  - [ ] **Categories**: assign / remove (multi-select against Module C list).
- [ ] **Delete product** with confirmation.

### Acceptance criteria

- A product created in admin appears on storefront `GET /products` when `status`/`visibility` are active.
- Variants and images manageable without leaving the product context.
- Assign category uses real `categoryId` from Module C.

### Depends on

- Module A, B, C.

---

## Module E — Inventory

### Purpose

**Stock visibility and adjustments** per variant (or product for simple SKUs).

### Backend reference

- `GET /admin/inventory/status?variantId=...` — optional `warehouseId`
- `POST /admin/inventory/adjust` — body: `variantId`, `quantity`, `reason`, optional `warehouseId`

### Frontend deliverables

- [ ] **Lookup** by variant ID or SKU (if you add search endpoint later; else paste UUID from product module).
- [ ] **Status display**: available quantity, reserved, warehouse.
- [ ] **Adjust stock** form: positive/negative adjustment with reason.
- [ ] Optional: table of recent adjustments if backend adds history (not required v1).

### Acceptance criteria

- Adjusting stock reflects on next status fetch.
- Invalid variant ID shows clear API error.

### Depends on

- Module A, B, D (to discover variant IDs).

---

## Module F — Customer groups

### Purpose

Manage **groups** used for promotions and shipping rules before assigning customers.

### Backend reference

- `POST /admin/customer-groups`
- `GET /admin/customer-groups`
- `GET /admin/customer-groups/default`
- `GET /admin/customer-groups/:id`
- `PUT /admin/customer-groups/:id`
- `DELETE /admin/customer-groups/:id`

### Frontend deliverables

- [ ] **List** customer groups.
- [ ] **Create / edit / delete** forms.
- [ ] Highlight **default** group from `GET .../default`.

### Acceptance criteria

- Groups available in dropdown on customer edit (Module G).

### Depends on

- Module A, B.

---

## Module G — Customers

### Purpose

**Admin view of customers**: list, detail, update, assign to group, delete (if allowed).

### Backend reference

- `POST /admin/customers`
- `GET /admin/customers`
- `GET /admin/customers/:id`
- `PUT /admin/customers/:id`
- `PUT /admin/customers/:id/assign-group` — body includes `customerGroupId` (confirm DTO in backend)
- `DELETE /admin/customers/:id`

### Frontend deliverables

- [ ] **Customer list** with pagination/search if API supports query params.
- [ ] **Customer detail** page.
- [ ] **Edit customer** form.
- [ ] **Assign to group** (select from Module F).
- [ ] **Delete** with confirmation.

### Acceptance criteria

- Assign group persists and shows on reload.
- List links to orders (Module H) if `customerId` available on orders filter.

### Depends on

- Module A, B, F.

---

## Module H — Orders

### Purpose

**Operational order management**: list, filter, view detail, update status (processing, shipped, etc.).

### Backend reference

- `GET /admin/orders` — query: `page`, `limit`, `status`, `paymentStatus`, `sortBy`, `sortOrder`
- `GET /admin/orders/:id`
- `PUT /admin/orders/:id/status` — body: `status`, `paymentStatus`, `fulfillmentStatus` (align with backend DTO)

### Frontend deliverables

- [ ] **Order list** with filters (status, payment status, date range if API adds it later).
- [ ] **Order detail** page: line items, addresses, totals, customer link to Module G.
- [ ] **Update status** form or inline actions with confirmation.
- [ ] Optional: link to **payments** for that order (`GET /payments/order/:orderId` — may live in Module L).

### Acceptance criteria

- Status changes reflect on refresh and match storefront/order emails if integrated.

### Depends on

- Module A, B. Optional: G for deep linking.

---

## Module I — Promotions

### Purpose

Create and manage **discounts / coupons** (percentage, fixed, scopes, dates).

### Backend reference

- `POST /promotions` — create (see Postman body: `code`, `name`, `type`, `scope`, dates, etc.)
- `GET /promotions`
- `GET /promotions/:id`
- `POST /promotions/:id/validate` — optional tooling for testers
- `GET /promotions/:id/logs` — optional audit view

### Frontend deliverables

- [ ] **Promotion list**.
- [ ] **Create / edit** promotion form (all fields required by backend DTO).
- [ ] **Detail** view with optional **logs** sub-section.
- [ ] Optional: “Test validate” panel calling validate endpoint with `cartId` / `couponCode`.

### Acceptance criteria

- New promotion with `code` works on storefront checkout when rules match.

### Depends on

- Module A, B.

### Notes

- Controllers may live under `/promotions` (not `/admin/promotions`); still treat as admin-only in your app.

---

## Module J — Shipping (admin)

### Purpose

Configure **zones**, **methods**, and links to **orders** / **customer groups** for method eligibility.

### Backend reference

Prefix: **`/admin/shipping`**

- Zones: `POST /admin/shipping/zones`, `GET`, `GET/:id`, `PUT /admin/shipping/zones/:id`, `DELETE ...`
- Methods: `POST /admin/shipping/methods`, `GET /admin/shipping/zones/:zoneId/methods`, `GET /admin/shipping/methods/:id`, `PUT`, `DELETE`
- Orders: `POST /admin/shipping/orders/:orderId/assign`, `PUT /admin/shipping/orders/:orderId/status`
- Customer groups on methods: `POST .../methods/:methodId/customer-groups`, `GET`, `PUT`, `DELETE`

### Frontend deliverables

- [ ] **Zones** CRUD UI.
- [ ] **Methods** per zone: CRUD.
- [ ] **Assign shipping to order** (operational).
- [ ] **Update shipping status** on order.
- [ ] **Method ↔ customer group** association UI.

### Acceptance criteria

- Shipping options on storefront reflect zone/method configuration after cache/session refresh.

### Depends on

- Module A, B, F (customer groups), H (orders).

---

## Module K — Tax

### Purpose

Manage **tax classes** and **tax rates** (jurisdiction rules).

### Backend reference

Prefix: **`/tax`** (no `admin` prefix in current backend — treat as back-office only in your app)

- Tax classes: `POST /tax/classes`, `GET /tax/classes`, `GET /tax/classes/:id`, `PUT`, `DELETE`
- Taxes: `POST /tax/taxes`, `GET /tax/taxes`, `GET /tax/taxes/:id`, `PUT`, `DELETE`

### Frontend deliverables

- [ ] **Tax classes** list + create/edit/delete.
- [ ] **Tax rates** list + create/edit/delete (link to tax class).
- [ ] Forms match backend fields (`country`, `region`, `rate`, `isInclusive`, `isActive`, etc.).

### Acceptance criteria

- New tax class/rate selectable when editing products if backend uses `taxClassId`.

### Depends on

- Module A, B, D (optional linkage in product form).

---

## Module L — Payments & operations

### Purpose

**Payment method visibility**, payment detail, **COD** operational actions, links from orders.

### Backend reference

- `GET /payments/methods`
- `GET /payments/:id`
- `GET /payments/order/:orderId`
- `GET /payments/cod/pending`
- `POST /payments/cod/:paymentId/collect`
- `POST /payments/cod/:paymentId/fail` — body with `reason` if required

### Frontend deliverables

- [ ] **Payment methods** read-only list (for support).
- [ ] **Order payments**: from order detail, list payments for `orderId`.
- [ ] **COD queue**: list pending COD payments; actions collect / fail with confirmation.
- [ ] Optional: payment detail page by `paymentId`.

### Acceptance criteria

- COD collect/fail updates state and matches backend rules.

### Depends on

- Module A, B, H.

---

## 4. Cross-cutting checklist (apply across modules)

- [ ] **Loading states** on all async actions.
- [ ] **Toast or inline errors** for API failures (`message` from NestJS exceptions).
- [ ] **Confirm destructive actions** (delete, status change).
- [ ] **Pagination** consistent with backend `meta.total`, `page`, `limit`, `totalPages`.
- [ ] **README** in admin app: how to run, env vars, default login note, link to this master prompt.
- [ ] **Optional E2E**: smoke login + one CRUD path per critical module.

---

## 5. How to use this file with AI or your team

1. **Paste or attach** `MASTER_PROMPT_ADMIN_NEXTJS.md` at the start of a session: *“We are building the admin app per Option B; implement only Module X.”*
2. **Scope each PR** to one module (or one submodule, e.g. “Module D — variants only”).
3. **Verify** against **Postman** after each module.
4. Update this document if the backend gains new fields or routes so the prompt stays the source of truth.

---

## 6. Summary

| You want | Action |
|----------|--------|
| Separate admin app | New Next.js project; `NEXT_PUBLIC_API_URL` → backend |
| Progressive build | Follow modules **A → L** in order |
| API truth | Postman collection + backend DTOs |
| First milestone | **A + B + C** (login, shell, categories) then **D** (products) |

This file is the **master prompt** for Option B: a **separate Next.js admin application** managing back-office operations **module-wise** against your existing backend.
