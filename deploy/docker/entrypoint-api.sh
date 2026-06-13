#!/bin/sh
set -e

echo "Waiting for database and syncing schema..."
attempt=0
max_attempts=30
until npx prisma db push --skip-generate; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database schema sync failed after ${max_attempts} attempts."
    exit 1
  fi
  echo "Database not ready, retrying (${attempt}/${max_attempts})..."
  sleep 2
done

echo "Starting API..."
exec "$@"
