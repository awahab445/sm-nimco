# Ecommerce Platform — Documentation

High-level overview of the monorepo: a full-stack ecommerce solution with a customer storefront, staff admin panel, and REST API.

## What this project is

The platform supports product catalog browsing, cart and checkout, order management, promotions, shipping and tax configuration, CMS-driven homepage and static pages, configurable store navigation with a layered mega menu, and role-based admin access.

## Repository layout

| Directory | Role |
|-----------|------|
| `backend/` | NestJS REST API, Prisma ORM, PostgreSQL |
| `frontend/` | Next.js customer storefront (App Router) |
| `admin/` | Next.js staff admin UI |
| `deploy/` | VPS deployment scripts (Nginx, PM2, env templates) |
| `docs/` | Technical and functional documentation (this folder) |

## Tech stack

| Layer | Technologies |
|-------|----------------|
| API | NestJS 11, TypeScript 5.7, Prisma 6, PostgreSQL |
| Storefront | Next.js 16.1, React 19, Tailwind CSS 4, Zustand |
| Admin | Next.js 16.2, React 19, Tailwind CSS 4, Zustand |
| Auth | JWT (customer + admin), bcrypt |
| Payments | Stripe (configurable in admin), Cash on Delivery |
| Cache / sessions | Redis (optional; `REDIS_ENABLED=false` uses in-memory cart/checkout) |
| Icons | Lucide React (`UserCircle`, `ShoppingBag` in header components) |

## Core features

### Storefront (`frontend/`)

- CMS-driven homepage (hero slider, product shelves, promo blocks, newsletter CTA)
- Product listing page (PLP) with filters, browse tree, and category sidebar
- Product detail pages (PDP) with variants and add-to-cart
- Cart, one-page checkout, order success/failure flows
- Customer registration, login, profile, addresses, order history
- Guest track-order and public order detail by order number
- CMS static pages at `/{slug}` and legacy `/pages/[slug]`
- Admin-configured header navigation and layered mega menu

### Admin (`admin/`)

- Dashboard and permission-gated sidebar navigation
- Products, categories, options, inventory
- Customers and customer groups
- Orders, promotions, shipping, tax, payment methods
- CMS (pages, blocks, banner sliders)
- Store navigation, store filters (PLP)
- Newsletter subscriptions
- Staff users and roles (RBAC)

### API (`backend/`)

Domain modules include: auth, admin (RBAC), catalog, inventory, cart, checkout, order, payment, promotions, shipping, tax, customer, address, CMS, and subscription.

## Local development URLs

| App | Default URL |
|-----|-------------|
| API | http://localhost:3000 |
| Storefront | http://localhost:3001 |
| Admin | http://localhost:3002 |

Set `CORS_ORIGIN` on the backend to include both `http://localhost:3001` and `http://localhost:3002`.

## Documentation index

| Document | Description |
|----------|-------------|
| [Architecture.md](./Architecture.md) | Folder structure, 3-tier architecture, data flow |
| [Technical-Setup.md](./Technical-Setup.md) | Local setup, environment variables, migrations |
| [Navigation-Logic.md](./Navigation-Logic.md) | Store navigation, mega menu, CMS auto-nav |
| [UI-UX-Standards.md](./UI-UX-Standards.md) | Theme colors, typography, header components |
| [Database-Schema.md](./Database-Schema.md) | PostgreSQL tables, RBAC, catalog relationships |
| [Deployment-Guide.md](./Deployment-Guide.md) | VPS deployment using `deploy/` scripts |

## Related resources

- [../README.md](../README.md) — monorepo quick start
- [../deploy/README.md](../deploy/README.md) — production deployment scripts
- [../backend/SETUP.md](../backend/SETUP.md) — backend setup details
- [../backend/postman/](../backend/postman/) — Postman API collection
