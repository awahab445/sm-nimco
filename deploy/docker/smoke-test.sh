#!/usr/bin/env bash
# Smoke test storefront, admin, and API after deploy.
# Usage: bash deploy/docker/smoke-test.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

# shellcheck source=/dev/null
source "${ENV_FILE}"

HOST_API_PORT="${HOST_API_PORT:-3100}"
FAIL=0

check() {
  local label="$1"
  local url="$2"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' "${url}" 2>/dev/null || true)"
  code="${code:-000}"
  if [[ "${code}" =~ ^(200|301|302|307|308)$ ]]; then
    echo "OK  ${label} (${code}) ${url}"
  else
    echo "FAIL ${label} (${code}) ${url}"
    FAIL=1
  fi
}

echo "=== Local upstream ==="
check "API health" "http://127.0.0.1:${HOST_API_PORT}/health"

echo ""
echo "=== Public URLs ==="
check "Storefront" "${SHOP_URL}/"
check "Admin" "${ADMIN_URL}/"
check "API health" "${API_URL}/health"

if [[ "${FAIL}" -eq 1 ]]; then
  exit 1
fi

echo ""
echo "Smoke test passed."
