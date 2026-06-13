#!/usr/bin/env bash
# Install Nginx site for Docker deployment (HTTP). Run Certbot separately for HTTPS.
# Usage: sudo bash deploy/docker/configure-nginx.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/docker/configure-nginx.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"
TEMPLATE="${REPO_ROOT}/deploy/nginx/ecommerce-demo.conf.template"
SITE="/etc/nginx/sites-available/ecommerce-demo"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

# shellcheck source=/dev/null
source "${ENV_FILE}"

for var in SHOP_DOMAIN ADMIN_DOMAIN API_DOMAIN; do
  if [[ -z "${!var:-}" ]]; then
    echo "docker.env: ${var} is required"
    exit 1
  fi
done

HOST_API_PORT="${HOST_API_PORT:-3100}"
HOST_STOREFRONT_PORT="${HOST_STOREFRONT_PORT:-3101}"
HOST_ADMIN_PORT="${HOST_ADMIN_PORT:-3102}"

sed -e "s/SHOP_DOMAIN/${SHOP_DOMAIN}/g" \
    -e "s/ADMIN_DOMAIN/${ADMIN_DOMAIN}/g" \
    -e "s/API_DOMAIN/${API_DOMAIN}/g" \
    -e "s/HOST_API_PORT/${HOST_API_PORT}/g" \
    -e "s/HOST_STOREFRONT_PORT/${HOST_STOREFRONT_PORT}/g" \
    -e "s/HOST_ADMIN_PORT/${HOST_ADMIN_PORT}/g" \
    "${TEMPLATE}" > "${SITE}"

ln -sf "${SITE}" /etc/nginx/sites-enabled/ecommerce-demo

nginx -t
systemctl reload nginx

echo "Nginx configured for ${SHOP_DOMAIN}, ${ADMIN_DOMAIN}, ${API_DOMAIN}"
echo "For HTTPS (Phase 2): sudo certbot --nginx -d ${SHOP_DOMAIN} -d ${ADMIN_DOMAIN} -d ${API_DOMAIN}"
