#!/usr/bin/env bash
# Shared: load host Postgres connection from backend/.env DATABASE_URL
# Usage: source deploy/docker/lib/pg-host-env.sh
set -euo pipefail

_pg_lib_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
_pg_lib_backend_env="${_pg_lib_repo_root}/backend/.env"

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="ecommerce_platform"
DB_PASSWORD=""

if [[ -f "${_pg_lib_backend_env}" ]]; then
  # shellcheck source=/dev/null
  source "${_pg_lib_backend_env}"
  if [[ -n "${DATABASE_URL:-}" && "${DATABASE_URL}" == postgresql://* ]]; then
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

    DB_PASSWORD="${DB_PASSWORD//%40/@}"
    DB_PASSWORD="${DB_PASSWORD//%3A/:}"
  fi
fi
