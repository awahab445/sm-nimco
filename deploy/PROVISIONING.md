# VPS provisioning (demo)

Use this checklist before running server setup scripts.

## Recommended instance

| Tier | vCPU | RAM | Disk | Use case |
|------|------|-----|------|----------|
| Minimum | 2 | 4 GB | 40 GB SSD | Smoke test / tiny audience |
| **Recommended** | **2–4** | **8 GB** | **60 GB SSD** | Client demo with admin + storefront |

**OS:** Ubuntu 22.04 or 24.04 LTS (x86_64).

## Provider examples

- [Hetzner Cloud](https://www.hetzner.com/cloud) — CX22 (4 GB) or CPX21 (4 GB, shared)
- [DigitalOcean](https://www.digitalocean.com/) — Basic 4 GB or 8 GB droplet
- [Vultr](https://www.vultr.com/) — 4 GB or 8 GB cloud compute

## Steps

1. Create a VPS in your chosen region (close to your demo audience).
2. Add your SSH public key at create time (password-only login is discouraged).
3. Note the **public IPv4** address.
4. Point DNS **A records** to that IP (replace `yourdomain.com`):

   | Host | Type | Value |
   |------|------|-------|
   | `shop` | A | `<server-ip>` |
   | `admin` | A | `<server-ip>` |
   | `api` | A | `<server-ip>` |

5. Open firewall ports **22** (SSH), **80** (HTTP), **443** (HTTPS). Do **not** expose 3000–3002 publicly; Nginx proxies internally.

6. SSH in as root or a sudo user:
   ```bash
   ssh root@<server-ip>
   ```

7. Clone the repo (or upload via CI) to e.g. `/var/www/ecommerce-platform`.

8. Continue with [README.md](./README.md) → **Quick deploy**.
