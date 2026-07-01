#!/usr/bin/env bash
# Run seed and create first admin user after containers are up.
# Usage: bash deploy/docker/bootstrap.sh
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

if [[ "${SKIP_BOOTSTRAP:-}" == "true" ]]; then
  echo "SKIP_BOOTSTRAP=true — skipping seed and first admin."
  exit 0
fi

HOST_API_PORT="${HOST_API_PORT:-3100}"
API_HEALTH_URL="http://127.0.0.1:${HOST_API_PORT}/health"

COMPOSE=(docker compose --env-file "${ENV_FILE}" -f "${REPO_ROOT}/docker-compose.prod.yml")

echo "=== Waiting for API health ==="
for i in $(seq 1 30); do
  if curl -sf "${API_HEALTH_URL}" >/dev/null 2>&1; then
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "API not responding on ${API_HEALTH_URL}"
    exit 1
  fi
  sleep 2
done

if [[ "${SEED_DEMO_DATA:-true}" == "true" ]]; then
  echo "=== Prisma seed ==="
  "${COMPOSE[@]}" exec -T api npx prisma db seed \
    || echo "Seed skipped or failed (may already be seeded)"
fi

if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
  if [[ -z "${BOOTSTRAP_TOKEN:-}" ]]; then
    echo "BOOTSTRAP_TOKEN must be set in deploy/env/docker.env"
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
  curl -sf -X POST "http://127.0.0.1:${HOST_API_PORT}/admin/bootstrap/first-user" \
    -H "Content-Type: application/json" \
    -d "${PAYLOAD}" \
    && echo "Admin user created: ${ADMIN_EMAIL}" \
    || echo "Bootstrap returned error (admin may already exist)"
else
  echo "Set ADMIN_EMAIL and ADMIN_PASSWORD in deploy/env/docker.env to auto-create admin"
fi

echo "Bootstrap complete."
