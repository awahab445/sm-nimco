#!/bin/sh
set -e

echo "Waiting for database and applying schema..."
attempt=0
max_attempts=30

# migrate diff --exit-code: 0 = database is empty, 2 = it has tables, 1 = cannot connect.
db_state() {
  npx prisma migrate diff --from-url "$DATABASE_URL" --to-empty --exit-code >/dev/null 2>&1
}

until db_state; state=$?; [ "$state" -ne 1 ]; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database not reachable after ${max_attempts} attempts."
    exit 1
  fi
  echo "Database not ready, retrying (${attempt}/${max_attempts})..."
  sleep 2
done

# The migrations do not contain the original base tables, so a fresh database is created
# from schema.prisma (nothing to lose) and every migration is recorded as applied.
if [ "$state" -eq 0 ]; then
  echo "Empty database: creating schema with db push and baselining migrations..."
  npx prisma db push --skip-generate
  for dir in prisma/migrations/*/; do
    npx prisma migrate resolve --applied "$(basename "$dir")"
  done
fi

# Never fall back to db push --accept-data-loss here: a failed migration must stop the API, not drop data.
if ! npx prisma migrate deploy; then
  echo "prisma migrate deploy failed. The API will not start until migrations are fixed."
  echo "See deploy/docker/README.md (P3009) or run: bash deploy/docker/fix-migration-history.sh"
  exit 1
fi

echo "Starting API..."
exec "$@"
