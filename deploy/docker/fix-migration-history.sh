#!/usr/bin/env bash
# Fix Prisma P3009 after DB restore: failed/orphan migration records block API boot.
#
# Typical VPS error:
#   P3009: The `20250308000000_add_customer_password_hash` migration failed
#
# Usage: bash deploy/docker/fix-migration-history.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"
COMPOSE=(bash "${SCRIPT_DIR}/compose.sh")
MIGRATIONS_DIR="${REPO_ROOT}/backend/prisma/migrations"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
fi

POSTGRES_USER="${POSTGRES_USER:-ecommerce}"
POSTGRES_DB="${POSTGRES_DB:-ecommerce}"

prisma_cmd() {
  "${COMPOSE[@]}" run --rm --no-deps --entrypoint "" api npx prisma "$@"
}

psql_cmd() {
  docker exec ecommerce-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" "$@"
}

echo "=== Current migration status ==="
psql_cmd -c \
  "SELECT migration_name, started_at, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at;" \
  2>/dev/null || prisma_cmd migrate status || true

echo ""
echo "=== Step 1: Resolve failed migrations (P3009) ==="
FAILED="$(
  psql_cmd -tAc \
    "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NULL AND rolled_back_at IS NULL;" \
  2>/dev/null || true
)"

if [[ -n "${FAILED}" ]]; then
  while IFS= read -r name; do
    [[ -z "${name}" ]] && continue
    echo "  --rolled-back ${name}"
    prisma_cmd migrate resolve --rolled-back "${name}"
  done <<< "${FAILED}"
else
  echo "No failed migration rows."
fi

echo ""
echo "=== Step 2: Baseline repo migrations as applied ==="
echo "(Schema already exists from local restore — skip re-running SQL.)"
for dir in "${MIGRATIONS_DIR}"/*/; do
  [[ -d "${dir}" ]] || continue
  name="$(basename "${dir}")"
  if prisma_cmd migrate resolve --applied "${name}" 2>/dev/null; then
    echo "  applied: ${name}"
  else
    echo "  skip: ${name}"
  fi
done

echo ""
echo "=== Step 3: Sync any remaining schema drift ==="
prisma_cmd db push --skip-generate --accept-data-loss

echo ""
echo "=== migrate status ==="
prisma_cmd migrate status || true

echo ""
echo "=== Start API ==="
"${COMPOSE[@]}" up -d api
sleep 5

HOST_API_PORT="${HOST_API_PORT:-3100}"
if curl -sf "http://127.0.0.1:${HOST_API_PORT}/health" >/dev/null; then
  echo "API healthy at http://127.0.0.1:${HOST_API_PORT}/health"
else
  echo "API not healthy yet — check: bash deploy/docker/compose.sh logs api --tail 50"
fi
