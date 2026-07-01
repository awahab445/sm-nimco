#!/usr/bin/env bash
# Full backup: Postgres dump + uploads archive.
# Usage: bash deploy/docker/backup.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${REPO_ROOT}/backups"
DUMP="${BACKUP_DIR}/ecommerce-${TIMESTAMP}.dump"
UPLOADS_TAR="${BACKUP_DIR}/ecommerce-${TIMESTAMP}-uploads.tar.gz"

mkdir -p "${BACKUP_DIR}"

bash "${SCRIPT_DIR}/export-db.sh" "${DUMP}"

echo "=== Backing up uploads ==="
UPLOADS_TMP="${BACKUP_DIR}/uploads-${TIMESTAMP}"
docker cp ecommerce-api:/app/uploads "${UPLOADS_TMP}"
tar -czf "${UPLOADS_TAR}" -C "${BACKUP_DIR}" "uploads-${TIMESTAMP}"
rm -rf "${UPLOADS_TMP}"

echo ""
echo "Backup complete:"
echo "  ${DUMP}"
echo "  ${UPLOADS_TAR}"
