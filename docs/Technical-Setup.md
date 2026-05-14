# Technical Setup

Local development setup for the backend API, storefront, and admin panel.

## Prerequisites

| Requirement | Version / notes |
|-------------|----------------|
| Node.js | **20 LTS** recommended (Prisma 6; Node 22 may need WASM workaround for `prisma generate`) |
| npm | Comes with Node |
| PostgreSQL | 14+ (local or Docker) |
| Redis | Optional; set `REDIS_ENABLED=false` to skip |

## Quick start (all apps)

From the `ecommerce-platform/` directory:

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, CORS_ORIGIN

npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

API listens on **http://localhost:3000** (or `PORT` in `.env`).

### 2. Storefront

```bash
cd frontend
# Create .env with at least NEXT_PUBLIC_API_URL (see table below)

npm install
npm run dev
# Default dev port is 3000 unless you set PORT=3001
```

Run with `PORT=3001` or configure your dev script so the storefront uses **http://localhost:3001**.

### 3. Admin

```bash
cd admin
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3000

npm install
npm run dev
```

Admin dev server uses **http://localhost:3002** (`next dev -p 3002` in `package.json`).

### 4. First admin user

After migrations, create the first staff account:

```http
POST http://localhost:3000/admin/bootstrap/first-user
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-secure-password",
  "firstName": "Admin",
  "lastName": "User"
}
```

Then sign in at http://localhost:3002/login.

---

## Environment variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes in production | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `PORT` | No | Default `3000` |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | Yes (multi-app) | Comma-separated origins, e.g. `http://localhost:3001,http://localhost:3002` |
| `FRONTEND_URL` | Recommended | Storefront URL for email links (e.g. create-password) |
| `APP_URL` | Recommended | API public URL |
| `PUBLIC_BASE_URL` | Production | Public API base for upload URL generation |
| `DEFAULT_CURRENCY` | No | e.g. `PKR`, `USD` |
| `REDIS_ENABLED` | No | `false` to use in-memory cart/checkout |
| `REDIS_HOST` | If Redis on | Default `localhost` |
| `REDIS_PORT` | If Redis on | Default `6379` |

### Storefront (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend origin, no trailing slash |
| `NEXT_PUBLIC_APP_URL` | No | Storefront URL (checkout return URLs) |
| `NEXT_PUBLIC_CURRENCY` | No | Display currency |
| `NEXT_PUBLIC_STORE_THEME` | No | e.g. `mehfil_shereen` |
| `NEXT_PUBLIC_STORE_NAME` | No | Header branding |
| `NEXT_PUBLIC_STORE_LOGO` | No | Logo URL or path |
| `NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_IDENTIFIER` | No | CMS block id for homepage layout |
| `NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_PATH` | No | Alternative full CMS path |
| `NEXT_PUBLIC_STOREFRONT_HERO_SLIDER_PATH` | No | Hero slider CMS path |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | If Stripe | Stripe publishable key |

### Admin (`admin/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend origin |
| `NEXT_PUBLIC_ADMIN_APP_NAME` | No | Sidebar title |

---

## Database

### Migrations

Migrations live in `backend/prisma/migrations/`. Apply with:

```bash
cd backend
npx prisma migrate deploy    # production / CI
npx prisma migrate dev         # development (creates new migrations)
```

### Seed

```bash
cd backend
npm run prisma:seed
```

Seed data includes default shipping (Standard Shipping), COD payment method, sample catalog/nav data (see `prisma/seed.ts`).

### Prisma client

After schema changes:

```bash
npm run prisma:generate
```

On Node 22, use the script in `package.json` if plain `npx prisma generate` fails (see `backend/SETUP.md`).

### Studio (optional)

```bash
npx prisma studio
```

---

## Production build (local test)

```bash
# Backend
cd backend && npm run build && npm run start:prod

# Storefront
cd frontend && npm run build && PORT=3001 npm run start

# Admin
cd admin && npm run build && PORT=3002 npm run start
```

---

## Frontend tooling notes

`frontend/next.config.ts` sets `turbopack.root` to the frontend directory. This avoids Next.js picking the wrong workspace root when multiple `package-lock.json` files exist on the machine.

If you see Turbopack errors such as **module factory is not available**:

1. Stop the dev server.
2. Delete `frontend/.next`.
3. Restart `npm run dev`.

---

## Common issues

| Problem | Fix |
|---------|-----|
| CORS errors in browser | Add exact storefront and admin origins to `CORS_ORIGIN` (no trailing slash) |
| `JWT_SECRET must be set in production` | Set a long random `JWT_SECRET` when `NODE_ENV=production` |
| Cart empty after API restart | Expected when `REDIS_ENABLED=false`; enable Redis for persistence |
| Images 404 | Ensure API is running and URLs use `NEXT_PUBLIC_API_URL` + `/uploads/...` |
| Admin 401 | Bootstrap first user; check cookie `admin-auth-token` and API URL |
| Prisma P2021 | Run pending migrations: `npx prisma migrate deploy` |

---

## API exploration

Import `backend/postman/Ecommerce-Platform-API.postman_collection.json` into Postman for endpoint reference.

## Next steps

- [Architecture.md](./Architecture.md) — system design
- [Deployment-Guide.md](./Deployment-Guide.md) — VPS production deploy
