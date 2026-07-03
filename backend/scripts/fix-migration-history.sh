#!/usr/bin/env bash
# Fix Prisma P3009 on local host Postgres (dev).
#
# Error:
#   migrate found failed migrations ... 20250308000000_add_customer_password_hash
#
# Usage (from repo root or backend/):
#   bash backend/scripts/fix-migration-history.sh
#   cd backend && npm run prisma:fix-migrations
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MIGRATIONS_DIR="${BACKEND_ROOT}/prisma/migrations"

cd "${BACKEND_ROOT}"

if [[ ! -f .env ]]; then
  echo "Missing backend/.env — copy from .env.example first."
  exit 1
fi

prisma() {
  npx prisma "$@"
}

echo "=== migrate status (before) ==="
prisma migrate status || true

echo ""
echo "=== Step 1: Resolve failed migrations ==="
# Known orphan from old history (not in repo migrations folder)
if prisma migrate resolve --rolled-back 20250308000000_add_customer_password_hash 2>/dev/null; then
  echo "  rolled back: 20250308000000_add_customer_password_hash"
fi

# Any other failed rows (finished_at IS NULL, not rolled back)
if command -v psql >/dev/null 2>&1; then
  # shellcheck source=/dev/null
  source .env
  if [[ -n "${DATABASE_URL:-}" ]]; then
    FAILED="$(psql "${DATABASE_URL}" -tAc \
      "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NULL AND rolled_back_at IS NULL;" \
      2>/dev/null || true)"
    if [[ -n "${FAILED}" ]]; then
      while IFS= read -r name; do
        [[ -z "${name}" ]] && continue
        echo "  rolled back: ${name}"
        prisma migrate resolve --rolled-back "${name}"
      done <<< "${FAILED}"
    fi
  fi
fi

echo ""
echo "=== Step 2: Baseline repo migrations as applied ==="
echo "(Use when tables/columns already exist — e.g. after restore or db push.)"
for dir in "${MIGRATIONS_DIR}"/*/; do
  [[ -d "${dir}" ]] || continue
  name="$(basename "${dir}")"
  if prisma migrate resolve --applied "${name}" 2>/dev/null; then
    echo "  applied: ${name}"
  else
    echo "  skip: ${name}"
  fi
done

echo ""
echo "=== Step 3: Sync schema drift ==="
prisma db push --accept-data-loss

echo ""
echo "=== migrate status (after) ==="
prisma migrate status

echo ""
echo "Done. Start backend: npm run start:dev"
