# Hostinger KVM 2 deployment guide

Step-by-step guide for deploying this ecommerce platform on a **blank Hostinger KVM 2** VPS (Ubuntu 24.04).

**KVM 2 specs:** 2 vCPU, 8 GB RAM, 100 GB NVMe — matches the project’s recommended tier.

## Architecture

- `https://shop.<domain>` → Next.js storefront
- `https://admin.<domain>` → Next.js admin panel
- `https://api.<domain>` → NestJS API + `/uploads`
- PostgreSQL 16, Redis 7, API, storefront, and admin run in **Docker Compose**
- **Host Nginx** terminates TLS and proxies to localhost ports 3100–3102

## Prerequisites

1. Hostinger KVM 2 VPS with **Ubuntu 24.04 LTS** (no control panel)
2. SSH public key added at VPS creation
3. A domain with DNS access
4. GitHub repo access — see **[GitHub access on the VPS](#github-access-on-the-vps)** below (fixes `Permission denied (publickey)`)

## GitHub access on the VPS

`Permission denied (publickey)` means the **VPS has no SSH key registered with GitHub**. Your laptop may work fine — that does not carry over to the server.

**Use HTTPS (recommended, fastest fix):**

```bash
cd /var/www
git clone https://github.com/awahab445/ecommerce-platform.git ecommerce-platform
```

- **Public repo:** clone works immediately, no login.
- **Private repo:** when prompted:
  - Username: your GitHub username (`awahab445`)
  - Password: a **Personal Access Token** (not your GitHub password)
  - Create one: GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained token** → grant **read** access to `ecommerce-platform`

To avoid typing the token on every `git pull`, cache credentials once:

```bash
git config --global credential.helper store
git pull   # enter username + PAT once; saved in ~/.git-credentials
```

**Alternative — SSH deploy key (good for long-term VPS `git pull`):**

On the **VPS** (as `deploy` user):

```bash
ssh-keygen -t ed25519 -C "hostinger-vps-deploy" -f ~/.ssh/id_ed25519_github -N ""
cat ~/.ssh/id_ed25519_github.pub
```

Copy the printed key → GitHub → **awahab445/ecommerce-platform → Settings → Deploy keys → Add deploy key** (read-only is enough).

Then on the VPS:

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config

ssh -T git@github.com   # should say "Hi awahab445/..."
cd /var/www
git clone git@github.com:awahab445/ecommerce-platform.git ecommerce-platform
```

**Do not** copy your laptop's private key to the VPS — generate a **new** key on the server and add only the `.pub` file to GitHub.

## Step 1 — DNS (before deploy)

In your domain registrar (or Hostinger DNS), create **three A records** pointing to your VPS public IPv4:

| Host | Type | Value |
|------|------|-------|
| `shop` | A | `<VPS-IP>` |
| `admin` | A | `<VPS-IP>` |
| `api` | A | `<VPS-IP>` |

Verify from your laptop or the VPS (after clone):

```bash
bash deploy/docker/verify-dns.sh <VPS-IP>
```

## Step 2 — Hostinger firewall

In **hPanel → VPS → Firewall**, allow inbound:

- **22** (SSH)
- **80** (HTTP)
- **443** (HTTPS)

Do **not** expose ports 3100–3102 publicly.

## Step 3 — Bootstrap the VPS

SSH in as root:

```bash
ssh root@<VPS-IP>
```

Run the server setup script (Docker, Nginx, Certbot, UFW, swap, deploy user).

Use **HTTPS** to clone (works without a VPS SSH key):

```bash
git clone https://github.com/awahab445/ecommerce-platform.git /tmp/ecommerce-platform
cd /tmp/ecommerce-platform
sudo bash deploy/docker/setup-docker-server.sh
```

If the repo is private, use a GitHub PAT when prompted (see [GitHub access](#github-access-on-the-vps)).

Log out and back in as the `deploy` user so the Docker group applies:

```bash
exit
ssh deploy@<VPS-IP>
```

## Step 4 — Clone and configure

```bash
cd /var/www
git clone https://github.com/awahab445/ecommerce-platform.git ecommerce-platform
cd ecommerce-platform
```

For private repos or SSH deploy keys, see [GitHub access](#github-access-on-the-vps).

Create `deploy/env/docker.env` with generated secrets:

```bash
bash deploy/docker/init-env.sh
# Or: ROOT_DOMAIN=yourdomain.com ADMIN_EMAIL=admin@yourdomain.com bash deploy/docker/init-env.sh
```

Save the printed `ADMIN_PASSWORD`.

Optional — generate secrets only:

```bash
bash deploy/docker/generate-secrets.sh
```

## Step 5 — Deploy (HTTP)

```bash
bash deploy/docker/deploy.sh
```

This builds images one at a time, starts containers, seeds the database, creates the first admin, and configures Nginx over HTTP.

Smoke test:

```bash
bash deploy/docker/smoke-test.sh
```

Open in a browser:

- `http://shop.yourdomain.com`
- `http://admin.yourdomain.com`
- `http://api.yourdomain.com/health`

## Step 6 — Enable HTTPS

```bash
sudo bash deploy/docker/enable-https.sh
```

This runs Certbot, updates `docker.env` to `https://` URLs, sets secure cookies, and rebuilds storefront + admin.

Verify TLS renewal:

```bash
sudo certbot renew --dry-run
```

Run smoke test again over HTTPS:

```bash
bash deploy/docker/smoke-test.sh
```

## Step 7 — Backups and operations

### Manual backup

```bash
bash deploy/docker/backup.sh
```

### Daily backup cron (02:30 UTC)

```bash
bash deploy/docker/install-backup-cron.sh
```

### Redeploy after code changes

```bash
bash deploy/docker/redeploy.sh all
# Or rebuild one service: bash deploy/docker/redeploy.sh api
```

### Useful commands

```bash
bash deploy/docker/compose.sh ps
bash deploy/docker/compose.sh logs -f api
df -h
free -h
```

## Complete checklist

| # | Step |
|---|------|
| 1 | Provision KVM 2, Ubuntu 24.04, SSH key |
| 2 | Open firewall 22, 80, 443 in hPanel |
| 3 | DNS A records: shop, admin, api → VPS IP |
| 4 | `sudo bash deploy/docker/setup-docker-server.sh` |
| 5 | Clone repo to `/var/www/ecommerce-platform` |
| 6 | `bash deploy/docker/init-env.sh` |
| 7 | `bash deploy/docker/verify-dns.sh` |
| 8 | `bash deploy/docker/deploy.sh` |
| 9 | `bash deploy/docker/smoke-test.sh` |
| 10 | `sudo bash deploy/docker/enable-https.sh` |
| 11 | `bash deploy/docker/install-backup-cron.sh` |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build OOM on 8 GB RAM | Swap is enabled by setup script; build one service at a time |
| DNS not resolving | Wait for propagation; run `verify-dns.sh` |
| `Permission denied (publickey)` on `git clone` | Use HTTPS URL or add a VPS deploy key — see [GitHub access](#github-access-on-the-vps) |
| Login loop on HTTP | Use `enable-https.sh` or set `COOKIE_SECURE=false` and rebuild frontends |
| CORS errors | `SHOP_URL` / `ADMIN_URL` must match browser URL exactly |
| Port in use | Change `HOST_*_PORT` in `docker.env`, re-run `configure-nginx.sh` |
| Shop/admin OK, API `/health` 404 from nginx | API vhost missing or wrong `API_DOMAIN` — check `grep API_DOMAIN deploy/env/docker.env`, then `sudo bash deploy/docker/configure-nginx.sh`; if HTTPS was enabled, re-run `sudo bash deploy/docker/enable-https.sh` |

See also [docker/README.md](./docker/README.md) and [PROVISIONING.md](./PROVISIONING.md).
