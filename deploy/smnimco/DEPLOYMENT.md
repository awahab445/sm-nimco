# SM Nimco — Ubuntu VPS Deployment (Docker + Nginx)

Deploy the **SM Nimco** stack alongside an existing M. Essa Chemicals stack without port conflicts.

| App | Container port | Host bind (`127.0.0.1`) |
|-----|----------------|-------------------------|
| NestJS API | 3000 | **3200** |
| Next.js storefront | 3001 | **3201** |
| Next.js admin | 3002 | **3202** |
| PostgreSQL 16 | 5432 | **5433** |
| Redis 7 | 6379 | **6380** |

M. Essa typically occupies **3100–3102**. Public traffic reaches SM Nimco only via host Nginx on ports 80/443.

**Repo path on server:** `/var/www/smnimco` (separate directory from the M. Essa repo)

**Compose shortcut used below:**

```bash
export SMNIMCO_COMPOSE='docker compose --env-file deploy/smnimco/.env.smnimco -f deploy/smnimco/docker-compose.smnimco.yml'
```

---

## Coexistence rules (do not interrupt M. Essa)

- **Do not** run, edit, restart, or `down` the M. Essa stack (`docker-compose.prod.yml` / `deploy/env/docker.env`).
- **Do not** stop or recreate containers on ports `3100–3102`.
- SM Nimco binds only on `127.0.0.1`: **3200** (API), **3201** (shop), **3202** (admin), **5433** (Postgres), **6380** (Redis).
- Own network/volumes only: `smnimco_net`, `smnimco_pg_data`, `smnimco_uploads`.
- Own Nginx site only: `smnimco.com.conf` — never edit or replace the M. Essa nginx site.
- Always pass **both** `--env-file deploy/smnimco/.env.smnimco` and `-f deploy/smnimco/docker-compose.smnimco.yml` so you never hit the wrong project.
- Prefer `$SMNIMCO_COMPOSE down` (no `-v`) to stop SM Nimco; never wipe volumes unless you intend to delete SM Nimco data only.

---

## a) VPS pre-flight

Confirm Docker, Nginx, and free ports:

```bash
docker --version
docker compose version
nginx -v
ss -tlnp | grep -E ':(3100|3101|3102|3200|3201|3202|5433|6380)\s' || true
```

Expected:

- `3100`–`3102` may already be listening (M. Essa) — that is fine.
- `3200`, `3201`, `3202`, `5433`, `6380` must **not** be in use.

DNS A records (before Certbot):

| Hostname | Points to |
|----------|-----------|
| `smnimco.com` | VPS public IP |
| `www.smnimco.com` | VPS public IP |
| `admin.smnimco.com` | VPS public IP |
| `api.smnimco.com` | VPS public IP |

---

## b) Git clone and directory setup

```bash
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
cd /var/www

# First deploy (keep M. Essa in its own path — do not clone over it)
git clone <YOUR_GIT_REMOTE_URL> smnimco
cd /var/www/smnimco

# Subsequent deploys
cd /var/www/smnimco
git pull --ff-only
```

---

## c) Create `.env.smnimco` and generate secrets

```bash
cd /var/www/smnimco
cp deploy/smnimco/.env.smnimco.example deploy/smnimco/.env.smnimco
chmod 600 deploy/smnimco/.env.smnimco

# Generate and print secrets
openssl rand -hex 16   # → POSTGRES_PASSWORD
openssl rand -hex 32   # → JWT_SECRET
openssl rand -hex 32   # → BOOTSTRAP_TOKEN
openssl rand -hex 32   # → MAIL_ENCRYPTION_KEY
openssl rand -hex 32   # → REVALIDATE_SECRET
```

Edit the env file:

```bash
nano deploy/smnimco/.env.smnimco
```

Replace every `replace-with-...` value. Confirm:

