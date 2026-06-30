#!/usr/bin/env bash
# Restore product/CMS images into the Docker uploads volume.
# Handles archives from export-from-host.sh (uploads/...) and backup.sh (uploads-TIMESTAMP/...).
#
# Usage: bash deploy/docker/restore-uploads.sh path/to/archive.tar.gz
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash deploy/docker/restore-uploads.sh path/to/archive.tar.gz"
  exit 1
fi

ARCHIVE="$(realpath "$1")"
if [[ ! -f "${ARCHIVE}" ]]; then
  echo "Archive not found: ${ARCHIVE}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE=(bash "${SCRIPT_DIR}/compose.sh")

VOLUME_NAME="$(docker volume ls -q --filter name=ecommerce_uploads | head -1)"
if [[ -z "${VOLUME_NAME}" ]]; then
  echo "ecommerce_uploads volume not found. Start stack first:"
  echo "  bash deploy/docker/compose.sh up -d postgres redis api"
  exit 1
fi

echo "=== Restoring uploads into volume ${VOLUME_NAME} ==="
echo "Archive: ${ARCHIVE}"

# Stop API so it does not hold stale file handles during restore.
"${COMPOSE[@]}" stop api 2>/dev/null || true

docker run --rm \
  -v "${VOLUME_NAME}:/vol" \
  -v "${ARCHIVE}:/archive.tar.gz:ro" \
  alpine:3.20 sh -ce '
    set -e
    rm -rf /vol/*
    mkdir -p /tmp/extract
    tar -xzf /archive.tar.gz -C /tmp/extract
    if [ -d /tmp/extract/uploads ]; then
      cp -a /tmp/extract/uploads/. /vol/
    else
      inner="$(find /tmp/extract -maxdepth 1 -mindepth 1 -type d | head -1)"
      if [ -z "${inner}" ]; then
        echo "Archive has no uploads directory."
        exit 1
      fi
      cp -a "${inner}/." /vol/
    fi
    echo "Restored directories:"
    ls -la /vol
    if [ -d /vol/products ]; then
      echo "Product images: $(find /vol/products -type f | wc -l) files"
    fi
  '

"${COMPOSE[@]}" up -d api

HOST_API_PORT="${HOST_API_PORT:-3100}"
if [[ -f "${REPO_ROOT}/deploy/env/docker.env" ]]; then
  # shellcheck source=/dev/null
  source "${REPO_ROOT}/deploy/env/docker.env"
  HOST_API_PORT="${HOST_API_PORT:-3100}"
fi

echo ""
echo "Uploads restore complete."
echo "Test: curl -I http://127.0.0.1:${HOST_API_PORT}/uploads/products/<filename>.jpeg"
