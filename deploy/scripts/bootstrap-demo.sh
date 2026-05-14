#!/usr/bin/env bash
# Run migrations, optional seed, and create first admin user.
# Usage: bash deploy/scripts/bootstrap-demo.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEMO_ENV="${REPO_ROOT}/deploy/env/demo.env"

cd "${REPO_ROOT}/backend"

if [[ ! -f .env ]]; then
  echo "Missing backend/.env — run install-env.sh first"
  exit 1
fi

echo "=== Prisma migrate deploy ==="
npx prisma migrate deploy

if [[ "${SEED_DEMO_DATA:-true}" == "true" ]]; then
  echo "=== Prisma seed ==="
  npx prisma db seed || echo "Seed skipped or failed (may already be seeded)"
fi

if [[ -f "${DEMO_ENV}" ]]; then
  # shellcheck source=/dev/null
  source "${DEMO_ENV}"
fi

# shellcheck source=/dev/null
source "${REPO_ROOT}/backend/.env"

API_URL="http://127.0.0.1:3000"

if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
  if [[ -z "${BOOTSTRAP_TOKEN:-}" ]]; then
    echo "BOOTSTRAP_TOKEN must be set in backend/.env and deploy/env/demo.env"
    exit 1
  fi
  echo "=== Bootstrap first admin ==="
  export ADMIN_EMAIL ADMIN_PASSWORD ADMIN_FIRST_NAME ADMIN_LAST_NAME BOOTSTRAP_TOKEN
  PAYLOAD=$(node -e "
    console.log(JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      bootstrapToken: process.env.BOOTSTRAP_TOKEN,
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || 'User',
    }));
  ")
  curl -sf -X POST "${API_URL}/admin/bootstrap/first-user" \
    -H "Content-Type: application/json" \
    -d "${PAYLOAD}" \
    && echo "Admin user created: ${ADMIN_EMAIL}" \
    || echo "Bootstrap returned error (admin may already exist)"
else
  echo "Set ADMIN_EMAIL and ADMIN_PASSWORD in deploy/env/demo.env to auto-create admin"
fi

echo "Bootstrap complete."
