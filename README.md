# Ecommerce platform

Monorepo: **backend** (NestJS + Prisma), **frontend** (Next.js storefront), **admin** (Next.js admin UI).

**Documentation:** [docs/README.md](./docs/README.md)

## Quick start

1. **Backend:** copy `backend/.env.example` to `backend/.env`, run migrations and `npm run start:dev` (see `backend/README.md` if present).
2. **Frontend:** `cd frontend && cp .env.local.example .env.local` (if you add one) or set `NEXT_PUBLIC_API_URL`, then `npm run dev`.
3. **Admin:** `cd admin && cp .env.local.example .env.local`, then `npm run dev` (default port **3002**).

Set `CORS_ORIGIN` on the API to include every web origin you use (e.g. `http://localhost:3001`, `http://localhost:3002`).

## Demo deployment (live VPS)

See **[deploy/README.md](./deploy/README.md)** for minimum server specs, Nginx + HTTPS, PM2, and production env setup.

## Repository layout

| Directory   | Role                          |
|------------|---------------------------------|
| `backend/` | REST API, auth, catalog, orders |
| `frontend/` | Customer storefront          |
| `admin/`   | Staff admin (Module A+ auth)   |
