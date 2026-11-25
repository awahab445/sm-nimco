# Docker deployment (VPS)

Docker Compose runs the full stack on the **VPS**: Postgres, Redis, API, storefront, and admin.

**Hostinger KVM 2:** see [HOSTINGER.md](../HOSTINGER.md) for the full checklist.

**Local development** uses host Node.js + host PostgreSQL (`npm run dev`) — not Docker. See [Database sync](#database-sync-vps--local-dev) below.

## One-command VPS deploy (after setup)

```bash
# 1. Bootstrap VPS (once, as root)
sudo bash deploy/docker/setup-docker-server.sh

# 2. Configure env (once)
bash deploy/docker/init-env.sh

# 3. Build, start, bootstrap, Nginx HTTP
bash deploy/docker/deploy.sh

# 4. HTTPS
sudo bash deploy/docker/enable-https.sh
```

## VPS deploy (manual steps)

1. Copy env and edit domains/secrets:
   ```bash
   cp deploy/env/docker.env.example deploy/env/docker.env
   nano deploy/env/docker.env
   ```
   Or use the helper:
   ```bash
   bash deploy/docker/init-env.sh
   ```
   If ports **3000–3002** are taken on the host, set `HOST_API_PORT`, `HOST_STOREFRONT_PORT`, `HOST_ADMIN_PORT` (defaults **3100–3102**).

2. Verify DNS:
   ```bash
   bash deploy/docker/verify-dns.sh <VPS-IP>
   ```

3. Build and start (one service at a time on low-RAM VPS):
   ```bash
   bash deploy/docker/compose.sh build api
   bash deploy/docker/compose.sh build storefront
   bash deploy/docker/compose.sh build admin
   bash deploy/docker/compose.sh up -d
   ```

4. First run only:
   ```bash
   bash deploy/docker/bootstrap.sh
   ```

5. Nginx (HTTP then HTTPS):
   ```bash
   sudo bash deploy/docker/configure-nginx.sh
   sudo bash deploy/docker/enable-https.sh
   ```

6. Smoke test:
   ```bash
   bash deploy/docker/smoke-test.sh
   ```

## Scripts

| Script | Where | Purpose |
|--------|-------|---------|
| `setup-docker-server.sh` | VPS (root) | Docker, Nginx, Certbot, UFW, swap, deploy user |
| `init-env.sh` | VPS | Create `docker.env` with secrets |
| `generate-secrets.sh` | Any | Print JWT/DB/bootstrap secrets |
| `verify-dns.sh` | VPS | Check shop/admin/api A records |
| `deploy.sh` | VPS | Build, up, bootstrap, Nginx HTTP |
| `enable-https.sh` | VPS (root) | Certbot + HTTPS env + rebuild frontends |
| `smoke-test.sh` | VPS | HTTP health checks |
| `compose.sh` | VPS | Docker Compose wrapper |
| `bootstrap.sh` | VPS | Seed + first admin (empty DB only) |
| `configure-nginx.sh` | VPS (root) | Nginx reverse proxy |
| `backup.sh` | VPS | DB dump + uploads archive |
| `install-backup-cron.sh` | VPS | Daily backup cron |
| `redeploy.sh` | VPS | `git pull` + rebuild + restart |
| `export-db.sh` | VPS | Dump Docker Postgres |
| `restore-db.sh` | VPS | Restore dump into Docker Postgres |
| `restore-to-host.sh` | Local | Restore dump into host Postgres |
| `export-from-host.sh` | Local | Export host Postgres + uploads for VPS |
| `push-local-to-vps.sh` | Local | Export, upload, restore, sanitize URLs on VPS |
| `sanitize-prod-urls.sh` | VPS | Rewrite localhost image/link URLs to production |
| `restore-uploads.sh` | VPS | Fix / re-import image files into Docker volume |
| `push-uploads-to-vps.sh` | Local | Upload only `backend/uploads` to VPS |

## Operations

### Redeploy after `git pull`

```bash
bash deploy/docker/redeploy.sh all
```

### Backups

```bash
bash deploy/docker/backup.sh
bash deploy/docker/install-backup-cron.sh   # daily 02:30 UTC
```

`backup.sh` writes the DB dump, the uploads archive and the WhatsApp session (`ecommerce-*-whatsapp.tar.gz`) to `backups/` with owner-only permissions. It deletes its own files older than `BACKUP_RETENTION_DAYS` (default 14).

Backups on the same VPS are lost with the VPS, so copy them off-server daily. For example, with [rclone](https://rclone.org) set up once with `rclone config` as remote `offsite` (Google Drive, S3, Backblaze B2…), add this cron line after the backup one:

```bash
0 3 * * * rclone copy /var/www/ecommerce-platform/backups offsite:ecommerce-backups --include 'ecommerce-*' --max-age 48h
```

The WhatsApp archive contains the logged-in session, and the DB dump contains customer data: keep the remote private.

### Security checklist (VPS)

The repo already handles: services bound to `127.0.0.1` only, UFW (SSH + Nginx), helmet, CORS, DTO whitelisting, rate limiting by real client IP (`trust proxy` for loopback and private hops), 5/min caps on login, signup and password endpoints, Secure cookies, and HSTS plus `server_tokens off` in the Nginx template.

Run these on the server once:

1. **SSH keys only.** Add your key to the deploy user, test a new login, then in `/etc/ssh/sshd_config` set `PasswordAuthentication no` and `PermitRootLogin no`, and run `sudo systemctl reload ssh`. Keep the current session open until the new login works.
2. **fail2ban:** `sudo apt install -y fail2ban` (bans IPs that brute-force SSH).
3. **Security updates:** `sudo apt install -y unattended-upgrades && sudo dpkg-reconfigure -plow unattended-upgrades`.
4. **Ports:**
   - `sudo ufw status` should allow only 22, 80 and 443.
   - `sudo ss -tlnp` should show 3100–3102 only on `127.0.0.1`.
   - Docker bypasses UFW for published ports, so never publish on `0.0.0.0`.
5. **Secrets:**
   - `chmod 600 deploy/env/*.env backend/.env`.
   - `grep COOKIE_SECURE deploy/env/docker.env` should be `true` once HTTPS is on.
   - Rotate any token or password that was ever shared or committed.
6. **Docker log size:**
   - In `/etc/docker/daemon.json` set `{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}`.
   - Then `sudo systemctl restart docker` and `bash deploy/docker/compose.sh up -d`.
7. **Nginx changes:**
   - After pulling template changes, run `configure-nginx.sh` and then `enable-https.sh` (certbot re-adds the 443 blocks).
   - `sudo nginx -t && sudo systemctl reload nginx`.
   - `curl -sI https://<shop>` should show `Strict-Transport-Security` and no nginx version.
8. **Admin hygiene:** one account per staff member, the smallest RBAC role that works, and remove leavers.
9. **Monitoring:** an uptime check (e.g. UptimeRobot) on the shop and the API, plus `bash deploy/docker/doctor.sh` after deploys.
10. **Cloudflare (optional):**
    - If you proxy through Cloudflare, add `set_real_ip_from` for Cloudflare's ranges and `real_ip_header CF-Connecting-IP;` in Nginx. Otherwise rate limits see Cloudflare's IPs instead of visitors.
    - Then allow 80/443 only from Cloudflare.

### Container management

```bash
bash deploy/docker/compose.sh ps
bash deploy/docker/compose.sh logs -f api
bash deploy/docker/compose.sh down          # stop (data in volumes)
bash deploy/docker/compose.sh down -v       # wipe DB/uploads volumes
bash deploy/docker/compose.sh build api && bash deploy/docker/compose.sh up -d
```

After changing `SHOP_URL` / `API_URL` in `docker.env`, rebuild **storefront** and **admin**.

## Database sync (VPS ↔ local dev)

### Backup on VPS

SSH to the server:

```bash
ssh user@<VPS-IP>
cd /var/www/ecommerce-platform

bash deploy/docker/backup.sh
```

Download to your machine:

```bash
scp user@<VPS-IP>:/var/www/ecommerce-platform/backups/ecommerce-*.dump ./backups/
scp user@<VPS-IP>:/var/www/ecommerce-platform/backups/ecommerce-*-uploads.tar.gz ./backups/
```

### Restore on local machine (host Postgres)

For manual dev (`backend/.env` → `ecommerce_platform` on localhost):

```bash
cd /var/www/html/ecommerce-platform

bash deploy/docker/restore-to-host.sh backups/ecommerce-20260615-120000.dump

cd backend && npx prisma migrate deploy
```

Start apps as usual:

```bash
# backend: npm run start:dev
# frontend: npm run dev
# admin: npm run dev
```

Use admin credentials from the **VPS/restored** database.

### Push local DB to VPS (products, admin data, images)

**Warning:** This **replaces** the VPS database and uploads with your local copy.

On your **laptop** (local Postgres running, `backend/.env` configured):

```bash
cd /var/www/html/ecommerce-platform

# One command: export → scp → restore → sanitize URLs
bash deploy/docker/push-local-to-vps.sh deploy@<VPS-IP>
```

Or step by step:

```bash
# 1. Export local DB + uploads
bash deploy/docker/export-from-host.sh

# 2. Upload
scp backups/local-to-vps-*.dump deploy@<VPS-IP>:/var/www/ecommerce-platform/backups/
scp backups/local-to-vps-*-uploads.tar.gz deploy@<VPS-IP>:/var/www/ecommerce-platform/backups/

# 3. On VPS
ssh deploy@<VPS-IP>
cd /var/www/ecommerce-platform
bash deploy/docker/compose.sh up -d postgres redis
bash deploy/docker/restore-db.sh backups/local-to-vps-YYYYMMDD-HHMMSS.dump
bash deploy/docker/sanitize-prod-urls.sh
```

`sanitize-prod-urls.sh` rewrites `localhost:3000/3001` image and link URLs to your production `API_URL` / `SHOP_URL` from `docker.env`.

After restore, log in with your **local admin credentials**. Re-check **Payment settings** in admin (Stripe keys are environment-specific).


## Troubleshooting (VPS)

| Issue | Fix |
|-------|-----|
| Port already allocated | Change `HOST_*_PORT` in `docker.env`, update Nginx |
| Login loop on HTTP | `COOKIE_SECURE=false`, rebuild admin/storefront |
| API P1000 auth failed | `POSTGRES_PASSWORD` in `docker.env` must match the Postgres volume; use `compose.sh down -v` only if you can wipe data |
| CORS errors | `SHOP_URL` / `ADMIN_URL` must match browser origins exactly |
| Build OOM | Ensure swap is enabled (`setup-docker-server.sh`); build one service at a time |
| `/uploads/...` 404 on API | Image files missing from Docker volume — run `restore-uploads.sh` or `push-uploads-to-vps.sh` |
| P3009 failed migration / API boot loop | The API entrypoint stops on any `migrate deploy` failure (it never falls back to `db push --accept-data-loss`; only an empty database is created with `db push`). Check `compose.sh logs api`, take a DB backup, then `bash deploy/docker/fix-migration-history.sh` (it runs `db push --accept-data-loss`) and `compose.sh up -d api` |
