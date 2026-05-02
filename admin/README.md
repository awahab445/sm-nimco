# Ecommerce admin (Next.js)

Standalone admin UI for the ecommerce platform. **Module A** authenticates staff users against **`POST /admin/auth/login`**, **`GET /admin/auth/me`**, **`POST /admin/auth/logout`** (JWT includes `typ: "admin"`). Storefront customers continue to use `/auth/*`.

## Requirements

- **Node.js 20.9+** (matches Next.js 16; older Node is unsupported)
- Running backend API (default `http://localhost:3000`)

## Setup

```bash
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL if your API is not on localhost:3000
npm install
npm run dev
```

The dev server listens on **port 3002** so it can run beside the storefront (typically port 3000 or 3001).

Open [http://localhost:3002](http://localhost:3002). Unauthenticated requests are redirected to `/login`.

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL, no trailing slash (e.g. `http://localhost:3000`) |

## CORS

In **`backend/.env`**, set `CORS_ORIGIN` to a **comma-separated** list of every browser origin that calls the API. For storefront + admin on the default ports:

`CORS_ORIGIN=http://localhost:3001,http://localhost:3002`

If `CORS_ORIGIN` is omitted, the API defaults to both URLs above. **Restart the Nest server** after changing `.env`. A value of only `http://localhost:3001` will block the admin app on port 3002.

## Auth notes

- JWT is stored in **localStorage** and an **`admin-auth-token`** cookie (7-day `max-age`) so refreshes keep the session and middleware can gate routes.
- Create the first staff account after migrate + seed: **`POST /admin/bootstrap/first-user`** with `email`, `password`, optional names. Then sign in via **`POST /admin/auth/login`**. Additional users: **`POST /admin/users`** (requires `admin.users.create`). Roles: **`GET /admin/roles`** (`admin.roles.read`).

## Project layout

- `middleware.ts` — requires `admin-auth-token` for all routes except `/login`
- `lib/auth-token.ts` — token + cookie helpers
- `lib/api-client.ts` — `fetchApi` with `Authorization: Bearer` and 401 → clear session + redirect to login
- `lib/auth.service.ts` / `lib/auth.store.ts` — login, logout, `checkAuth` via `/auth/me`
- `app/login` — sign-in form (backend error message on failure)
- `app/(app)/` — post-login shell (header with **Log out**) and dashboard stub at `/`
