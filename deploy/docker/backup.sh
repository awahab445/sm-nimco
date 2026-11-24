#!/usr/bin/env bash
# Full backup: Postgres dump + uploads archive + WhatsApp session.
# Usage: bash deploy/docker/backup.sh
# Keeps BACKUP_RETENTION_DAYS (default 14) days of these backup files.
set -euo pipefail
# Backups contain customer data and the WhatsApp login: owner-only files.
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${REPO_ROOT}/backups"
DUMP="${BACKUP_DIR}/ecommerce-${TIMESTAMP}.dump"
UPLOADS_TAR="${BACKUP_DIR}/ecommerce-${TIMESTAMP}-uploads.tar.gz"
WHATSAPP_TAR="${BACKUP_DIR}/ecommerce-${TIMESTAMP}-whatsapp.tar.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "${BACKUP_DIR}"

bash "${SCRIPT_DIR}/export-db.sh" "${DUMP}"

echo "=== Backing up uploads ==="
UPLOADS_TMP="${BACKUP_DIR}/uploads-${TIMESTAMP}"
docker cp ecommerce-api:/app/uploads "${UPLOADS_TMP}"
tar -czf "${UPLOADS_TAR}" -C "${BACKUP_DIR}" "uploads-${TIMESTAMP}"
rm -rf "${UPLOADS_TMP}"

echo "=== Backing up WhatsApp session ==="
WA_TMP="${BACKUP_DIR}/whatsapp-${TIMESTAMP}"
if docker cp ecommerce-api:/app/whatsapp_session "${WA_TMP}" 2>/dev/null; then
  tar -czf "${WHATSAPP_TAR}" -C "${BACKUP_DIR}" "whatsapp-${TIMESTAMP}"
  rm -rf "${WA_TMP}"
else
  echo "No WhatsApp session in ecommerce-api (not paired yet) — skipped."
  WHATSAPP_TAR=""
fi

echo "=== Pruning backups older than ${RETENTION_DAYS} days ==="
# Only files this script creates; never other dumps or folders in backups/.
find "${BACKUP_DIR}" -maxdepth 1 -type f -mtime "+${RETENTION_DAYS}" \
  \( -name 'ecommerce-*.dump' -o -name 'ecommerce-*-uploads.tar.gz' -o -name 'ecommerce-*-whatsapp.tar.gz' \) \
  -print -delete

echo ""
echo "Backup complete:"
echo "  ${DUMP}"
echo "  ${UPLOADS_TAR}"
[[ -n "${WHATSAPP_TAR}" ]] && echo "  ${WHATSAPP_TAR}"
echo ""
echo "These files are still on this server. Copy them off-server (see deploy/docker/README.md → Backups)."
