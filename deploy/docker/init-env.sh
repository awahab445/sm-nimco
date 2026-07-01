#!/usr/bin/env bash
# Create deploy/env/docker.env from template with generated secrets.
# Usage: bash deploy/docker/init-env.sh
#   Or non-interactive: ROOT_DOMAIN=example.com ADMIN_EMAIL=admin@example.com bash deploy/docker/init-env.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
EXAMPLE="${REPO_ROOT}/deploy/env/docker.env.example"
TARGET="${REPO_ROOT}/deploy/env/docker.env"

if [[ -f "${TARGET}" ]]; then
  echo "${TARGET} already exists. Edit it directly or remove it first."
  exit 1
fi

if [[ ! -f "${EXAMPLE}" ]]; then
  echo "Missing ${EXAMPLE}"
  exit 1
fi

read_var() {
  local name="$1"
  local prompt="$2"
  local default="${3:-}"
  local value=""
  if [[ -n "${!name:-}" ]]; then
    return 0
  fi
  if [[ -n "${default}" ]]; then
    read -r -p "${prompt} [${default}]: " value
    value="${value:-${default}}"
  else
    read -r -p "${prompt}: " value
  fi
  printf -v "${name}" '%s' "${value}"
}

read_var ROOT_DOMAIN "Root domain (e.g. example.com)"
read_var ADMIN_EMAIL "Admin email" "admin@${ROOT_DOMAIN}"
read_var CERTBOT_EMAIL "Certbot email" "${ADMIN_EMAIL}"

POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -hex 24)}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
BOOTSTRAP_TOKEN="${BOOTSTRAP_TOKEN:-$(openssl rand -hex 24)}"

if [[ -z "${ADMIN_PASSWORD:-}" ]]; then
  ADMIN_PASSWORD="$(openssl rand -hex 12)"
  echo ""
  echo "Generated ADMIN_PASSWORD: ${ADMIN_PASSWORD}"
  echo "(Save this — you need it to log into the admin panel.)"
  echo ""
fi

SHOP_DOMAIN="shop.${ROOT_DOMAIN}"
ADMIN_DOMAIN="admin.${ROOT_DOMAIN}"
API_DOMAIN="api.${ROOT_DOMAIN}"

cp "${EXAMPLE}" "${TARGET}"

replace() {
  local key="$1"
  local val="$2"
  sed -i "s|^${key}=.*|${key}=${val}|" "${TARGET}"
}

replace SHOP_DOMAIN "${SHOP_DOMAIN}"
replace ADMIN_DOMAIN "${ADMIN_DOMAIN}"
replace API_DOMAIN "${API_DOMAIN}"
replace SHOP_URL "http://${SHOP_DOMAIN}"
replace ADMIN_URL "http://${ADMIN_DOMAIN}"
replace API_URL "http://${API_DOMAIN}"
replace POSTGRES_PASSWORD "${POSTGRES_PASSWORD}"
replace JWT_SECRET "${JWT_SECRET}"
replace BOOTSTRAP_TOKEN "${BOOTSTRAP_TOKEN}"
replace ADMIN_EMAIL "${ADMIN_EMAIL}"
replace ADMIN_PASSWORD "${ADMIN_PASSWORD}"
replace CERTBOT_EMAIL "${CERTBOT_EMAIL}"
replace COOKIE_DOMAIN ""
replace COOKIE_SECURE "false"

echo "Created ${TARGET}"
echo ""
echo "DNS A records required:"
echo "  shop.${ROOT_DOMAIN}  → <VPS-IP>"
echo "  admin.${ROOT_DOMAIN} → <VPS-IP>"
echo "  api.${ROOT_DOMAIN}   → <VPS-IP>"
echo ""
echo "Next: bash deploy/docker/deploy.sh"
