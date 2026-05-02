# E2E Tests

End-to-end tests boot the full NestJS application and call real HTTP endpoints.

## Requirements

- **Redis**: Required by default for cart and checkout session storage. Start Redis before running e2e tests, or set `REDIS_ENABLED=false` to use in-memory cart/checkout (no persistence).
- **Database**: Required for app initialization (Prisma, auth, catalog, orders, etc.). Run migrations and optionally seed before e2e.

## Run E2E tests

```bash
# With Redis and DB running (e.g. docker-compose up -d)
npm run test:e2e

# Or with in-memory cart/checkout (no Redis)
REDIS_ENABLED=false npm run test:e2e
```

## Test files

- `app.e2e-spec.ts` – Root route and basic app.
- `cart.e2e-spec.ts` – Cart API: create cart, get cart, 404 for missing cart.
