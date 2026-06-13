#!/usr/bin/env bash
# Wrapper for docker compose with production env file.
# Usage: bash deploy/docker/compose.sh up -d
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.prod.yml"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy deploy/env/docker.env.example to deploy/env/docker.env and edit."
  exit 1
fi

exec docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
