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
| [scripts/deploy.sh](./scripts/deploy.sh) | `npm ci`, build, `pm2 start`, auto cache flush |
| [scripts/flush-cache.sh](./scripts/flush-cache.sh) | Clears `.next/cache` + POSTs `/api/revalidate` |
| [scripts/configure-nginx.sh](./scripts/configure-nginx.sh) | Nginx site + Certbot |
| [scripts/bootstrap-demo.sh](./scripts/bootstrap-demo.sh) | Migrations, seed, first admin |

## Operations

```bash
# From repo root (ecommerce-platform/)
pm2 status
pm2 logs ecommerce-api
pm2 restart all

# Redeploy after git pull (builds + flushes Next.js ISR automatically)
bash deploy/scripts/deploy.sh

# Manual cache flush only (running storefront)
bash deploy/scripts/flush-cache.sh --runtime
```

## Demo hardening defaults

- `REDIS_ENABLED=false` — in-memory cart/checkout (fine for demo)
- Strong `JWT_SECRET` required when `NODE_ENV=production`
- Persist `backend/uploads/` across deploys if using admin image uploads
- Run `npm run build` in production; never `next dev` on the server

## Docker deployment (recommended for shared VPS)

Run the full stack in Docker — no Node/Postgres/Redis/PM2 on the host. Only **Docker** and **host Nginx** are required.

**Hostinger KVM 2:** see [HOSTINGER.md](./HOSTINGER.md) for the full step-by-step guide.

### Quick deploy

1. Bootstrap VPS (once, as root):
   ```bash
   sudo bash deploy/docker/setup-docker-server.sh
   ```
2. Create env file with secrets:
   ```bash
   bash deploy/docker/init-env.sh
   ```
   If ports **3000–3002** are already used on the host, set `HOST_API_PORT`, `HOST_STOREFRONT_PORT`, and `HOST_ADMIN_PORT` in `docker.env` (defaults: **3100**, **3101**, **3102**).
3. Build, start, bootstrap, and configure Nginx (HTTP):
   ```bash
   bash deploy/docker/deploy.sh
   ```
4. Enable HTTPS:
   ```bash
   sudo bash deploy/docker/enable-https.sh
   ```
5. Optional — daily backups:
   ```bash
   bash deploy/docker/install-backup-cron.sh
   ```

### Docker files

| Path | Purpose |
|------|---------|
| [HOSTINGER.md](./HOSTINGER.md) | Hostinger KVM 2 deployment checklist |
| [../docker-compose.prod.yml](../docker-compose.prod.yml) | Production compose stack |
| [env/docker.env.example](./env/docker.env.example) | Single env file for compose |
| [docker/setup-docker-server.sh](./docker/setup-docker-server.sh) | VPS bootstrap (Docker, Nginx, UFW, swap) |
| [docker/init-env.sh](./docker/init-env.sh) | Create `docker.env` with generated secrets |
| [docker/deploy.sh](./docker/deploy.sh) | Build, up, bootstrap, Nginx HTTP |
| [docker/enable-https.sh](./docker/enable-https.sh) | Certbot + HTTPS rebuild |
| [docker/redeploy.sh](./docker/redeploy.sh) | `git pull` + rebuild |
| [docker/backup.sh](./docker/backup.sh) | DB + uploads backup |
| [docker/compose.sh](./docker/compose.sh) | Compose wrapper |
| [docker/bootstrap.sh](./docker/bootstrap.sh) | Seed + first admin |
| [docker/configure-nginx.sh](./docker/configure-nginx.sh) | Host Nginx site (HTTP) |
| [docker/entrypoint-api.sh](./docker/entrypoint-api.sh) | API migrations on start |
| [../backend/Dockerfile](../backend/Dockerfile) | NestJS API image |
| [../frontend/Dockerfile](../frontend/Dockerfile) | Storefront image |
| [../admin/Dockerfile](../admin/Dockerfile) | Admin image |

See [docker/README.md](./docker/README.md) for operations, backups, and troubleshooting.
