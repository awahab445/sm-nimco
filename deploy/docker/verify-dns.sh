#!/usr/bin/env bash
# Verify DNS A records for shop/admin/api subdomains point to expected IP.
# Usage: bash deploy/docker/verify-dns.sh [expected-ip]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run: bash deploy/docker/init-env.sh"
  exit 1
fi

# shellcheck source=/dev/null
source "${ENV_FILE}"

EXPECTED_IP="${1:-}"
if [[ -z "${EXPECTED_IP}" ]]; then
  EXPECTED_IP="$(curl -4 -sf ifconfig.me 2>/dev/null || curl -4 -sf icanhazip.com 2>/dev/null || true)"
fi

if [[ -z "${EXPECTED_IP}" ]]; then
  echo "Could not detect VPS IP. Pass it as the first argument."
  exit 1
fi

echo "Expected IP: ${EXPECTED_IP}"
echo ""

FAIL=0
for domain in "${SHOP_DOMAIN}" "${ADMIN_DOMAIN}" "${API_DOMAIN}"; do
  RESOLVED="$(dig +short "${domain}" A 2>/dev/null | tail -n1 || true)"
  if [[ "${RESOLVED}" == "${EXPECTED_IP}" ]]; then
    echo "OK  ${domain} → ${RESOLVED}"
  else
    echo "FAIL ${domain} → ${RESOLVED:-<no record>} (expected ${EXPECTED_IP})"
    FAIL=1
  fi
done

if [[ "${FAIL}" -eq 1 ]]; then
  echo ""
  echo "DNS not ready. Create A records for shop, admin, and api pointing to ${EXPECTED_IP}."
  exit 1
fi

echo ""
echo "DNS looks good."
