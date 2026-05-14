#!/usr/bin/env bash
# Build all apps and start/restart PM2 processes.
# Usage: bash deploy/scripts/deploy.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

if [[ ! -f backend/.env ]]; then
  echo "Run deploy/scripts/install-env.sh first"
  exit 1
fi

echo "=== Backend ==="
cd backend
npm ci
npx prisma generate
npm run build
cd "${REPO_ROOT}"

echo "=== Storefront ==="
cd frontend
npm ci
npm run build
cd "${REPO_ROOT}"

echo "=== Admin ==="
cd admin
npm ci
npm run build
cd "${REPO_ROOT}"

if pm2 describe ecommerce-api >/dev/null 2>&1; then
  pm2 reload "${REPO_ROOT}/deploy/pm2/ecosystem.config.cjs" --update-env
else
  pm2 start "${REPO_ROOT}/deploy/pm2/ecosystem.config.cjs"
fi

pm2 save
echo "Run 'pm2 startup' once and execute the printed command to survive reboots."
echo "PM2 processes running. Use: pm2 status"
