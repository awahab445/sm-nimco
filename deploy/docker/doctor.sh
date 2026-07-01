#!/usr/bin/env bash
# Diagnose 502 / API connectivity on VPS.
# Usage: bash deploy/docker/doctor.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"
COMPOSE="${SCRIPT_DIR}/compose.sh"

FAIL=0

warn() { echo "FAIL $*"; FAIL=1; }
ok() { echo "OK   $*"; }

echo "=== Docker containers ==="
if bash "${COMPOSE}" ps 2>/dev/null; then
  :
else
  warn "compose ps failed — is docker.env present?"
fi

echo ""
echo "=== docker.env ports ==="
if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  HOST_API_PORT="${HOST_API_PORT:-3100}"
  HOST_STOREFRONT_PORT="${HOST_STOREFRONT_PORT:-3101}"
  HOST_ADMIN_PORT="${HOST_ADMIN_PORT:-3102}"
  echo "API_URL=${API_URL:-<unset>}"
  echo "HOST_API_PORT=${HOST_API_PORT}"
else
  warn "Missing ${ENV_FILE}"
  HOST_API_PORT=3100
fi

echo ""
echo "=== Local upstream health ==="
check_upstream() {
  local label="$1" port="$2" path="$3"
  local code
  code="$(curl -sf -o /dev/null -w '%{http_code}' "http://127.0.0.1:${port}${path}" 2>/dev/null || echo "000")"
  if [[ "${code}" =~ ^(200|301|302|307|308)$ ]]; then
    ok "${label} http://127.0.0.1:${port}${path} → ${code}"
  else
    warn "${label} http://127.0.0.1:${port}${path} → ${code}"
  fi
}

check_upstream "API" "${HOST_API_PORT}" "/health"
check_upstream "Storefront" "${HOST_STOREFRONT_PORT:-3101}" "/"
check_upstream "Admin" "${HOST_ADMIN_PORT:-3102}" "/"

echo ""
echo "=== API container state ==="
if docker inspect ecommerce-api >/dev/null 2>&1; then
  status="$(docker inspect ecommerce-api --format '{{.State.Status}}')"
  restarts="$(docker inspect ecommerce-api --format '{{.RestartCount}}')"
  echo "status=${status} restartCount=${restarts}"
  if [[ "${status}" != "running" ]] || [[ "${restarts}" -gt 3 ]]; then
    warn "API container unstable (status=${status}, restarts=${restarts})"
  else
    ok "API container running"
  fi
  echo ""
  echo "=== Inside container (port 3000) ==="
  if docker exec ecommerce-api node -e "fetch('http://127.0.0.1:3000/health').then(async r=>{console.log(await r.text());process.exit(r.ok?0:1)}).catch(()=>process.exit(1))" 2>/dev/null; then
    echo ""
    ok "API responds inside container"
  else
    warn "API not responding inside container — still starting or crashed"
  fi
else
  warn "ecommerce-api container not found"
fi

echo ""
echo "=== API container logs (last 40 lines) ==="
docker logs ecommerce-api --tail 40 2>&1 || warn "Cannot read ecommerce-api logs"

echo ""
echo "=== Nginx ==="
if command -v nginx >/dev/null 2>&1; then
  if sudo nginx -t 2>&1; then
    ok "nginx config syntax"
  else
    warn "nginx config invalid"
  fi
  if [[ -f /etc/nginx/sites-enabled/ecommerce-demo ]]; then
    if grep -q "HOST_API_PORT\|3100" /etc/nginx/sites-enabled/ecommerce-demo 2>/dev/null; then
      warn "Nginx site still has unreplaced HOST_* placeholders — run: sudo bash deploy/docker/configure-nginx.sh"
    else
      ok "nginx site template rendered"
    fi
  else
    warn "Nginx site /etc/nginx/sites-enabled/ecommerce-demo missing"
  fi
else
  echo "nginx not installed on host"
fi

echo ""
if [[ "${FAIL}" -eq 1 ]]; then
  echo "Issues found. Common fixes:"
  echo "  bash deploy/docker/compose.sh up -d"
  echo "  bash deploy/docker/compose.sh logs -f api"
  echo "  sudo bash deploy/docker/configure-nginx.sh"
  exit 1
fi

echo "All checks passed."