- `SHOP_URL=https://smnimco.com`
- `WWW_URL=https://www.smnimco.com`
- `ADMIN_URL=https://admin.smnimco.com`
- `API_URL=https://api.smnimco.com`
- `HOST_API_PORT=3200`, `HOST_STOREFRONT_PORT=3201`, `HOST_ADMIN_PORT=3202`
- `COOKIE_DOMAIN=.smnimco.com`, `COOKIE_SECURE=true`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` for first admin bootstrap
- `CERTBOT_EMAIL=ops@smnimco.com` (or your ops mailbox)

> **Important:** `NEXT_PUBLIC_*` values are baked into storefront/admin images at **build** time. Changing `API_URL` or `SHOP_URL` later requires `up -d --build` again for those services.

---

## d) Docker Compose build and launch

```bash
cd /var/www/smnimco
export SMNIMCO_COMPOSE='docker compose --env-file deploy/smnimco/.env.smnimco -f deploy/smnimco/docker-compose.smnimco.yml'

$SMNIMCO_COMPOSE up -d --build
$SMNIMCO_COMPOSE ps
$SMNIMCO_COMPOSE logs -f --tail=100 smnimco-api
```

The API entrypoint (`deploy/docker/entrypoint-api.sh`) runs `npx prisma migrate deploy` automatically before `node dist/src/main.js`.

Wait until healthchecks pass:

```bash
$SMNIMCO_COMPOSE ps
# smnimco-postgres / smnimco-redis / smnimco-api / storefront / admin → healthy or running
```

---

## e) Database migration and seeding

Migrations usually already ran via the API entrypoint. Verify and optionally re-run:

```bash
cd /var/www/smnimco
export SMNIMCO_COMPOSE='docker compose --env-file deploy/smnimco/.env.smnimco -f deploy/smnimco/docker-compose.smnimco.yml'

$SMNIMCO_COMPOSE exec smnimco-api npx prisma migrate deploy
```

Seed catalog/demo data (first deploy only; safe to skip if already seeded):

```bash
# Only if SEED_DEMO_DATA=true in .env.smnimco
$SMNIMCO_COMPOSE exec smnimco-api npx prisma db seed
```

Create the first admin user (API must be healthy on host port 3200):

```bash
set -a
source deploy/smnimco/.env.smnimco
set +a

curl -sf -X POST "http://127.0.0.1:${HOST_API_PORT}/admin/bootstrap/first-user" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\",\"bootstrapToken\":\"${BOOTSTRAP_TOKEN}\",\"firstName\":\"${ADMIN_FIRST_NAME}\",\"lastName\":\"${ADMIN_LAST_NAME}\"}" \
  && echo "Admin created: ${ADMIN_EMAIL}"
```

If the endpoint reports the admin already exists, that is expected on redeploy.

---

## f) Nginx symlink and reload

```bash
cd /var/www/smnimco

sudo cp deploy/smnimco/nginx/smnimco.com.conf /etc/nginx/sites-available/smnimco.com.conf
sudo ln -sf /etc/nginx/sites-available/smnimco.com.conf /etc/nginx/sites-enabled/smnimco.com.conf

# Validates all vhosts (including M. Essa). Reload does not stop other sites.
sudo nginx -t
sudo systemctl reload nginx
```

Do **not** remove or overwrite existing M. Essa files under `/etc/nginx/sites-enabled/`.

HTTP smoke (before TLS):

```bash
curl -sI -H "Host: smnimco.com" http://127.0.0.1/ | head -n 5
curl -sI -H "Host: admin.smnimco.com" http://127.0.0.1/ | head -n 5
curl -sI -H "Host: api.smnimco.com" http://127.0.0.1/health | head -n 5
```

---

## g) Certbot SSL

Ensure DNS A records already resolve to this VPS, then:

```bash
set -a
source /var/www/smnimco/deploy/smnimco/.env.smnimco
set +a

sudo certbot --nginx \
  -d smnimco.com \
  -d www.smnimco.com \
  -d admin.smnimco.com \
  -d api.smnimco.com \
  --email "${CERTBOT_EMAIL}" \
  --agree-tos \
  --redirect \
  --non-interactive
