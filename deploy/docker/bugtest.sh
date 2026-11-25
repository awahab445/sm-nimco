#!/usr/bin/env bash
# Throwaway Docker stack (postgres + redis + api) for verifying bug fixes.
# Isolated from real data: own compose project, own volumes, ports 3200, mail off,
# no payment/courier/AI keys. WhatsApp has no session, so it never sends messages.
#
# Usage:
#   bash deploy/docker/bugtest.sh up      # build API from working tree, start, create admin
#   bash deploy/docker/bugtest.sh run <script.mjs>   # run a verify script against it
#   bash deploy/docker/bugtest.sh logs    # API logs
#   bash deploy/docker/bugtest.sh down    # remove containers, volumes and image
#
# Admin: admin@bugtest.dev / admin123456   API: http://127.0.0.1:3200
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${TMPDIR:-/tmp}/ecommerce-bugtest.env"
API="http://127.0.0.1:3200"
ADMIN_EMAIL="admin@bugtest.dev"
ADMIN_PASSWORD="admin123456"

# Container names are fixed in docker-compose.prod.yml, so this cannot run beside a local prod-compose stack.
COMPOSE=(docker compose -p ecommerce-bugtest --env-file "${ENV_FILE}" -f "${REPO_ROOT}/docker-compose.prod.yml")

write_env() {
  sed -e 's/^HOST_API_PORT=.*/HOST_API_PORT=3200/' \
      -e 's/^HOST_STOREFRONT_PORT=.*/HOST_STOREFRONT_PORT=3201/' \
      -e 's/^HOST_ADMIN_PORT=.*/HOST_ADMIN_PORT=3202/' \
      -e 's#^API_URL=.*#API_URL=http://localhost:3200#' \
      -e 's#^SHOP_URL=.*#SHOP_URL=http://localhost:3201#' \
      -e 's#^ADMIN_URL=.*#ADMIN_URL=http://localhost:3202#' \
      -e 's/^MAIL_ENABLED=.*/MAIL_ENABLED=false/' \
      "${REPO_ROOT}/deploy/env/docker.env.local.example" > "${ENV_FILE}"
  printf 'BLOG_AI_PROVIDER=gemini\nGEMINI_API_KEY=\nWHATSAPP_AUTOMATION_CUTOFF_DATE=\n' >> "${ENV_FILE}"
}

case "${1:-}" in
  up)
    write_env
    "${COMPOSE[@]}" build api
    "${COMPOSE[@]}" up -d postgres redis api
    for i in $(seq 1 60); do
      curl -sf "${API}/health" >/dev/null && break
      [[ "$i" -eq 60 ]] && { echo "API not healthy"; "${COMPOSE[@]}" logs --tail 50 api; exit 1; }
      sleep 2
    done
    curl -s -X POST "${API}/admin/bootstrap/first-user" -H "Content-Type: application/json" \
      -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\",\"bootstrapToken\":\"local-dev-bootstrap-token\",\"firstName\":\"Bug\",\"lastName\":\"Test\"}" \
      >/dev/null || true
    echo "Bugtest API ready: ${API}  (admin ${ADMIN_EMAIL} / ${ADMIN_PASSWORD})"
    ;;
  run)
    [[ -n "${2:-}" ]] || { echo "Usage: $0 run <script.mjs>"; exit 1; }
    API="${API}" ADMIN_EMAIL="${ADMIN_EMAIL}" ADMIN_PASSWORD="${ADMIN_PASSWORD}" node "$2"
    ;;
  logs)
    "${COMPOSE[@]}" logs --tail "${2:-200}" api
    ;;
  down)
    [[ -f "${ENV_FILE}" ]] || write_env
    "${COMPOSE[@]}" down -v --rmi local
    ;;
  *)
    sed -n '2,12p' "$0"
    exit 1
    ;;
esac
