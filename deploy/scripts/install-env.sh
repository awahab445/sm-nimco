#!/usr/bin/env bash
# Write production .env files from deploy/env/demo.env
# Usage: bash deploy/scripts/install-env.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEMO_ENV="${REPO_ROOT}/deploy/env/demo.env"

if [[ ! -f "${DEMO_ENV}" ]]; then
  echo "Missing ${DEMO_ENV}. Copy deploy/env/demo.env.example to demo.env and edit."
  exit 1
fi

# shellcheck source=/dev/null
source "${DEMO_ENV}"

required=(SHOP_DOMAIN ADMIN_DOMAIN API_DOMAIN POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET BOOTSTRAP_TOKEN)
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "demo.env: ${var} is required"
    exit 1
  fi
done

if [[ "${JWT_SECRET}" == change-me* ]]; then
  echo "demo.env: set a strong JWT_SECRET before production deploy"
  exit 1
fi

SHOP_URL="https://${SHOP_DOMAIN}"
ADMIN_URL="https://${ADMIN_DOMAIN}"
API_URL="https://${API_DOMAIN}"
ROOT_DOMAIN="${SHOP_DOMAIN#*.}"

cat > "${REPO_ROOT}/backend/.env" <<EOF
NODE_ENV=production
PORT=3000

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"

JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN=7d
BOOTSTRAP_TOKEN="${BOOTSTRAP_TOKEN}"
# Required to save/test SMTP mailboxes in Admin → Mail (Hostinger, etc.)
MAIL_ENCRYPTION_KEY="${MAIL_ENCRYPTION_KEY:-${JWT_SECRET}}"
MAIL_ENABLED=${MAIL_ENABLED:-true}
# Meta Conversions API (optional Direct integration — leave empty until token is ready)
META_CAPI_ACCESS_TOKEN="${META_CAPI_ACCESS_TOKEN:-}"
META_CAPI_TEST_EVENT_CODE="${META_CAPI_TEST_EVENT_CODE:-}"
COOKIE_DOMAIN=.${ROOT_DOMAIN}

CORS_ORIGIN=${SHOP_URL},${ADMIN_URL}
FRONTEND_URL=${SHOP_URL}
APP_URL=${API_URL}
PUBLIC_BASE_URL=${API_URL}

DEFAULT_CURRENCY=${DEFAULT_CURRENCY:-PKR}

REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
EOF

cat > "${REPO_ROOT}/frontend/.env" <<EOF
NEXT_PUBLIC_API_URL=${API_URL}
NEXT_PUBLIC_APP_URL=${SHOP_URL}
NEXT_PUBLIC_CURRENCY=${NEXT_PUBLIC_CURRENCY:-PKR}
NEXT_PUBLIC_STORE_THEME=${NEXT_PUBLIC_STORE_THEME:-mehfil_shereen}
NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_IDENTIFIER=${NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_IDENTIFIER:-home-page-layout}
JWT_SECRET="${JWT_SECRET}"
REVALIDATE_SECRET="${REVALIDATE_SECRET:-${JWT_SECRET}}"
EOF

cat > "${REPO_ROOT}/admin/.env.local" <<EOF
NEXT_PUBLIC_API_URL=${API_URL}
NEXT_PUBLIC_ADMIN_APP_NAME=Ecommerce Admin
JWT_SECRET="${JWT_SECRET}"
EOF

echo "Wrote backend/.env, frontend/.env, admin/.env.local"
