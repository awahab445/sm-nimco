#!/usr/bin/env bash
# Restore a pg_dump backup into local host PostgreSQL (manual dev — not Docker).
# Usage: bash deploy/docker/restore-to-host.sh path/to/backup.dump
#
# Uses DATABASE_URL from backend/.env if present, else:
#   postgresql://postgres@localhost:5432/ecommerce_platform
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash deploy/docker/restore-to-host.sh path/to/backup.dump"
  exit 1
fi

DUMP_FILE="$(realpath "$1")"
if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "Backup not found: ${DUMP_FILE}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKEND_ENV="${REPO_ROOT}/backend/.env"

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="ecommerce_platform"
DB_PASSWORD=""

if [[ -f "${BACKEND_ENV}" ]]; then
  # shellcheck source=/dev/null
  source "${BACKEND_ENV}"
  if [[ -n "${DATABASE_URL:-}" && "${DATABASE_URL}" == postgresql://* ]]; then
    # Split on the last @ so passwords may contain @ (e.g. postgres:pass@word@host/db)
    url="${DATABASE_URL#postgresql://}"
    host_part="${url##*@}"
    creds_part="${url%@*}"

    if [[ "${creds_part}" == *:* ]]; then
      DB_USER="${creds_part%%:*}"
      DB_PASSWORD="${creds_part#*:}"
    else
      DB_USER="${creds_part}"
      DB_PASSWORD=""
    fi

    DB_NAME="${host_part#*/}"
    DB_NAME="${DB_NAME%%\?*}"
    host_port="${host_part%%/*}"
    if [[ "${host_port}" == *:* ]]; then
      DB_HOST="${host_port%%:*}"
      DB_PORT="${host_port##*:}"
    else
      DB_HOST="${host_port}"
      DB_PORT="5432"
    fi

    # Decode common URL escapes in credentials
    DB_PASSWORD="${DB_PASSWORD//%40/@}"
    DB_PASSWORD="${DB_PASSWORD//%3A/:}"
  fi
fi

echo "=== Restoring into ${DB_NAME} on ${DB_HOST}:${DB_PORT} as ${DB_USER} ==="

if [[ -n "${DB_PASSWORD}" ]]; then
  export PGPASSWORD="${DB_PASSWORD}"
fi

pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  "${DUMP_FILE}" \
  || echo "Note: some pg_restore warnings are normal."

UPLOADS_ARCHIVE="${DUMP_FILE%.dump}-uploads.tar.gz"
if [[ -f "${UPLOADS_ARCHIVE}" ]]; then
  echo "=== Restoring uploads to backend/uploads ==="
  tar -xzf "${UPLOADS_ARCHIVE}" -C "${REPO_ROOT}/backend"
fi

echo ""
echo "Restore complete. Run migrations if needed:"
echo "  cd backend && npx prisma migrate deploy"
echo "Log in with credentials from the restored database."
