#!/usr/bin/env bash
# Export Docker Postgres database to a backup file (run on VPS).
# Usage: bash deploy/docker/export-db.sh [output.dump]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"
OUTPUT="${1:-${REPO_ROOT}/backups/ecommerce-$(date +%Y%m%d-%H%M%S).dump}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

# shellcheck source=/dev/null
source "${ENV_FILE}"

mkdir -p "$(dirname "${OUTPUT}")"

echo "Exporting ${POSTGRES_DB} from ecommerce-postgres → ${OUTPUT}"
docker exec ecommerce-postgres pg_dump \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  -Fc \
  --no-owner \
  --no-acl \
  > "${OUTPUT}"

echo "Done. Size: $(du -h "${OUTPUT}" | cut -f1)"
echo ""
echo "Uploads (run on VPS):"
echo "  docker cp ecommerce-api:/app/uploads ${REPO_ROOT}/backups/uploads"
echo "  tar -czf ${OUTPUT%.dump}-uploads.tar.gz -C ${REPO_ROOT}/backups uploads"
echo "  rm -rf ${REPO_ROOT}/backups/uploads"
echo ""
echo "Download to local machine:"
echo "  scp user@VPS:${OUTPUT} ./backups/"
echo "  scp user@VPS:${OUTPUT%.dump}-uploads.tar.gz ./backups/"
echo ""
echo "Restore locally (host Postgres):"
echo "  bash deploy/docker/restore-to-host.sh ./backups/$(basename "${OUTPUT}")"
