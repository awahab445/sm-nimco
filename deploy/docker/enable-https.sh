#!/usr/bin/env bash
# Enable HTTPS: Certbot TLS, update docker.env URLs, rebuild frontends.
# Usage: sudo bash deploy/docker/enable-https.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/docker/enable-https.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"
COMPOSE="${REPO_ROOT}/deploy/docker/compose.sh"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

# shellcheck source=/dev/null
source "${ENV_FILE}"

for var in SHOP_DOMAIN ADMIN_DOMAIN API_DOMAIN CERTBOT_EMAIL; do
  if [[ -z "${!var:-}" ]]; then
    echo "docker.env: ${var} is required"
    exit 1
  fi
done

ROOT_DOMAIN="${SHOP_DOMAIN#shop.}"
if [[ "${ROOT_DOMAIN}" == "${SHOP_DOMAIN}" ]]; then
  echo "SHOP_DOMAIN should be shop.<root-domain>"
  exit 1
fi

echo "=== Certbot TLS ==="
certbot --nginx \
  -d "${SHOP_DOMAIN}" \
  -d "${ADMIN_DOMAIN}" \
  -d "${API_DOMAIN}" \
  --email "${CERTBOT_EMAIL}" \
  --agree-tos \
  --redirect \
  --non-interactive

echo "=== Updating docker.env for HTTPS ==="
HTTPS_SHOP="https://${SHOP_DOMAIN}"
HTTPS_ADMIN="https://${ADMIN_DOMAIN}"
HTTPS_API="https://${API_DOMAIN}"
COOKIE_ROOT=".${ROOT_DOMAIN}"

sed -i "s|^SHOP_URL=.*|SHOP_URL=${HTTPS_SHOP}|" "${ENV_FILE}"
sed -i "s|^ADMIN_URL=.*|ADMIN_URL=${HTTPS_ADMIN}|" "${ENV_FILE}"
sed -i "s|^API_URL=.*|API_URL=${HTTPS_API}|" "${ENV_FILE}"
sed -i "s|^COOKIE_SECURE=.*|COOKIE_SECURE=true|" "${ENV_FILE}"
sed -i "s|^COOKIE_DOMAIN=.*|COOKIE_DOMAIN=${COOKIE_ROOT}|" "${ENV_FILE}"

echo "=== Rebuilding frontends (NEXT_PUBLIC_API_URL is build-time) ==="
DEPLOY_USER="${SUDO_USER:-$(logname 2>/dev/null || echo root)}"
if [[ "${DEPLOY_USER}" != "root" ]]; then
  sudo -u "${DEPLOY_USER}" bash "${COMPOSE}" build storefront
  sudo -u "${DEPLOY_USER}" bash "${COMPOSE}" build admin
  sudo -u "${DEPLOY_USER}" bash "${COMPOSE}" up -d
  sudo -u "${DEPLOY_USER}" bash "${REPO_ROOT}/deploy/scripts/flush-cache.sh" --runtime
else
  bash "${COMPOSE}" build storefront
  bash "${COMPOSE}" build admin
  bash "${COMPOSE}" up -d
  bash "${REPO_ROOT}/deploy/scripts/flush-cache.sh" --runtime
fi

echo ""
echo "=== HTTPS enabled ==="
echo "Storefront: ${HTTPS_SHOP}"
echo "Admin:      ${HTTPS_ADMIN}"
echo "API:        ${HTTPS_API}"
echo ""
echo "Test cert renewal: certbot renew --dry-run"
