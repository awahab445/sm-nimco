#!/usr/bin/env bash
# Install Nginx site from template and obtain TLS certificates.
# Usage: sudo bash deploy/scripts/configure-nginx.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/scripts/configure-nginx.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEMO_ENV="${REPO_ROOT}/deploy/env/demo.env"
TEMPLATE="${REPO_ROOT}/deploy/nginx/ecommerce-demo.conf.template"
SITE="/etc/nginx/sites-available/ecommerce-demo"

if [[ ! -f "${DEMO_ENV}" ]]; then
  echo "Missing ${DEMO_ENV}"
  exit 1
fi

# shellcheck source=/dev/null
source "${DEMO_ENV}"

for var in SHOP_DOMAIN ADMIN_DOMAIN API_DOMAIN CERTBOT_EMAIL; do
  if [[ -z "${!var:-}" ]]; then
    echo "demo.env: ${var} is required"
    exit 1
  fi
done

HOST_API_PORT="${HOST_API_PORT:-3000}"
HOST_STOREFRONT_PORT="${HOST_STOREFRONT_PORT:-3001}"
HOST_ADMIN_PORT="${HOST_ADMIN_PORT:-3002}"

sed -e "s/SHOP_DOMAIN/${SHOP_DOMAIN}/g" \
    -e "s/ADMIN_DOMAIN/${ADMIN_DOMAIN}/g" \
    -e "s/API_DOMAIN/${API_DOMAIN}/g" \
    -e "s/HOST_API_PORT/${HOST_API_PORT}/g" \
    -e "s/HOST_STOREFRONT_PORT/${HOST_STOREFRONT_PORT}/g" \
    -e "s/HOST_ADMIN_PORT/${HOST_ADMIN_PORT}/g" \
    "${TEMPLATE}" > "${SITE}"

ln -sf "${SITE}" /etc/nginx/sites-enabled/ecommerce-demo
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

certbot --nginx \
  -d "${SHOP_DOMAIN}" \
  -d "${ADMIN_DOMAIN}" \
  -d "${API_DOMAIN}" \
  --non-interactive \
  --agree-tos \
  -m "${CERTBOT_EMAIL}" \
  --redirect

echo "HTTPS enabled for ${SHOP_DOMAIN}, ${ADMIN_DOMAIN}, ${API_DOMAIN}"
