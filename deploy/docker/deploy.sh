#!/usr/bin/env bash
# Build, start, bootstrap, and configure Nginx (HTTP) for Docker deployment.
# Usage: bash deploy/docker/deploy.sh [--skip-bootstrap] [--skip-nginx]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"
COMPOSE="${REPO_ROOT}/deploy/docker/compose.sh"

SKIP_BOOTSTRAP_FLAG=false
SKIP_NGINX=false

for arg in "$@"; do
  case "${arg}" in
    --skip-bootstrap) SKIP_BOOTSTRAP_FLAG=true ;;
    --skip-nginx) SKIP_NGINX=true ;;
    -h|--help)
      echo "Usage: bash deploy/docker/deploy.sh [--skip-bootstrap] [--skip-nginx]"
      exit 0
      ;;
    *)
      echo "Unknown option: ${arg}"
      exit 1
      ;;
  esac
done

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  echo "Run: bash deploy/docker/init-env.sh"
  exit 1
fi

# shellcheck source=/dev/null
source "${ENV_FILE}"

if [[ "${JWT_SECRET:-}" == change-me* ]] || [[ "${POSTGRES_PASSWORD:-}" == change-me* ]]; then
  echo "Update secrets in ${ENV_FILE} before deploying."
  exit 1
fi

cd "${REPO_ROOT}"

echo "=== Building images (one at a time for low-RAM VPS) ==="
bash "${COMPOSE}" build api
bash "${COMPOSE}" build storefront
bash "${COMPOSE}" build admin

echo "=== Starting containers ==="
bash "${COMPOSE}" up -d

HOST_API_PORT="${HOST_API_PORT:-3100}"
API_HEALTH_URL="http://127.0.0.1:${HOST_API_PORT}/health"

echo "=== Waiting for API health ==="
for i in $(seq 1 60); do
  if curl -sf "${API_HEALTH_URL}" >/dev/null 2>&1; then
    echo "API healthy at ${API_HEALTH_URL}"
    break
  fi
  if [[ "${i}" -eq 60 ]]; then
    echo "API not responding. Check: bash deploy/docker/compose.sh logs api"
    exit 1
  fi
  sleep 3
done

DO_BOOTSTRAP=true
if [[ "${SKIP_BOOTSTRAP_FLAG}" == true || "${SKIP_BOOTSTRAP:-}" == "true" ]]; then
  DO_BOOTSTRAP=false
fi

if [[ "${DO_BOOTSTRAP}" == true ]]; then
  echo "=== Bootstrap (seed + first admin) ==="
  bash "${SCRIPT_DIR}/bootstrap.sh"
fi

if [[ "${SKIP_NGINX}" == false ]]; then
  echo "=== Nginx (HTTP) ==="
  if [[ "${EUID}" -eq 0 ]]; then
    bash "${SCRIPT_DIR}/configure-nginx.sh"
  else
    sudo bash "${SCRIPT_DIR}/configure-nginx.sh"
  fi
fi

echo ""
echo "=== Deploy complete (HTTP) ==="
echo "Storefront: ${SHOP_URL}"
echo "Admin:      ${ADMIN_URL}"
echo "API health: ${API_URL}/health"
echo ""
echo "Verify DNS:  bash deploy/docker/verify-dns.sh"
echo "Enable HTTPS: sudo bash deploy/docker/enable-https.sh"
