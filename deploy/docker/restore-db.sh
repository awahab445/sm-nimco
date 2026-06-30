#!/usr/bin/env bash
# Replace Docker Postgres data with a pg_dump backup.
# Usage: bash deploy/docker/restore-db.sh path/to/backup.dump
#
# Also restores backend/uploads if a matching *-uploads.tar.gz exists beside the dump.
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash deploy/docker/restore-db.sh path/to/backup.dump"
  exit 1
fi

DUMP_FILE="$(realpath "$1")"
if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "Backup not found: ${DUMP_FILE}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"
COMPOSE=(bash "${SCRIPT_DIR}/compose.sh")
UPLOADS_ARCHIVE="${DUMP_FILE%.dump}-uploads.tar.gz"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

# shellcheck source=/dev/null
source "${ENV_FILE}"

echo "=== Stopping app containers (postgres stays up) ==="
"${COMPOSE[@]}" stop api storefront admin 2>/dev/null || true

echo "=== Restoring database ${POSTGRES_DB} ==="
docker exec -i ecommerce-postgres pg_restore \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  < "${DUMP_FILE}" \
  || echo "Note: some pg_restore warnings are normal (e.g. object already exists)."

if [[ -f "${UPLOADS_ARCHIVE}" ]]; then
  bash "${SCRIPT_DIR}/restore-uploads.sh" "${UPLOADS_ARCHIVE}"
elif [[ -d "${REPO_ROOT}/backend/uploads" ]] && [[ -n "$(ls -A "${REPO_ROOT}/backend/uploads" 2>/dev/null)" ]]; then
  echo "=== Syncing backend/uploads from repo checkout ==="
  TMP_TAR="$(mktemp /tmp/uploads-sync-XXXXXX.tar.gz)"
  tar -czf "${TMP_TAR}" -C "${REPO_ROOT}/backend" uploads
  bash "${SCRIPT_DIR}/restore-uploads.sh" "${TMP_TAR}"
  rm -f "${TMP_TAR}"
else
  "${COMPOSE[@]}" up -d api
fi

echo "=== Starting app containers ==="
"${COMPOSE[@]}" up -d api storefront admin

HOST_API_PORT="${HOST_API_PORT:-3100}"
echo ""
echo "Restore complete. API: http://127.0.0.1:${HOST_API_PORT}/health"
echo ""
echo "Set SKIP_BOOTSTRAP=true in docker.env — do not run bootstrap.sh after a restore."
echo "Log in with credentials from the restored database."
