# Demo deployment

Production-style deployment for a **single Ubuntu VPS**: NestJS API + PostgreSQL + Next.js storefront + Next.js admin, behind Nginx with HTTPS.

## Architecture

- `https://shop.<domain>` → Next storefront (`:3001`)
- `https://admin.<domain>` → Next admin (`:3002`)
- `https://api.<domain>` → Nest API + `/uploads` (`:3000`)
- PostgreSQL on localhost (`:5432`)
- Redis **disabled** for demo (`REDIS_ENABLED=false`)

## Quick deploy

1. **[Provision VPS & DNS](./PROVISIONING.md)** — 2 vCPU, 8 GB RAM recommended.
2. Copy env template and edit domains/secrets:
   ```bash
   cp deploy/env/demo.env.example deploy/env/demo.env
   nano deploy/env/demo.env
   ```
3. Install stack (Node 20, PostgreSQL, Nginx, PM2, Certbot):
   ```bash
   sudo bash deploy/scripts/setup-server.sh
   ```
4. Create production env files for each app:
   ```bash
   bash deploy/scripts/install-env.sh
   ```
5. Build apps and start with PM2:
   ```bash
   bash deploy/scripts/deploy.sh
   ```
6. Configure Nginx + TLS:
   ```bash
   sudo bash deploy/scripts/configure-nginx.sh
   ```
7. Bootstrap database (run after `deploy.sh` so API is up for admin user):
   ```bash
   bash deploy/scripts/bootstrap-demo.sh
   ```

## Files

| Path | Purpose |
|------|---------|
| [env/demo.env.example](./env/demo.env.example) | Master domain + secret template |
| [env/*.env.production.example](./env/) | Per-app env templates |
| [pm2/ecosystem.config.cjs](./pm2/ecosystem.config.cjs) | PM2 process definitions |
| [nginx/ecommerce-demo.conf.template](./nginx/ecommerce-demo.conf.template) | Nginx reverse proxy |
| [scripts/setup-server.sh](./scripts/setup-server.sh) | OS packages + PostgreSQL role/DB |
| [scripts/install-env.sh](./scripts/install-env.sh) | Writes `backend/.env`, `frontend/.env`, `admin/.env.local` |
| [scripts/deploy.sh](./scripts/deploy.sh) | `npm ci`, build, `pm2 start` |
| [scripts/configure-nginx.sh](./scripts/configure-nginx.sh) | Nginx site + Certbot |
| [scripts/bootstrap-demo.sh](./scripts/bootstrap-demo.sh) | Migrations, seed, first admin |

## Operations

```bash
# From repo root (ecommerce-platform/)
pm2 status
pm2 logs ecommerce-api
pm2 restart all

# Redeploy after git pull
bash deploy/scripts/deploy.sh
```

## Demo hardening defaults

- `REDIS_ENABLED=false` — in-memory cart/checkout (fine for demo)
- Strong `JWT_SECRET` required when `NODE_ENV=production`
- Persist `backend/uploads/` across deploys if using admin image uploads
- Run `npm run build` in production; never `next dev` on the server

## Docker deployment (recommended for shared VPS)

Run the full stack in Docker — no Node/Postgres/Redis/PM2 on the host. Only **Docker** and **host Nginx** are required.

### Quick deploy

1. Copy env template and edit domains/secrets:
   ```bash
   cp deploy/env/docker.env.example deploy/env/docker.env
   nano deploy/env/docker.env
   ```
2. Build and start (build one service at a time on low-RAM VPS):
   ```bash
   bash deploy/docker/compose.sh build api
   bash deploy/docker/compose.sh build storefront
   bash deploy/docker/compose.sh build admin
   bash deploy/docker/compose.sh up -d
   ```
3. Bootstrap database and admin user:
   ```bash
   bash deploy/docker/bootstrap.sh
   ```
4. Configure host Nginx (HTTP for local `/etc/hosts` testing):
   ```bash
   sudo bash deploy/docker/configure-nginx.sh
   ```
5. Phase 2 HTTPS: update `docker.env` URLs to `https://`, rebuild frontends, run Certbot on host Nginx.

### Docker files

| Path | Purpose |
|------|---------|
| [../docker-compose.prod.yml](../docker-compose.prod.yml) | Production compose stack |
| [env/docker.env.example](./env/docker.env.example) | Single env file for compose |
| [docker/compose.sh](./docker/compose.sh) | Compose wrapper |
| [docker/bootstrap.sh](./docker/bootstrap.sh) | Seed + first admin |
| [docker/configure-nginx.sh](./docker/configure-nginx.sh) | Host Nginx site (HTTP) |
| [docker/entrypoint-api.sh](./docker/entrypoint-api.sh) | API migrations on start |
| [../backend/Dockerfile](../backend/Dockerfile) | NestJS API image |
| [../frontend/Dockerfile](../frontend/Dockerfile) | Storefront image |
| [../admin/Dockerfile](../admin/Dockerfile) | Admin image |
