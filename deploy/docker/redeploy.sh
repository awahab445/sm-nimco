#!/usr/bin/env bash
# Redeploy after git pull — rebuild changed services and restart.
# Usage: bash deploy/docker/redeploy.sh [api|storefront|admin|all]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE="${REPO_ROOT}/deploy/docker/compose.sh"
TARGET="${1:-all}"

cd "${REPO_ROOT}"

echo "=== git pull ==="
git pull

case "${TARGET}" in
  api)
    bash "${COMPOSE}" build api
    ;;
  storefront)
    bash "${COMPOSE}" build storefront
    ;;
  admin)
    bash "${COMPOSE}" build admin
    ;;
  all)
    bash "${COMPOSE}" build api
    bash "${COMPOSE}" build storefront
    bash "${COMPOSE}" build admin
    ;;
  *)
    echo "Usage: bash deploy/docker/redeploy.sh [api|storefront|admin|all]"
    exit 1
    ;;
esac

bash "${COMPOSE}" up -d
bash "${COMPOSE}" ps

echo "=== Flush storefront ISR after redeploy ==="
bash "${REPO_ROOT}/deploy/scripts/flush-cache.sh" --runtime

echo "Redeploy complete."
