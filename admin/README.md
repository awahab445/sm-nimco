# Ecommerce admin (Next.js)

Standalone admin UI for the ecommerce platform. **Module A** provides foundation and authentication against the existing backend (`POST /auth/login`, `GET /auth/me`, `POST /auth/logout`).

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

Ensure the backend allows this origin. For example, if the API reads `CORS_ORIGIN` (comma-separated), include:

`http://localhost:3002`

## Auth notes

- JWT is stored in **localStorage** and an **`admin-auth-token`** cookie (7-day `max-age`) so refreshes keep the session and middleware can gate routes.
- v1 uses the same customer JWT as the storefront until the API adds admin-only roles; navigation or API errors may later be gated with an “Access denied” page.

## Project layout

- `middleware.ts` — requires `admin-auth-token` for all routes except `/login`
- `lib/auth-token.ts` — token + cookie helpers
- `lib/api-client.ts` — `fetchApi` with `Authorization: Bearer` and 401 → clear session + redirect to login
- `lib/auth.service.ts` / `lib/auth.store.ts` — login, logout, `checkAuth` via `/auth/me`
- `app/login` — sign-in form (backend error message on failure)
- `app/(app)/` — post-login shell (header with **Log out**) and dashboard stub at `/`
