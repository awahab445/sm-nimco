This is the **storefront frontend** for the e-commerce platform (Next.js App Router). It consumes the backend API for products, cart, checkout, orders, auth, addresses, and promotions.

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see `../backend/README.md` or `../backend/SETUP.md`)

### Environment variables

Create a `.env.local` in the frontend root (or copy from `.env.example` if present):

| Variable | Required | Description |
|---------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | No | App URL for links (default `http://localhost:3001`) |
| `NEXT_PUBLIC_CURRENCY` | No | Display currency (e.g. `USD`, `PKR`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For Stripe | Stripe publishable key when using card payments |

### Run the development server

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or the port shown in the terminal). The app expects the backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:3000`).

## Testing

Unit tests use Jest and run in `lib/` only (no Next.js server):

```bash
npm test
npm run test:watch
```

Tests live in `lib/__tests__/`: auth token storage, cart store (Zustand), and config. Node 18+ is recommended; if you see `availableParallelism` errors, the config uses `maxWorkers: 2`.

## Project structure

- `app/` – App Router pages (home, products, cart, checkout, orders, account, auth).
- `components/` – Reusable UI (layout, product cards, checkout, etc.).
- `lib/` – API client (`api-client.ts`), auth token, cart store, config.

## Next steps

See repo root **NEXT_STEPS.md** for testing, Stripe integration, and production checklist.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js deployment](https://nextjs.org/docs/app/building-your-application/deploying)
