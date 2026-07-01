#!/usr/bin/env bash
# Install daily backup cron (02:30 UTC) for DB + uploads.
# Usage: bash deploy/docker/install-backup-cron.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_SCRIPT="${REPO_ROOT}/deploy/docker/backup.sh"
CRON_LINE="30 2 * * * cd ${REPO_ROOT} && bash ${BACKUP_SCRIPT} >> ${REPO_ROOT}/backups/backup.log 2>&1"

mkdir -p "${REPO_ROOT}/backups"

if crontab -l 2>/dev/null | grep -Fq "${BACKUP_SCRIPT}"; then
  echo "Backup cron already installed."
  exit 0
fi

(crontab -l 2>/dev/null; echo "${CRON_LINE}") | crontab -

echo "Installed daily backup cron (02:30 UTC):"
echo "  ${CRON_LINE}"
echo ""
echo "Logs: ${REPO_ROOT}/backups/backup.log"
echo "Retention: prune old files manually or add a cleanup script."
