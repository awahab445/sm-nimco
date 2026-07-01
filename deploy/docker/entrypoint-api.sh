#!/bin/sh
set -e

echo "Waiting for database and applying schema..."
attempt=0
max_attempts=30

schema_sync() {
  if npx prisma migrate deploy; then
    return 0
  fi
  echo "migrate deploy failed; trying db push..."
  npx prisma db push --skip-generate --accept-data-loss
}

until schema_sync; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Schema sync failed after ${max_attempts} attempts."
    exit 1
  fi
  echo "Database not ready, retrying (${attempt}/${max_attempts})..."
  sleep 2
done

echo "Starting API..."
exec "$@"
