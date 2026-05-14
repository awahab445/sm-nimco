#!/usr/bin/env bash
# Install Node 20, PostgreSQL, Nginx, PM2, Certbot on Ubuntu 22.04/24.04.
# Usage: sudo bash deploy/scripts/setup-server.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/scripts/setup-server.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y curl ca-certificates gnupg lsb-release ufw git build-essential

# Node.js 20 LTS
if ! command -v node >/dev/null 2>&1 || [[ "$(node -p "process.versions.node.split('.')[0]")" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Nginx + Certbot
apt-get install -y nginx certbot python3-certbot-nginx

# PM2 (global)
npm install -g pm2

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEMO_ENV="${REPO_ROOT}/deploy/env/demo.env"

if [[ -f "${DEMO_ENV}" ]]; then
  # shellcheck source=/dev/null
  source "${DEMO_ENV}"
  if [[ -n "${POSTGRES_DB:-}" && -n "${POSTGRES_USER:-}" && -n "${POSTGRES_PASSWORD:-}" ]]; then
    sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${POSTGRES_USER}'" | grep -q 1 \
      || sudo -u postgres psql -c "CREATE USER \"${POSTGRES_USER}\" WITH PASSWORD '${POSTGRES_PASSWORD}';"
    sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'" | grep -q 1 \
      || sudo -u postgres psql -c "CREATE DATABASE \"${POSTGRES_DB}\" OWNER \"${POSTGRES_USER}\";"
    echo "PostgreSQL database ${POSTGRES_DB} ready."
  fi
else
  echo "Note: create deploy/env/demo.env from demo.env.example, then re-run or create DB manually."
fi

systemctl enable postgresql nginx
systemctl start postgresql nginx

echo "Setup complete. Node $(node -v), npm $(npm -v)"
echo "Next: bash deploy/scripts/install-env.sh && bash deploy/scripts/deploy.sh"
