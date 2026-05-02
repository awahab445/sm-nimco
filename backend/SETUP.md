# Backend Setup and Run Guide

## Prerequisites

1. **Node.js** (v16 or higher)
   ```bash
   node --version
   npm --version
   ```

2. **PostgreSQL Database**
   - Install PostgreSQL if not already installed
   - Create a database for the application

3. **Environment Variables**
   - Create a `.env` file in the backend directory with:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
     PORT=3000
     JWT_SECRET=lsgAHaDS1bDXF9NWtA8gUUuYIocwQ2+Bz2dJ/EUZSI4=
     JWT_EXPIRES_IN=7d
     ```
   - **JWT (Auth):** `JWT_SECRET` is used to sign tokens (required in production). `JWT_EXPIRES_IN` defaults to `7d` if not set.
   - **CORS:** `CORS_ORIGIN` defaults to `http://localhost:3001` so the frontend can call the API. Set to your frontend URL in production (e.g. `https://yourstore.com`).
   - **Optional for development:** To run without Redis (cart and checkout use in-memory storage):
     ```
     REDIS_ENABLED=false
     ```
     Cart and checkout data will be lost on restart but the app will run without a Redis server.
   - **Optional:** Set `DEFAULT_CURRENCY=PKR` so new carts and shipping options use PKR (e.g. Standard Shipping shows as 99 PKR).
   - **Guest → account:** Set `FRONTEND_URL` (e.g. `http://localhost:3001` or `https://yourstore.com`) so the "create account" email link points to your frontend `/create-password?token=...`. If unset, defaults to `http://localhost:3001`.

## Installation Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Database**
   ```bash
   # Generate Prisma Client (required before first run)
   # On Node 22 use (WASM workaround):
   npm run prisma:generate
   # On Node 20 or older: npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   # OR for development:
   npx prisma migrate dev
   # To reset DB on Node 22: npm run prisma:migrate:reset

   # Seed default shipping method (Standard Shipping, 99 PKR) and COD payment
   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
   # OR: npm run prisma:seed   (if configured)
   ```

3. **Build the Application** (Optional, for production)
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode (Recommended)
```bash
npm run start:dev
```
This will:
- Start the server on port 3000 (or PORT from .env)
- Watch for file changes and auto-reload
- Show detailed error messages

### Production Mode
```bash
# First build
npm run build

# Then start
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## Verify the Application

Once running, you can verify:
- Server is running: `curl http://localhost:3000`
- Check health endpoint (if available)
- API documentation (if Swagger is configured)

**Protected APIs** (require `Authorization: Bearer <access_token>` after login):
- **Auth:** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/logout`
- **Address book:** `GET/POST /addresses`, `GET/PATCH/DELETE /addresses/:id`, `POST /addresses/:id/default-billing`, `POST /addresses/:id/default-shipping`
- **Account:** `GET/PATCH /customers/me`, `GET /orders/my`

## Troubleshooting

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check database credentials

2. **Port Already in Use**
   - Change PORT in .env file
   - Or kill the process using port 3000

3. **Prisma Issues**
   - Run `npm run prisma:generate` (or on Node 20: `npx prisma generate`) so the client exists under `generated/prisma`
   - On Node 22, use the npm scripts that include the WASM workaround
   - Check database migrations status

4. **TypeScript Errors**
   - Run `npm run build` to see all errors
   - Fix compilation errors before running

5. **Running without Redis (development)**
   - Set `REDIS_ENABLED=false` in `.env` to use in-memory storage for cart and checkout.
   - The app will start without connecting to Redis; cart/checkout data is lost on restart.
   - Use Redis in production or when you need persistent cart/checkout sessions.