```

Certbot rewrites the live Nginx site for HTTPS. Manual commented SSL blocks remain in [`nginx/smnimco.com.conf`](./nginx/smnimco.com.conf) for reference.

Pass **only** SM Nimco hostnames — never M. Essa domains — into this Certbot command.

Renewal dry-run:

```bash
sudo certbot renew --dry-run
```

---

## h) Post-deployment health checks

**Local upstreams (bypass Nginx):**

```bash
curl -sf "http://127.0.0.1:3200/health" && echo " API OK"
curl -sf -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3201/"
curl -sf -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3202/"
```

**Public HTTPS:**

```bash
curl -sf "https://api.smnimco.com/health" && echo " public API OK"
curl -sf -o /dev/null -w "%{http_code}\n" "https://smnimco.com/"
curl -sf -o /dev/null -w "%{http_code}\n" "https://www.smnimco.com/"
curl -sf -o /dev/null -w "%{http_code}\n" "https://admin.smnimco.com/"
```

**Containers and volumes:**

```bash
cd /var/www/smnimco
export SMNIMCO_COMPOSE='docker compose --env-file deploy/smnimco/.env.smnimco -f deploy/smnimco/docker-compose.smnimco.yml'

$SMNIMCO_COMPOSE ps
docker volume ls | grep smnimco
```

**Verify M. Essa was not interrupted:**

```bash
curl -sf "http://127.0.0.1:3100/health" && echo " ESSA_API_OK"
ss -tlnp | grep -E ':(3100|3101|3102)\s' || true
```

**Manual acceptance checklist:**

1. Storefront loads products and mega menu at `https://smnimco.com`
2. Admin login works at `https://admin.smnimco.com`
3. Uploaded images resolve under `https://api.smnimco.com/uploads/...`
4. CORS allows storefront + www + admin (no browser CORS errors on API calls)
5. M. Essa API/shop/admin on `3100–3102` still healthy

---

## What not to do

- Do not change M. Essa `deploy/env/docker.env` or root `docker-compose.prod.yml`.
- Do not reuse M. Essa Postgres/Redis containers or volumes.
- Do not run bare `docker compose down` / `down -v` from the M. Essa directory while deploying SM Nimco.
- Do not bind SM Nimco to `3100–3102` or to `0.0.0.0` on the host.
- Do not replace the shared Nginx install — only add `smnimco.com.conf`.

---

## Redeploy after code changes

```bash
cd /var/www/smnimco
git pull --ff-only
export SMNIMCO_COMPOSE='docker compose --env-file deploy/smnimco/.env.smnimco -f deploy/smnimco/docker-compose.smnimco.yml'

$SMNIMCO_COMPOSE up -d --build
$SMNIMCO_COMPOSE exec smnimco-api npx prisma migrate deploy
$SMNIMCO_COMPOSE ps
```

Do **not** run `down -v` unless you intend to wipe `smnimco_pg_data` and `smnimco_uploads`.

---

## Useful operations

```bash
# Logs
$SMNIMCO_COMPOSE logs -f --tail=200 smnimco-api
$SMNIMCO_COMPOSE logs -f --tail=200 smnimco-storefront

# Restart one service
$SMNIMCO_COMPOSE restart smnimco-api

# Stop stack (keeps volumes)
$SMNIMCO_COMPOSE down
```

---

## Files in this package

| File | Purpose |
|------|---------|
| [`docker-compose.smnimco.yml`](./docker-compose.smnimco.yml) | Isolated compose stack (`smnimco_net`, volumes, healthchecks) |
| [`.env.smnimco.example`](./.env.smnimco.example) | Production env template → copy to `.env.smnimco` |
| [`nginx/smnimco.com.conf`](./nginx/smnimco.com.conf) | Host Nginx reverse proxy + commented Certbot SSL |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | This runbook |
