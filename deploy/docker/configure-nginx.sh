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
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo "Nginx configured for ${SHOP_DOMAIN}, ${ADMIN_DOMAIN}, ${API_DOMAIN}"

VERIFY_FAIL=0
verify_vhost() {
  local domain="$1"
  local path="$2"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' -H "Host: ${domain}" "http://127.0.0.1${path}" 2>/dev/null || true)"
  code="${code:-000}"
  if [[ "${code}" =~ ^(200|301|302|307|308)$ ]]; then
    echo "OK  nginx vhost ${domain} (${path}, ${code})"
  else
    echo "FAIL nginx vhost ${domain} (${path}, ${code})"
    VERIFY_FAIL=1
  fi
}

verify_vhost "${SHOP_DOMAIN}" "/"
verify_vhost "${ADMIN_DOMAIN}" "/"
verify_vhost "${API_DOMAIN}" "/health"

if [[ "${VERIFY_FAIL}" -eq 1 ]]; then
  echo ""
  echo "One or more vhosts did not proxy correctly. Check: grep server_name ${SITE}"
  exit 1
fi

echo "For HTTPS (Phase 2): sudo certbot --nginx -d ${SHOP_DOMAIN} -d ${ADMIN_DOMAIN} -d ${API_DOMAIN}"
